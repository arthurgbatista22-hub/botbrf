const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, PermissionFlagsBits } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ]
});

// ═══════════════════════════════════════════════════════
// ⚙️ CONFIGURAÇÃO DE PERMISSÕES E CARGOS
// ═══════════════════════════════════════════════════════

const ALLOWED_COMMAND_ROLE = '1491439508309278831';

const ALLOWED_TEAM_ROLES = [
  '1491626081680232488',
  '1491626182276284466',
  '1491626270557999127',
  '1491626367614451823',
  '1491626509629128834',
  '1491626604672192633',
  '1491626684061843536',
  '1491627187265343498',
  '1491627290629636186',
  '1491627452903198720',
  '1491931433457946754',
  '1491934575914389586',
  '1491934655262494870',
  '1491934695049531505',
  '1491934860585996521',
  '1491934946187542589',
  '1491935127234805958',
  '1491935298840559807',
  '1491935469372702810',
  '1491935723673092237'
];

const ALLOWED_TEAM_ROLE_NAMES = [];

const CONTRACT_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// ═══════════════════════════════════════════════════════
// 📍 CANAIS PERMITIDOS PARA COMANDOS
// ═══════════════════════════════════════════════════════

const ALLOWED_FA_CHANNELS = [
  '1491433748774912140',
];
const FA_ANNOUNCEMENT_CHANNEL = '1491439241090170971';

const ALLOWED_CONTRACT_CHANNELS = [
  '1491433748774912140',
];
const CONTRACT_ANNOUNCEMENT_CHANNEL = '1491447652422914220';

const ALLOWED_SCOUTING_CHANNELS = [
  '1491433748774912140',
];
const SCOUTING_ANNOUNCEMENT_CHANNEL = '1491447682764636332';

const ALLOWED_RELEASE_CHANNELS = [
  '1492354496259428392',
];

const ALLOWED_FRIENDLY_CHANNELS = [
  '1491433748774912140',
];
const FRIENDLY_ANNOUNCEMENT_CHANNEL = '1492659295819403385';

// ═══════════════════════════════════════════════════════
// 🚫 ANTI-INVITE
// ═══════════════════════════════════════════════════════

const INVITE_REGEX = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;
// Dentro do anti-invite:
const channelName = message.channel.name?.toLowerCase() || '';
if (channelName.startsWith('ticket')) {
  // ✅ libera convites
} else {
  if (INVITE_REGEX.test(message.content)) {
    // 🚫 deleta
  }
}

// ═══════════════════════════════════════════════════════
// 🤖 RESPOSTAS AUTOMÁTICAS DE COMANDOS
// ═══════════════════════════════════════════════════════

const AUTO_RESPONSES = [
  {
    keywords: [
      // fa
      'como uso fa', 'como usar fa', 'como faço fa', 'como faz fa',
      'como anuncio fa', 'como ser fa', 'como postar fa', 'como manda fa',
      'onde uso fa', 'onde faço fa', 'onde fica o fa', 'cade o fa',
      'o que e fa', 'oque e fa', 'pra que serve fa', 'como funciona fa',
      'free agent como', 'como viro fa', 'quero ser fa', 'como posto fa',
      // free agent
      'como uso free agent', 'como usar free agent', 'como faço free agent',
      'como faz free agent', 'como anuncio free agent', 'como ser free agent',
      'como postar free agent', 'como manda free agent', 'como mando free agent',
      'onde uso free agent', 'onde faço free agent', 'cade o free agent',
      'o que e free agent', 'oque e free agent', 'pra que serve free agent',
      'como funciona free agent', 'como viro free agent', 'quero ser free agent',
      'como coloco free agent', 'como posto free agent', 'como anunciar free agent',
    ],
    response: '📢 Para se anunciar como **Free Agent**, use o comando `/fa` no canal <#1491433748774912140>!'
  },
  {
    keywords: [
      'como uso contract', 'como usar contract', 'como faço contract', 'como faz contract',
      'como envio contrato', 'como mando contrato', 'como criar contrato',
      'onde uso contract', 'onde faço contract', 'cade o contract',
      'como funciona contract', 'pra que serve contract', 'o que e contract',
      'como contratar jogador', 'como contratar alguem', 'quero contratar',
      'como propor contrato', 'como fazer contrato', 'como assinar contrato',
      'como manda contract', 'como mando contract',
    ],
    response: '📋 Para propor um **Contrato**, use o comando `/contract` no canal <#1491433748774912140>!'
  },
  {
    keywords: [
      'como uso scouting', 'como usar scouting', 'como faço scouting', 'como faz scouting',
      'como anuncio scouting', 'como postar scouting', 'onde uso scouting',
      'cade o scouting', 'como funciona scouting', 'pra que serve scouting',
      'o que e scouting', 'oque e scouting', 'quero fazer scouting',
      'como recrutar jogador', 'como procurar jogador', 'como buscar jogador',
      'como manda scouting', 'como mando scouting',
    ],
    response: '🔍 Para anunciar um **Scouting**, use o comando `/scouting` no canal <#1491433748774912140>!'
  },
  {
    keywords: [
      'como uso friendly', 'como usar friendly', 'como faço friendly', 'como faz friendly',
      'como marcar friendly', 'como agendar friendly', 'como postar friendly',
      'onde uso friendly', 'cade o friendly', 'como funciona friendly',
      'pra que serve friendly', 'o que e friendly', 'oque e friendly',
      'quero fazer friendly', 'como pedir friendly', 'como solicitar friendly',
      'como manda friendly', 'como mando friendly',
    ],
    response: '⚽ Para solicitar um **Friendly**, use o comando `/friendly` no canal <#1491433748774912140>!'
  },
  {
    keywords: [
      'como uso release', 'como usar release', 'como faço release', 'como faz release',
      'como sair do time', 'como saio do time', 'como me liberar', 'como se liberar',
      'onde uso release', 'cade o release', 'como funciona release',
      'pra que serve release', 'o que e release', 'oque e release',
      'quero sair do time', 'como deixar o time', 'como largar o time',
      'como dar release', 'quero dar release', 'quero me liberar',
      'como manda release', 'como mando release',
    ],
    response: '🔓 Para se **liberar de um time**, use o comando `/release` no canal <#1492354496259428392>!'
  },
  {
    keywords: [
      'quais comandos', 'lista de comandos', 'que comandos tem', 'quais sao os comandos',
      'que comandos existem', 'me manda os comandos', 'comandos do bot',
      'help', 'ajuda', 'como usar o bot', 'como funciona o bot',
      'o que o bot faz', 'que o bot faz', 'comandos disponiveis',
      'comandos disponíveis', 'como usar os comandos',
    ],
    response: '📖 **Comandos disponíveis:**\n\n📢 `/fa` — Anunciar Free Agent → <#1491433748774912140>\n📋 `/contract` — Propor contrato → <#1491433748774912140>\n🔍 `/scouting` — Anunciar scouting → <#1491433748774912140>\n⚽ `/friendly` — Pedir friendly → <#1491433748774912140>\n🔓 `/release` — Sair do time → <#1492354496259428392>'
  }
];

// ═══════════════════════════════════════════════════════

const pendingContracts = new Map();
const activeContracts = new Map();
const expirationTimers = new Map();

// ═══════════════════════════════════════════════════════
// 💾 PERSISTÊNCIA DE CONTRATOS (salvo em contratos.json)
// ═══════════════════════════════════════════════════════

const CONTRACTS_FILE = './contratos.json';

function saveContracts() {
  const data = {};
  for (const [id, c] of activeContracts) {
    data[id] = {
      contractId: c.contractId,
      signee: { id: c.signee.id, username: c.signee.username },
      contractor: { id: c.contractor.id, username: c.contractor.username },
      teamName: c.teamName,
      teamRoleId: c.teamRoleId,
      position: c.position,
      proposedAt: c.proposedAt,
      signedAt: c.signedAt,
      expiresAt: c.expiresAt,
      channelId: c.channelId,
      guildId: c.guildId,
    };
  }
  fs.writeFileSync(CONTRACTS_FILE, JSON.stringify(data, null, 2));
}

function loadContracts() {
  if (!fs.existsSync(CONTRACTS_FILE)) return;
  try {
    const data = JSON.parse(fs.readFileSync(CONTRACTS_FILE, 'utf8'));
    const now = Date.now();
    for (const [id, c] of Object.entries(data)) {
      const expiresAt = new Date(c.expiresAt).getTime();
      if (expiresAt > now) {
        activeContracts.set(id, {
          ...c,
          signee: c.signee,
          contractor: c.contractor,
          proposedAt: new Date(c.proposedAt),
          signedAt: new Date(c.signedAt),
          expiresAt: new Date(c.expiresAt),
        });
        const remaining = expiresAt - now;
        const timer = setTimeout(async () => {
          activeContracts.delete(id);
          expirationTimers.delete(id);
          saveContracts();
          try {
            const guild = client.guilds.cache.get(c.guildId);
            if (guild) {
              const channel = guild.channels.cache.get(c.channelId);
              const member = await guild.members.fetch(c.signee.id).catch(() => null);
              if (member && c.teamRoleId) {
                await member.roles.remove(c.teamRoleId).catch(() => {});
              }
              if (member) {
                await member.roles.add('1492562238761074870').catch(() => {});
              }
              if (channel) {
                const expirationEmbed = new EmbedBuilder()
                  .setColor(0xffa500)
                  .setTitle('⏰ Contrato Expirado')
                  .setDescription(`O contrato de **${c.signee.username}** com **${c.teamName}** expirou após 24 horas.`)
                  .addFields(
                    { name: 'Jogador', value: `<@${c.signee.id}>`, inline: true },
                    { name: 'Time', value: c.teamName, inline: true },
                    { name: 'Posição', value: c.position, inline: true },
                  )
                  .setFooter({ text: 'The Classic Soccer Federation' })
                  .setTimestamp();
                await channel.send({ embeds: [expirationEmbed] });
              }
            }
          } catch (err) {
            console.error('Erro na expiração:', err);
          }
        }, remaining);
        expirationTimers.set(id, timer);
        console.log(`📂 Contrato carregado: ${c.signee.username} — ${c.teamName}`);
      } else {
        console.log(`⏰ Contrato expirado ignorado: ${c.signee.username}`);
      }
    }
    console.log(`✅ ${activeContracts.size} contrato(s) carregado(s) do disco.`);
  } catch (err) {
    console.error('Erro ao carregar contratos:', err);
  }
}

function generateContractId(signeeId, contractorId) {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000000000);
  return `T${timestamp}_${random}`;
}

function formatDate(date) {
  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function hasCommandPermission(member) {
  return member.roles.cache.has(ALLOWED_COMMAND_ROLE);
}

function isContractChannelAllowed(channelId) {
  return ALLOWED_CONTRACT_CHANNELS.includes(channelId);
}

function isFaChannelAllowed(channelId) {
  return ALLOWED_FA_CHANNELS.includes(channelId);
}

function isScoutingChannelAllowed(channelId) {
  return ALLOWED_SCOUTING_CHANNELS.includes(channelId);
}

function isRoleAllowed(role) {
  if (ALLOWED_TEAM_ROLES.includes(role.id)) return true;
  if (ALLOWED_TEAM_ROLE_NAMES.includes(role.name)) return true;
  return false;
}

async function scheduleContractExpiration(contractId, contractData) {
  const timer = setTimeout(async () => {
    const contract = activeContracts.get(contractId);
    if (contract) {
      activeContracts.delete(contractId);
      expirationTimers.delete(contractId);
      saveContracts();
      try {
        const guild = client.guilds.cache.get(contract.guildId);
        if (guild) {
          const channel = guild.channels.cache.get(contract.channelId);
          const member = await guild.members.fetch(contract.signee.id).catch(() => null);
          if (member && contract.teamRoleId) {
            await member.roles.remove(contract.teamRoleId).catch(err =>
              console.error('Erro ao remover cargo:', err)
            );
          }
          if (channel) {
            const expirationEmbed = new EmbedBuilder()
              .setColor(0xffa500)
              .setTitle('⏰ Contrato Expirado')
              .setDescription(`O contrato de **${contract.signee.username}** com **${contract.teamName}** expirou após 24 horas.`)
              .addFields(
                { name: 'Jogador', value: `<@${contract.signee.id}>`, inline: true },
                { name: 'Time', value: contract.teamName, inline: true },
                { name: 'Posição', value: contract.position, inline: true },
                { name: 'Assinado em', value: formatDate(contract.signedAt), inline: false },
                { name: 'Expirado em', value: formatDate(new Date()), inline: false }
              )
              .setFooter({ text: 'The Classic Soccer Federation' })
              .setTimestamp();
            await channel.send({
              content: `⚠️ <@${contract.contractor.id}> <@${contract.signee.id}>`,
              embeds: [expirationEmbed]
            });
          }
        }
      } catch (error) {
        console.error('Erro ao enviar notificação de expiração:', error);
      }
    }
  }, CONTRACT_EXPIRATION_TIME);
  expirationTimers.set(contractId, timer);
}

// Registrar Slash Commands
const commands = [
  new SlashCommandBuilder()
    .setName('contract')
    .setDescription('Propor um contrato para um jogador')
    .addUserOption(opt => opt.setName('jogador').setDescription('O jogador que vai assinar').setRequired(true))
    .addRoleOption(opt => opt.setName('time').setDescription('Cargo do time').setRequired(true))
    .addStringOption(opt => opt.setName('posicao').setDescription('Posição do jogador (ex: cb, st, gk)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('contratos_ativos')
    .setDescription('Ver todos os contratos ativos'),

  new SlashCommandBuilder()
    .setName('meu_contrato')
    .setDescription('Ver seu contrato atual'),

  new SlashCommandBuilder()
    .setName('fa')
    .setDescription('Anunciar que você está Free Agent')
    .addStringOption(opt => opt.setName('posicao').setDescription('Sua posição (ex: cb, st, gk)').setRequired(true))
    .addStringOption(opt => opt.setName('exp').setDescription('Sua experiência').setRequired(true))
    .addStringOption(opt => opt.setName('plataforma').setDescription('Sua plataforma (ex: PC, Mobile, Console)').setRequired(true))
    .addStringOption(opt => opt.setName('sobre').setDescription('Algo sobre você (opcional)').setRequired(false)),

  new SlashCommandBuilder()
    .setName('scouting')
    .setDescription('Anunciar um scout de jogador')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(opt => opt.setName('time').setDescription('Nome do time que deseja recrutar').setRequired(true))
    .addStringOption(opt => opt.setName('posicao').setDescription('Posição do jogador procurado').setRequired(true))
    .addStringOption(opt => opt.setName('sobre').setDescription('Descrição do scout (requisitos, etc)').setRequired(true)),

  new SlashCommandBuilder()
    .setName('release')
    .setDescription('Se liberar de um time e voltar a ser Free Agent'),

  new SlashCommandBuilder()
    .setName('friendly')
    .setDescription('Anunciar um pedido de friendly')
    .addStringOption(opt => opt.setName('sobre').setDescription('Detalhes do friendly (horário, formato, etc)').setRequired(true)),
];

client.once('ready', async () => {
  console.log(`✅ Bot online como: ${client.user.tag}`);

  loadContracts();

  client.user.setPresence({
    activities: [{ name: 'The Classic Soccer Federation', type: 0 }],
    status: 'online'
  });

  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands.map(cmd => cmd.toJSON()) }
    );
    console.log('✅ Slash commands registrados!');
  } catch (err) {
    console.error('Erro ao registrar commands:', err);
  }
});

// ═══════════════════════════════════════════════════════
// 💬 MENSAGENS — Anti-invite + Respostas automáticas
// ═══════════════════════════════════════════════════════

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const msgLower = message.content.toLowerCase().trim();

  // 🚫 ANTI-INVITE
  if (message.member && !message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
    if (INVITE_REGEX.test(message.content)) {
      try {
        await message.delete();
        const warning = await message.channel.send({
          content: `🚫 ${message.author}, **convites de outros servidores não são permitidos aqui!**`,
        });
        setTimeout(() => warning.delete().catch(() => {}), 5000);
        console.log(`🚫 Convite deletado de ${message.author.tag} em #${message.channel.name}`);
      } catch (err) {
        console.error('Erro ao deletar convite:', err);
      }
      return;
    }
  }

  // 🤖 RESPOSTAS AUTOMÁTICAS
  for (const entry of AUTO_RESPONSES) {
    const matched = entry.keywords.some(keyword => msgLower.includes(keyword));
    if (matched) {
      try {
        await message.reply({ content: entry.response });
      } catch (err) {
        console.error('Erro ao enviar resposta automática:', err);
      }
      return;
    }
  }
});

// ═══════════════════════════════════════════════════════

client.on('interactionCreate', async (interaction) => {
  if (interaction.isChatInputCommand()) {

    // /contract
    if (interaction.commandName === 'contract') {
      if (!isContractChannelAllowed(interaction.channelId)) {
        const channelErrorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Canal Não Permitido')
          .setDescription('Este comando só pode ser utilizado em canais específicos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }

      if (!hasCommandPermission(interaction.member)) {
        const noPermEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Sem Permissão')
          .setDescription('Você não tem permissão para usar este comando.\n\nApenas membros autorizados podem criar contratos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
      }

      const signee = interaction.options.getUser('jogador');
      const teamRole = interaction.options.getRole('time');
      const position = interaction.options.getString('posicao');
      const contractor = interaction.user;

      const existingContract = [...activeContracts.values()].find(c => c.signee.id === signee.id);
      if (existingContract) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Contrato Já Existente')
          .setDescription(`${signee} já possui um contrato ativo com **${existingContract.teamName}**.`)
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      if (!isRoleAllowed(teamRole)) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Cargo Não Permitido')
          .setDescription(`O cargo **${teamRole.name}** não está autorizado para contratos.\n\nApenas cargos de times podem ser usados.`)
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      if (
        teamRole.permissions.has(PermissionFlagsBits.Administrator) ||
        teamRole.permissions.has(PermissionFlagsBits.ManageGuild) ||
        teamRole.permissions.has(PermissionFlagsBits.ManageRoles)
      ) {
        const errorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Cargo Administrativo Bloqueado')
          .setDescription(`Por segurança, cargos com permissões administrativas não podem ser usados em contratos.`)
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      }

      const contractId = generateContractId(signee.id, contractor.id);

      const contractData = {
        contractId,
        signee,
        contractor,
        teamName: teamRole.name,
        teamRoleId: teamRole.id,
        position,
        proposedAt: new Date(),
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      };

      pendingContracts.set(contractId, contractData);

      const embed = new EmbedBuilder()
        .setColor(0x2b2d31)
        .setTitle('📋 Agreement Contract')
        .setDescription(
          `By signing this contract, you commit to representing the Contractor and their team with dedication throughout the tournament, competing to the best of your abilities and upholding team loyalty.`
        )
        .addFields(
          { name: 'Signee', value: `${signee}\n${signee.username}`, inline: true },
          { name: 'Contractor', value: `${contractor}\n${contractor.username}`, inline: true },
          { name: 'Team', value: teamRole.name, inline: true },
          { name: 'Position', value: position, inline: true },
        )
        .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
        .setTimestamp();

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`accept_${contractId}`)
          .setLabel('Accept')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`reject_${contractId}`)
          .setLabel('Reject')
          .setStyle(ButtonStyle.Danger)
      );

      try {
        const announcementChannel = await interaction.guild.channels.fetch(CONTRACT_ANNOUNCEMENT_CHANNEL);
        if (announcementChannel) {
          await announcementChannel.send({
            content: `🔔 ${signee}, um contrato foi proposto por ${contractor}.`,
            embeds: [embed],
            components: [row],
          });
        }
      } catch (err) {
        console.error('❌ Erro ao enviar contract no canal de anúncios:', err);
      }

      await interaction.reply({
        content: '✅ Contrato enviado para o canal de contratos!',
        ephemeral: true
      });

      try {
        const dmEmbed = new EmbedBuilder()
          .setColor(0x5865f2)
          .setTitle('📋 Você recebeu um Contract!')
          .setDescription(`Você recebeu uma proposta de contrato do time **${teamRole.name}** na liga **The Classic Soccer Federation**.\n\nAcesse o servidor para aceitar ou rejeitar.`)
          .addFields(
            { name: 'Time', value: teamRole.name, inline: true },
            { name: 'Posição', value: position, inline: true },
            { name: 'Enviado por', value: contractor.username, inline: true },
          )
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();

        await signee.send({ embeds: [dmEmbed] });
      } catch (err) {
        console.log(`⚠️ Não foi possível enviar DM para ${signee.username}: DMs fechadas.`);
      }
    }

    // /contratos_ativos
    else if (interaction.commandName === 'contratos_ativos') {
      if (!hasCommandPermission(interaction.member)) {
        const noPermEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Sem Permissão')
          .setDescription('Você não tem permissão para usar este comando.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
      }

      if (activeContracts.size === 0) {
        return interaction.reply({ content: '📭 Nenhum contrato ativo no momento.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('📂 Contratos Ativos — The Classic Soccer Federation')
        .setFooter({ text: `Total: ${activeContracts.size} contrato(s)` })
        .setTimestamp();

      for (const [id, c] of activeContracts) {
        embed.addFields({
          name: `${c.teamName} — ${c.signee.username}`,
          value: `**Posição:** ${c.position}\n**Contratante:** ${c.contractor.username}\n**Assinado em:** ${formatDate(c.signedAt)}`,
          inline: false
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // /meu_contrato
    else if (interaction.commandName === 'meu_contrato') {
      if (!hasCommandPermission(interaction.member)) {
        const noPermEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Sem Permissão')
          .setDescription('Você não tem permissão para usar este comando.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
      }

      const userContract = [...activeContracts.values()].find(c => c.signee.id === interaction.user.id);
      if (!userContract) {
        return interaction.reply({ content: '📭 Você não possui contrato ativo.', ephemeral: true });
      }

      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle('✅ Seu Contrato Ativo')
        .addFields(
          { name: 'Time', value: userContract.teamName, inline: true },
          { name: 'Posição', value: userContract.position, inline: true },
          { name: 'Contratante', value: `${userContract.contractor}`, inline: true },
          { name: 'Assinado em', value: formatDate(userContract.signedAt), inline: false },
        )
        .setFooter({ text: 'The Classic Soccer Federation' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    // /fa
    else if (interaction.commandName === 'fa') {
      if (!isFaChannelAllowed(interaction.channelId)) {
        const channelErrorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Canal Não Permitido')
          .setDescription('Este comando só pode ser utilizado em canais específicos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }

      const hasTeamRole = ALLOWED_TEAM_ROLES.some(id => interaction.member.roles.cache.has(id));
      if (hasTeamRole) {
        return interaction.reply({
          content: `❌ Você já é de um time! Se quiser sair, use **/release** no canal <#1492354496259428392>.`,
          ephemeral: true
        });
      }

      const posicao = interaction.options.getString('posicao');
      const exp = interaction.options.getString('exp');
      const plataforma = interaction.options.getString('plataforma');
      const sobre = interaction.options.getString('sobre');

      const faEmbed = new EmbedBuilder()
        .setColor(0xf0c030)
        .setTitle('📢 Free Agent')
        .setDescription(`${interaction.user} está disponível para ser contratado!`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Posição', value: posicao, inline: true },
          { name: 'Plataforma', value: plataforma, inline: true },
          { name: 'Experiência', value: exp, inline: false },
        );

      if (sobre) {
        faEmbed.addFields({ name: '💬 Sobre', value: sobre, inline: false });
      }

      faEmbed
        .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
        .setTimestamp();

      await interaction.reply({
        content: '✅ Seu anúncio de Free Agent foi publicado!',
        ephemeral: true
      });

      try {
        const announcementChannel = await interaction.guild.channels.fetch(FA_ANNOUNCEMENT_CHANNEL);
        if (announcementChannel) {
          await announcementChannel.send({ embeds: [faEmbed] });
        }
      } catch (err) {
        console.error('❌ Erro ao enviar FA no canal de anúncios:', err);
      }
    }

    // /scouting
    else if (interaction.commandName === 'scouting') {
      if (!isScoutingChannelAllowed(interaction.channelId)) {
        const channelErrorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Canal Não Permitido')
          .setDescription('Este comando só pode ser utilizado em canais específicos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }

      if (!hasCommandPermission(interaction.member)) {
        const noPermEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Sem Permissão')
          .setDescription('Você não tem permissão para usar este comando.\n\nApenas membros autorizados podem fazer scouting.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
      }

      const time = interaction.options.getString('time');
      const posicao = interaction.options.getString('posicao');
      const sobre = interaction.options.getString('sobre');
      const scout = interaction.user;

      const scoutingEmbed = new EmbedBuilder()
        .setColor(0x3498db)
        .setTitle('🔍 Anúncio de Scouting')
        .setDescription(`${scout} está procurando novos talentos!`)
        .setThumbnail(scout.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: 'Time', value: time, inline: true },
          { name: 'Posição', value: posicao, inline: true },
          { name: '📝 Detalhes', value: sobre, inline: false },
          { name: 'Scout', value: `${scout}`, inline: true },
        )
        .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
        .setTimestamp();

      await interaction.reply({
        content: '✅ Seu anúncio de scouting foi publicado!',
        ephemeral: true
      });

      try {
        const announcementChannel = await interaction.guild.channels.fetch(SCOUTING_ANNOUNCEMENT_CHANNEL);
        if (announcementChannel) {
          await announcementChannel.send({ embeds: [scoutingEmbed] });
        }
      } catch (err) {
        console.error('❌ Erro ao enviar scouting no canal de anúncios:', err);
      }
    }

    // /friendly
    else if (interaction.commandName === 'friendly') {
      if (!ALLOWED_FRIENDLY_CHANNELS.includes(interaction.channelId)) {
        const channelErrorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Canal Não Permitido')
          .setDescription('Este comando só pode ser utilizado em canais específicos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }

      if (!hasCommandPermission(interaction.member)) {
        const noPermEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🔒 Sem Permissão')
          .setDescription('Você não tem permissão para usar este comando.\n\nApenas membros autorizados podem anunciar friendlies.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noPermEmbed], ephemeral: true });
      }

      const sobre = interaction.options.getString('sobre');

      const teamRoleId = ALLOWED_TEAM_ROLES.find(id => interaction.member.roles.cache.has(id));
      const teamRole = teamRoleId ? interaction.guild.roles.cache.get(teamRoleId) : null;
      const teamName = teamRole ? teamRole.name : 'Time não identificado';

      const friendlyEmbed = new EmbedBuilder()
        .setColor(0x2ecc71)
        .setTitle('⚽ Pedido de Friendly')
        .setDescription(`${interaction.user} está procurando um adversário para um friendly!`)
        .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
        .addFields(
          { name: '🏟️ Time', value: teamName, inline: true },
          { name: '👤 Responsável', value: `${interaction.user}`, inline: true },
          { name: '📝 Sobre', value: sobre, inline: false },
        )
        .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
        .setTimestamp();

      await interaction.reply({
        content: '✅ Seu pedido de friendly foi publicado!',
        ephemeral: true
      });

      try {
        const announcementChannel = await interaction.guild.channels.fetch(FRIENDLY_ANNOUNCEMENT_CHANNEL);
        if (announcementChannel) {
          await announcementChannel.send({ embeds: [friendlyEmbed] });
        }
      } catch (err) {
        console.error('❌ Erro ao enviar friendly no canal de anúncios:', err);
      }
    }

    // /release
    else if (interaction.commandName === 'release') {
      if (!ALLOWED_RELEASE_CHANNELS.includes(interaction.channelId)) {
        const channelErrorEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Canal Não Permitido')
          .setDescription('Este comando só pode ser utilizado em canais específicos.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [channelErrorEmbed], ephemeral: true });
      }

      const member = interaction.member;
      const FA_ROLE_ID = '1492562238761074870';

      const teamRoleId = ALLOWED_TEAM_ROLES.find(id => member.roles.cache.has(id));

      if (!teamRoleId) {
        const noTeamEmbed = new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('❌ Sem Time')
          .setDescription('Você não possui nenhum cargo de time para se liberar.')
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp();
        return interaction.reply({ embeds: [noTeamEmbed], ephemeral: true });
      }

      const teamRole = interaction.guild.roles.cache.get(teamRoleId);
      const teamName = teamRole ? teamRole.name : 'Time desconhecido';

      try {
        await member.roles.remove(teamRoleId);
        await member.roles.add(FA_ROLE_ID);

        for (const [id, c] of activeContracts) {
          if (c.signee.id === interaction.user.id) {
            activeContracts.delete(id);
            const timer = expirationTimers.get(id);
            if (timer) {
              clearTimeout(timer);
              expirationTimers.delete(id);
            }
            saveContracts();
            break;
          }
        }

        const releaseEmbed = new EmbedBuilder()
          .setColor(0xf0c030)
          .setTitle('🔓 Liberação Confirmada')
          .setDescription(`${interaction.user} agora está como **Free Agent**!`)
          .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
          .addFields(
            { name: 'Jogador', value: `${interaction.user}`, inline: true },
            { name: 'Time Anterior', value: teamName, inline: true },
            { name: 'Status', value: '🟡 Free Agent', inline: true },
          )
          .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
          .setTimestamp();

        await interaction.reply({ embeds: [releaseEmbed] });

      } catch (err) {
        console.error('❌ Erro ao liberar jogador:', err);
        await interaction.reply({ content: '❌ Ocorreu um erro ao processar sua liberação. Verifique se o bot tem permissão para gerenciar cargos.', ephemeral: true });
      }
    }
  }

  // ───── BUTTONS ─────
  if (interaction.isButton()) {
    const [action, contractId] = interaction.customId.split('_').reduce((acc, part, i) => {
      if (i === 0) acc[0] = part;
      else acc[1] = (acc[1] ? acc[1] + '_' + part : part);
      return acc;
    }, []);

    const contractData = pendingContracts.get(contractId);
    if (!contractData) {
      return interaction.reply({ content: '❌ Contrato não encontrado ou já processado.', ephemeral: true });
    }

    if (interaction.user.id !== contractData.signee.id) {
      return interaction.reply({ content: '❌ Apenas o jogador indicado pode aceitar ou rejeitar este contrato.', ephemeral: true });
    }

    if (action === 'accept') {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + CONTRACT_EXPIRATION_TIME);

      const signedContract = {
        ...contractData,
        signedAt: now,
        expiresAt: expiresAt
      };

      activeContracts.set(contractId, signedContract);
      pendingContracts.delete(contractId);
      saveContracts();

      scheduleContractExpiration(contractId, signedContract);

      try {
        const guild = interaction.guild;
        const member = await guild.members.fetch(contractData.signee.id);
        if (member && contractData.teamRoleId) {
          await member.roles.add(contractData.teamRoleId);
          console.log(`✅ Cargo ${contractData.teamName} adicionado a ${member.user.tag}`);
        }
        const FA_ROLE_ID = '1492562238761074870';
        if (member && member.roles.cache.has(FA_ROLE_ID)) {
          await member.roles.remove(FA_ROLE_ID);
          console.log(`🗑️ Cargo FA removido de ${member.user.tag}`);
        }
      } catch (err) {
        console.error('❌ Erro ao adicionar/remover cargo:', err);
      }

      const successEmbed = new EmbedBuilder()
        .setColor(0x57f287)
        .setTitle('✅ Contract Accepted')
        .setDescription(`${contractData.signee} has successfully signed with **${contractData.teamName}**`)
        .addFields(
          { name: 'Signee', value: `${contractData.signee}\n${contractData.signee.username}`, inline: true },
          { name: 'Contractor', value: `${contractData.contractor}\n${contractData.contractor.username}`, inline: true },
          { name: 'Team', value: contractData.teamName, inline: true },
          { name: 'Position', value: contractData.position, inline: true },
          { name: 'Signed on', value: formatDate(now), inline: false },
        )
        .setFooter({ text: `The Classic Soccer Federation • ${new Date().toLocaleDateString('pt-BR')}` })
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('disabled_accept').setLabel('Accept').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('disabled_reject').setLabel('Reject').setStyle(ButtonStyle.Danger).setDisabled(true)
      );

      await interaction.update({ content: `✅ ${contractData.signee} accepted the contract!`, embeds: [successEmbed], components: [disabledRow] });

    } else if (action === 'reject') {
      pendingContracts.delete(contractId);

      const rejectEmbed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle('❌ Contract Rejected')
        .setDescription(`${contractData.signee} rejected the contract proposed by ${contractData.contractor} for team **${contractData.teamName}**.`)
        .setFooter({ text: 'The Classic Soccer Federation' })
        .setTimestamp();

      const disabledRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('disabled_accept').setLabel('Accept').setStyle(ButtonStyle.Success).setDisabled(true),
        new ButtonBuilder().setCustomId('disabled_reject').setLabel('Reject').setStyle(ButtonStyle.Danger).setDisabled(true)
      );

      await interaction.update({ content: `❌ ${contractData.signee} rejected the contract.`, embeds: [rejectEmbed], components: [disabledRow] });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);