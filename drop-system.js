const {
  ActionRowBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
  MessageFlags,
} = require('discord.js');

const fs = require('fs');
require('dotenv').config();

const DROP_DURATION_MS = 60 * 1000; // 1 minuto
const PRIZE_ROLE_DURATION_MS = 5 * 24 * 60 * 60 * 1000; // 5 dias
const PRIZE_EXPIRATIONS_FILE = './drop-role-expirations.json';

const AUTHORIZED_DROP_ROLE_IDS = [
  '1492378748610412575',
  '1491081676158275615',
  '1491436528725917888',
  '1491436756678217819',
  '1491436904741077103',
  '1491437519760261178',
  '1491438613379153990',
  '1491438424685805608',
];

const DROP_PRIZE_ROLES = {
  scrim_hoster: '1491442295898243072',
  vip_bronze: '1492271517508178081',
  pic_perm: '1491772794407751941',
};

const DEFAULT_DROP_QUESTIONS = [ /* ... suas perguntas permanecem iguais ... */ ];

function normalize(input) {
  return (input || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ==================== EMBEDS ====================
function buildDropEmbed(question) {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎁 DROP RÁPIDO!')
    .setDescription(
      `**${question}**\n\n` +
      'Responda no chat em até **1 minuto** para ganhar um cargo\n' +
      '*(Scrim Hoster, Vip Bronze, Pic Perm - 5 Dias)*'
    )
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function buildWinnerEmbed(winnerId) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎉 TEMOS UM VENCEDOR!')
    .setDescription(`Parabéns <@${winnerId}>! Você acertou a resposta e ganhou o drop.\nVerifique suas DMs para escolher seu prêmio.`)
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function buildWinnerDmEmbed() {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎁 Você Venceu o Drop!')
    .setDescription('Você respondeu corretamente no chat e garantiu seu prêmio. Escolha abaixo qual cargo você deseja receber no servidor.')
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function buildTimeoutEmbed(answer) {
  return new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('⌛ Drop encerrado')
    .setDescription(`Ninguém acertou a tempo. Resposta correta: **${answer}**.`)
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function hasAuthorizedDropRole(member) {
  if (!member?.roles?.cache) return false;
  return AUTHORIZED_DROP_ROLE_IDS.some(roleId => member.roles.cache.has(roleId));
}

// ==================== EXPIRAÇÕES (mantidas iguais) ====================
function readPrizeExpirations() {
  if (!fs.existsSync(PRIZE_EXPIRATIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(PRIZE_EXPIRATIONS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler expirações:', err);
    return [];
  }
}

function writePrizeExpirations(entries) {
  try {
    fs.writeFileSync(PRIZE_EXPIRATIONS_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('Erro ao salvar expirações:', err);
  }
}

/**
 * Registra o sistema de Drops com !drop + Modal
 */
function registerDropSystem(client, options) {
  const {
    defaultChannelId = '1491433665862045897',
    canStartDrop,
  } = options || {};

  const token = process.env.DISCORD_TOKEN;
  const guildId = process.env.GUILD_ID;

  console.log('\n🔍 [DEBUG] DISCORD_TOKEN:', token ? '✅ Encontrado' : '❌ NÃO ENCONTRADO');
  console.log('🔍 [DEBUG] GUILD_ID:', guildId || '❌ NÃO ENCONTRADO');

  if (!token) throw new Error('❌ DISCORD_TOKEN não encontrado no .env!');
  if (!guildId) throw new Error('❌ GUILD_ID não encontrado no .env!');

  let activeDrop = null;
  const pendingPrizeSelections = new Map();
  const expirationTimers = new Map();

  // ==================== FUNÇÕES INTERNAS (mantidas) ====================
  function keyForExpiration(entry) {
    return `${entry.guildId}:${entry.userId}:${entry.roleId}`;
  }

  function addOrReplaceExpiration(entry) {
    const all = readPrizeExpirations().filter(
      x => !(x.guildId === entry.guildId && x.userId === entry.userId && x.roleId === entry.roleId)
    );
    all.push(entry);
    writePrizeExpirations(all);
  }

  function removeExpiration(entry) {
    const all = readPrizeExpirations().filter(
      x => !(x.guildId === entry.guildId && x.userId === entry.userId && x.roleId === entry.roleId)
    );
    writePrizeExpirations(all);
  }

  function clearTimer(entry) {
    const key = keyForExpiration(entry);
    const timer = expirationTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      expirationTimers.delete(key);
    }
  }

  function schedulePrizeRoleRemoval(entry) {
    clearTimer(entry);
    const remaining = new Date(entry.expiresAt).getTime() - Date.now();
    if (remaining <= 0) return removePrizeRole(entry).catch(() => {});

    const timer = setTimeout(() => removePrizeRole(entry).catch(() => {}), remaining);
    expirationTimers.set(keyForExpiration(entry), timer);
  }

  async function removePrizeRole(entry) {
    clearTimer(entry);
    removeExpiration(entry);
    try {
      const guild = client.guilds.cache.get(entry.guildId);
      if (!guild) return;
      const member = await guild.members.fetch(entry.userId).catch(() => null);
      if (member?.roles.cache.has(entry.roleId)) {
        await member.roles.remove(entry.roleId);
      }
    } catch (err) {
      console.error('Erro ao remover cargo:', err);
    }
  }

  // ==================== FUNÇÃO PARA ENVIAR DM DO PRÊMIO ====================
  async function sendPrizeDm(guild, user) {
    const dmEmbed = buildWinnerDmEmbed();
    const selectId = `drop_prize_${guild.id}_${user.id}_${Date.now()}`;

    const select = new StringSelectMenuBuilder()
      .setCustomId(selectId)
      .setPlaceholder('Escolha seu cargo VIP (Válido por 5 dias)')
      .addOptions([
        { label: 'Scrim Hoster', description: 'Receber cargo Scrim Hoster', value: 'scrim_hoster' },
        { label: 'VIP Bronze', description: 'Receber cargo VIP Bronze', value: 'vip_bronze' },
        { label: 'Pic Perm', description: 'Receber cargo Pic Perm', value: 'pic_perm' },
      ]);

    const row = new ActionRowBuilder().addComponents(select);
    await user.send({ embeds: [dmEmbed], components: [row] }).catch(() => {});

    pendingPrizeSelections.set(selectId, { guildId: guild.id, userId: user.id });
  }

  async function startDrop(channel, actorTag, customQuestion, customAnswer) {
    if (activeDrop) {
      await channel.send('⚠️ Já existe um drop ativo no momento.').catch(() => {});
      return;
    }

    const picked = customQuestion
      ? { question: customQuestion, answer: customAnswer, acceptedAnswers: [customAnswer] }
      : pickRandom(DEFAULT_DROP_QUESTIONS);

    const accepted = new Set([picked.answer, ...(picked.acceptedAnswers || [])].map(normalize));

    await channel.send({ embeds: [buildDropEmbed(picked.question)] });

    const timeout = setTimeout(async () => {
      if (!activeDrop) return;
      await channel.send({ embeds: [buildTimeoutEmbed(picked.answer)] }).catch(() => {});
      activeDrop = null;
    }, DROP_DURATION_MS);

    activeDrop = { 
      channelId: channel.id, 
      accepted, 
      answer: picked.answer, 
      timeout, 
      startedBy: actorTag 
    };

    console.log(`🎁 Drop iniciado por ${actorTag} | Pergunta: ${picked.question}`);
  }

  // ==================== COMANDO !drop + BOTÃO ====================
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.trim().toLowerCase().startsWith('!drop')) return;

    if (!hasAuthorizedDropRole(message.member) && 
        !(typeof canStartDrop === 'function' && canStartDrop(message.member))) {
      return message.reply('❌ Você não tem permissão para iniciar drops.').catch(() => {});
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('open_drop_modal')
        .setLabel('Criar Drop')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🎁')
    );

    await message.reply({
      content: '**🎁 Criar Novo Drop**\nClique no botão abaixo e preencha a pergunta e a resposta:',
      components: [row]
    });
  });

  // ==================== INTERACTIONS (Botão + Modal + Prêmio) ====================
  client.on('interactionCreate', async (interaction) => {
    // ==================== BOTÃO → ABRIR MODAL ====================
    if (interaction.isButton() && interaction.customId === 'open_drop_modal') {
      const modal = new ModalBuilder()
        .setCustomId('drop_create_modal')
        .setTitle('🎁 Criar Drop Personalizado');

      const questionInput = new TextInputBuilder()
        .setCustomId('question')
        .setLabel('Pergunta do Drop')
        .setStyle(TextInputStyle.Paragraph)
        .setPlaceholder('Ex: Qual é a capital do Brasil?')
        .setRequired(true)
        .setMaxLength(300);

      const answerInput = new TextInputBuilder()
        .setCustomId('answer')
        .setLabel('Resposta Correta')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Ex: brasília')
        .setRequired(true)
        .setMaxLength(100);

      const firstRow = new ActionRowBuilder().addComponents(questionInput);
      const secondRow = new ActionRowBuilder().addComponents(answerInput);

      modal.addComponents(firstRow, secondRow);

      await interaction.showModal(modal);
      return;
    }

    // ==================== MODAL SUBMIT ====================
    if (interaction.isModalSubmit() && interaction.customId === 'drop_create_modal') {
      const question = interaction.fields.getTextInputValue('question').trim();
      const answer = interaction.fields.getTextInputValue('answer').trim();

      if (!question || !answer) {
        return interaction.reply({ content: '❌ Pergunta e resposta são obrigatórias!', ephemeral: true });
      }

      const channel = interaction.guild.channels.cache.get(defaultChannelId) || interaction.channel;

      await interaction.reply({ 
        content: '✅ Drop sendo criado...', 
        ephemeral: true 
      });

      await startDrop(channel, interaction.user.tag, question, answer);
      return;
    }

    // ==================== MENU DE PRÊMIO ====================
    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('drop_prize_')) {
      const selection = pendingPrizeSelections.get(interaction.customId);
      if (!selection || interaction.user.id !== selection.userId) {
        return interaction.reply({ content: '❌ Você não pode usar este menu.', flags: MessageFlags.Ephemeral });
      }

      const selected = interaction.values[0];
      const roleId = DROP_PRIZE_ROLES[selected];
      const guild = client.guilds.cache.get(selection.guildId);
      const member = await guild?.members.fetch(interaction.user.id).catch(() => null);

      if (!guild || !roleId || !member) {
        return interaction.reply({ content: '❌ Erro ao processar o prêmio.', flags: MessageFlags.Ephemeral });
      }

      await member.roles.add(roleId).catch(() => {});

      const expirationEntry = {
        guildId: guild.id,
        userId: interaction.user.id,
        roleId,
        expiresAt: new Date(Date.now() + PRIZE_ROLE_DURATION_MS).toISOString(),
      };

      addOrReplaceExpiration(expirationEntry);
      schedulePrizeRoleRemoval(expirationEntry);
      pendingPrizeSelections.delete(interaction.customId);

      await interaction.update({ content: '✅ Prêmio resgatado com sucesso!', embeds: [], components: [] });
    }
  });

  // ==================== RESPOSTA DO DROP (mensagens no chat) ====================
  client.on('messageCreate', async (message) => {
    if (!activeDrop || message.author.bot || message.channelId !== activeDrop.channelId) return;

    if (!activeDrop.accepted.has(normalize(message.content))) return;

    clearTimeout(activeDrop.timeout);
    await message.channel.send({ embeds: [buildWinnerEmbed(message.author.id)] });

    try {
      await sendPrizeDm(message.guild, message.author);
    } catch (err) {
      await message.channel.send({
        content: `⚠️ <@${message.author.id}>, não consegui te enviar DM. Abra sua DM e fale com a staff.`
      }).catch(() => {});
    }

    activeDrop = null;
  });

  // ==================== READY ====================
  client.once('ready', async () => {
    console.log('\n┌────────────────────────────────────────────┐');
    console.log('│         🎁 SISTEMA DE DROPS INICIADO       │');
    console.log('└────────────────────────────────────────────┘');
    console.log(`🤖 Bot: ${client.user.tag}`);
    console.log(`🏰 Guild ID: ${guildId}`);
    console.log(`📍 Canal padrão: ${defaultChannelId}`);

    const expirations = readPrizeExpirations();
    for (const entry of expirations) schedulePrizeRoleRemoval(entry);
    console.log(`📦 ${expirations.length} cargo(s) com expiração carregados.`);

    console.log('\n✅ Sistema de Drops carregado com sucesso!');
    console.log('📌 Use: **!drop** para abrir o painel de criação.\n');
  });
}

module.exports = {
  registerDropSystem,
  DROP_DURATION_MS,
  PRIZE_ROLE_DURATION_MS,
};