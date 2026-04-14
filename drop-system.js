const {
  ActionRowBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');
const fs = require('fs');

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

const DEFAULT_DROP_QUESTIONS = [
  {
    question: 'Qual o osso mais longo do corpo humano?',
    answer: 'femur',
    acceptedAnswers: ['femur', 'fêmur'],
  },
  {
    question: 'Qual planeta é conhecido como planeta vermelho?',
    answer: 'marte',
    acceptedAnswers: ['marte'],
  },
  {
    question: 'Quantos segundos tem 1 minuto?',
    answer: '60',
    acceptedAnswers: ['60', 'sessenta'],
  },
  {
    question: 'Qual é a capital do Brasil?',
    answer: 'brasília',
  },
  {
    question: 'Qual é o maior oceano do planeta?',
    answer: 'pacífico',
  },
  {
    question: 'Quanto é 7 x 8?',
    answer: '56',
    acceptedAnswers: ['56', 'cinquenta e seis'],
  },
  {
    question: 'Qual gás as plantas absorvem da atmosfera?',
    answer: 'dióxido de carbono',
    acceptedAnswers: ['dióxido de carbono', 'gas carbonico', 'gás carbônico', 'co2'],
  },
  {
    question: 'Qual é o planeta mais próximo do Sol?',
    answer: 'mercúrio',
  },
  {
    question: 'Em que continente fica o Egito?',
    answer: 'áfrica',
  },
  {
    question: 'Qual é o resultado de 100 ÷ 4?',
    answer: '25',
    acceptedAnswers: ['25', 'vinte e cinco'],
  },
  {
    question: 'Qual linguagem roda no Node.js?',
    answer: 'javascript',
    acceptedAnswers: ['javascript', 'js'],
  },
  {
    question: 'Qual é o metal líquido à temperatura ambiente?',
    answer: 'mercúrio',
  },
  {
    question: 'Qual é o plural de "cidadão"?',
    answer: 'cidadãos',
    acceptedAnswers: ['cidadãos', 'cidadaos'],
  },
];

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

function buildDropEmbed(question) {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎁 DROP RÁPIDO!')
    .setDescription(
      `**${question}**\n\n` +
      'Responda no chat em até **1 minuto** para ganhar um cargo\n' +
      '*(Scrim Hoster, Vip Bronze, Pic Perm. [5 Dias])*'
    )
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function buildWinnerEmbed(winnerId) {
  return new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎉 TEMOS UM VENCEDOR!')
    .setDescription(
      `Parabéns <@${winnerId}>! Você acertou a resposta e ganhou o drop.\n` +
      'Verifique suas DMs para escolher seu prêmio.'
    )
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();
}

function buildWinnerDmEmbed() {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎁 Você Venceu o Drop!')
    .setDescription(
      'Você respondeu corretamente no chat e garantiu seu prêmio. ' +
        'Escolha abaixo qual cargo você deseja receber no servidor.'
    )
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
  if (!member || !member.roles || !member.roles.cache) return false;
  return AUTHORIZED_DROP_ROLE_IDS.some((roleId) => member.roles.cache.has(roleId));
}

function readPrizeExpirations() {
  if (!fs.existsSync(PRIZE_EXPIRATIONS_FILE)) return [];
  try {
    const raw = fs.readFileSync(PRIZE_EXPIRATIONS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler expirações de cargos do drop:', err);
    return [];
  }
}

function writePrizeExpirations(entries) {
  try {
    fs.writeFileSync(PRIZE_EXPIRATIONS_FILE, JSON.stringify(entries, null, 2));
  } catch (err) {
    console.error('Erro ao salvar expirações de cargos do drop:', err);
  }
}

/**
 * Integra sistema de drops ao bot atual.
 * @param {import('discord.js').Client} client
 * @param {{
 *   commands: any[],
 *   defaultChannelId: string,
 *   canStartDrop: (member: any) => boolean,
 *   guildId?: string,
 *   questions?: Array<{question:string,answer:string,acceptedAnswers?:string[]}>
 * }} options
 */
function registerDropSystem(client, options) {
  const {
    commands,
    defaultChannelId,
    canStartDrop,
    guildId,
    questions = DEFAULT_DROP_QUESTIONS,
  } = options;

  let activeDrop = null;
  const pendingPrizeSelections = new Map();
  const expirationTimers = new Map();

  function keyForExpiration(entry) {
    return `${entry.guildId}:${entry.userId}:${entry.roleId}`;
  }

  function addOrReplaceExpiration(entry) {
    const all = readPrizeExpirations().filter(
      (x) => !(x.guildId === entry.guildId && x.userId === entry.userId && x.roleId === entry.roleId)
    );
    all.push(entry);
    writePrizeExpirations(all);
  }

  function removeExpiration(entry) {
    const all = readPrizeExpirations().filter(
      (x) => !(x.guildId === entry.guildId && x.userId === entry.userId && x.roleId === entry.roleId)
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
    if (remaining <= 0) {
      removePrizeRole(entry).catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      removePrizeRole(entry).catch(() => {});
    }, remaining);

    expirationTimers.set(keyForExpiration(entry), timer);
  }

  async function removePrizeRole(entry) {
    clearTimer(entry);
    removeExpiration(entry);

    try {
      const guild = client.guilds.cache.get(entry.guildId);
      if (!guild) return;

      const member = await guild.members.fetch(entry.userId).catch(() => null);
      if (!member) return;

      if (member.roles.cache.has(entry.roleId)) {
        await member.roles.remove(entry.roleId).catch(() => null);
      }
    } catch (err) {
      console.error('Erro ao remover cargo expirado do drop:', err);
    }
  }

  const dropCommand = new SlashCommandBuilder()
    .setName('drop')
    .setDescription('Inicia um drop manual de pergunta e resposta')
    .addStringOption((opt) =>
      opt
        .setName('pergunta')
        .setDescription('Pergunta do drop (opcional, usa aleatória se vazio)')
        .setRequired(false)
    )
    .addStringOption((opt) =>
      opt
        .setName('resposta')
        .setDescription('Resposta correta (obrigatória se definir pergunta)')
        .setRequired(false)
    );

  commands.push(dropCommand);

  async function sendPrizeDm(guild, user) {
    const dmEmbed = buildWinnerDmEmbed();
    const selectId = `drop_prize_${guild.id}_${user.id}_${Date.now()}`;
    const select = new StringSelectMenuBuilder()
      .setCustomId(selectId)
      .setPlaceholder('Escolha seu cargo VIP (Válido por 5 dias)')
      .addOptions(
        {
          label: 'Scrim Hoster',
          description: 'Receber cargo Scrim Hoster',
          value: 'scrim_hoster',
        },
        {
          label: 'VIP Bronze',
          description: 'Receber cargo VIP Bronze',
          value: 'vip_bronze',
        },
        {
          label: 'Pic Perm',
          description: 'Receber cargo Pic Perm',
          value: 'pic_perm',
        }
      );

    const row = new ActionRowBuilder().addComponents(select);
    await user.send({ embeds: [dmEmbed], components: [row] });

    pendingPrizeSelections.set(selectId, {
      guildId: guild.id,
      userId: user.id,
      createdAt: Date.now(),
    });
  }

  async function startDrop(channel, actorTag, customQuestion, customAnswer) {
    if (activeDrop) {
      return { ok: false, reason: 'Já existe um drop ativo neste momento.' };
    }

    const picked = customQuestion
      ? {
          question: customQuestion,
          answer: customAnswer,
          acceptedAnswers: [customAnswer],
        }
      : pickRandom(questions);

    const accepted = new Set([picked.answer, ...(picked.acceptedAnswers || [])].map(normalize));

    const embed = buildDropEmbed(picked.question);
    await channel.send({ embeds: [embed] });

    const timeout = setTimeout(async () => {
      if (!activeDrop) return;
      const timeoutEmbed = buildTimeoutEmbed(picked.answer);
      await channel.send({ embeds: [timeoutEmbed] }).catch(() => {});
      activeDrop = null;
    }, DROP_DURATION_MS);

    activeDrop = {
      channelId: channel.id,
      accepted,
      answer: picked.answer,
      timeout,
      startedBy: actorTag,
      startedAt: Date.now(),
    };

    return { ok: true };
  }

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (interaction.commandName !== 'drop') return;

    if (!hasAuthorizedDropRole(interaction.member) && !canStartDrop(interaction.member)) {
      await interaction.reply({
        content: '❌ Você não tem permissão para iniciar drops.',
        ephemeral: true,
      });
      return;
    }

    const question = interaction.options.getString('pergunta');
    const answer = interaction.options.getString('resposta');

    if ((question && !answer) || (!question && answer)) {
      await interaction.reply({
        content: '❌ Se definir pergunta manual, também precisa definir a resposta.',
        ephemeral: true,
      });
      return;
    }

    const channel = interaction.guild.channels.cache.get(defaultChannelId) || interaction.channel;

    const result = await startDrop(channel, interaction.user.tag, question, answer);
    if (!result.ok) {
      await interaction.reply({ content: `⚠️ ${result.reason}`, ephemeral: true });
      return;
    }

    await interaction.reply({ content: '✅ Drop iniciado com sucesso!', ephemeral: true });
  });

  client.on('messageCreate', async (message) => {
    if (!activeDrop) return;
    if (message.author.bot) return;
    if (message.channelId !== activeDrop.channelId) return;

    const guess = normalize(message.content);
    if (!activeDrop.accepted.has(guess)) return;

    clearTimeout(activeDrop.timeout);
    const winnerEmbed = buildWinnerEmbed(message.author.id);
    await message.channel.send({ embeds: [winnerEmbed] }).catch(() => {});

    try {
      await sendPrizeDm(message.guild, message.author);
    } catch (err) {
      await message.channel
        .send({
          content: `⚠️ <@${message.author.id}>, não consegui te enviar DM. Abra sua DM e fale com a staff para receber o prêmio.`,
        })
        .catch(() => {});
    }

    activeDrop = null;
  });

  client.on('interactionCreate', async (interaction) => {
    if (!interaction.isStringSelectMenu()) return;
    if (!interaction.customId.startsWith('drop_prize_')) return;

    const selection = pendingPrizeSelections.get(interaction.customId);
    if (!selection) {
      await interaction.reply({
        content: '❌ Este prêmio já foi processado ou expirou.',
        ephemeral: true,
      });
      return;
    }

    if (interaction.user.id !== selection.userId) {
      await interaction.reply({
        content: '❌ Apenas o vencedor pode escolher este prêmio.',
        ephemeral: true,
      });
      return;
    }

    const selected = interaction.values[0];
    const roleId = DROP_PRIZE_ROLES[selected];
    const guild = client.guilds.cache.get(selection.guildId);
    if (!guild || !roleId) {
      await interaction.reply({
        content: '❌ Não foi possível processar seu prêmio.',
        ephemeral: true,
      });
      return;
    }

    const member = await guild.members.fetch(interaction.user.id).catch(() => null);
    if (!member) {
      await interaction.reply({
        content: '❌ Você não foi encontrado no servidor para receber o cargo.',
        ephemeral: true,
      });
      return;
    }

    await member.roles.add(roleId).catch(() => null);

    const expirationEntry = {
      guildId: guild.id,
      userId: interaction.user.id,
      roleId,
      expiresAt: new Date(Date.now() + PRIZE_ROLE_DURATION_MS).toISOString(),
    };
    addOrReplaceExpiration(expirationEntry);
    schedulePrizeRoleRemoval(expirationEntry);

    pendingPrizeSelections.delete(interaction.customId);
    await interaction.update({
      content: '✅ Prêmio resgatado com sucesso! Cargo aplicado no servidor.',
      embeds: [],
      components: [],
    });
  });

  // Carregar expirações salvas quando o bot iniciar
  client.once('ready', async () => {
    console.log('✅ Sistema de drops carregado');
    
    // Debug: mostrar comandos registrados
    console.log('📋 Comandos disponíveis:', commands.map(c => c.name));
    
    if (guildId) {
      try {
        const guild = await client.guilds.fetch(guildId);
        const registeredCommands = await guild.commands.fetch();
        console.log('✅ Comandos registrados no servidor:', 
          registeredCommands.map(c => c.name).join(', ')
        );
      } catch (err) {
        console.error('❌ Erro ao verificar comandos:', err);
      }
    }
    
    // Carregar expirações de cargos salvos
    const expirations = readPrizeExpirations();
    for (const entry of expirations) {
      schedulePrizeRoleRemoval(entry);
    }
    console.log(`📦 ${expirations.length} expiração(ões) de cargo carregada(s)`);
  });

}

module.exports = {
  registerDropSystem,
  DROP_DURATION_MS,
  PRIZE_ROLE_DURATION_MS,
};