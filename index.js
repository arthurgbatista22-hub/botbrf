const fs = require('fs');
const { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, REST, Routes, PermissionFlagsBits, ChannelType } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ]
});

// ═══════════════════════════════════════════════════════
// ⚙️ CONFIGURAÇÃO DE PERMISSÕES E CARGOS
// ═══════════════════════════════════════════════════════

const ALLOWED_COMMAND_ROLES = [
  '1491439508309278831',
  '1491448375881498665' // 👈 novo cargo que você quer liberar
];

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
  '1491935723673092237',

// International
  '1495837043241127936',
  '1495839806125637793',
  '1495839939211034745',
  '1495840082202984600',
  '1495842308212396147',
  '1495845204257800202',
  '1495843776646615151',
  '1495844968688783541',
  '1495844804762800209',
  '1495845313208909885',
  '1495845124897505400',
  '1495845257362018325',
  '1495845838948274377',
  '1495846561979170917',
  '1495845493110997194',
  '1495847790415450252',
  '1495849573770592399',
  '1495845878433583115',
  '1495846108683964427',
  '1495845533300949253',
  '1495845726092267561',
  '1495846858218672128',
  '1495845161991672038',
  '1495844849482465290'
];

const ALLOWED_TEAM_ROLE_NAMES = [];

const CONTRACT_EXPIRATION_TIME = 24 * 60 * 60 * 1000;

// ═══════════════════════════════════════════════════════
// 🎭 REACTION ROLES
// ═══════════════════════════════════════════════════════

// ID do canal onde a mensagem de reaction roles será enviada
// Altere para o canal correto do seu servidor
const REACTION_ROLES_CHANNEL = '1492347556053778432';

// Mapeamento emoji → cargo
const REACTION_ROLES = [
  { emoji: '⚙️', roleId: '1492348332700471458', label: 'Scrim Ping',  description: 'Quer ser notificado quando estiver tendo scrim?' },
  { emoji: '🎉', roleId: '1492348735437668472', label: 'Fun Ping',    description: 'Quer ser notificado sobre eventos e diversão?' },
  { emoji: '⚽', roleId: '1492348557812961422', label: 'Match Ping',  description: 'Quer ser notificado quando estiver acontecendo uma partida?' },
  { emoji: '📸', roleId: '1492348457015578736', label: 'Media Ping',  description: 'Quer ter acesso a toda categoria de media?' },
];

// Arquivo para persistir o ID da mensagem de reaction roles
const REACTION_MSG_FILE = './reaction_message.json';

// ═══════════════════════════════════════════════════════
// 🔔 SISTEMA DE PING @HERE A CADA 2 DIAS
// ═══════════════════════════════════════════════════════

const PING_INTERVAL_FILE = './last_ping.json';
const PING_INTERVAL = 2 * 24 * 60 * 60 * 1000; // 2 dias em milissegundos

let reactionMessageId = null;
let pingIntervalTimer = null;

function saveLastPingTime() {
  fs.writeFileSync(PING_INTERVAL_FILE, JSON.stringify({ lastPing: Date.now() }));
}

function loadLastPingTime() {
  if (!fs.existsSync(PING_INTERVAL_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(PING_INTERVAL_FILE, 'utf8'));
    return data.lastPing || null;
  } catch {
    return null;
  }
}

async function sendHerePing(guild) {
  const channel = await guild.channels.fetch(REACTION_ROLES_CHANNEL).catch(() => null);
  if (!channel) {
    console.error('❌ Canal de reaction roles não encontrado para ping!');
    return;
  }

  const pingEmbed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setTitle('🔔 Lembrete de Cargos por Reação')
    .setDescription(
      `Não se esqueça de reagir na mensagem de cargos para personalizar suas notificações!\n\n` +
      `Escolha os cargos que você quer receber:\n` +
      REACTION_ROLES.map(r => `${r.emoji} **${r.label}** - ${r.description}`).join('\n')
    )
    .setFooter({ text: 'The Classic Soccer Federation • Reaja na mensagem fixada acima!' })
    .setTimestamp();

  try {
    const sentMessage = await channel.send({
      content: '@here',
      embeds: [pingEmbed]
    });
    console.log('✅ Ping @here enviado no canal de reaction roles');
    saveLastPingTime();

    // Sistema de apagar a mensagem para não lotar o canal (apaga após 1 minuto)
    setTimeout(async () => {
      try {
        await sentMessage.delete();
        console.log('🗑️ Mensagem de ping @here apagada automaticamente.');
      } catch (err) {
        console.error('❌ Erro ao apagar mensagem de ping:', err);
      }
    }, 60000); // 60000ms = 1 minuto

  } catch (err) {
    console.error('❌ Erro ao enviar ping @here:', err);
  }
}

function schedulePingInterval(guild) {
  const lastPing = loadLastPingTime();
  const now = Date.now();
  
  let nextPingDelay;
  
  if (lastPing) {
    const timeSinceLastPing = now - lastPing;
    if (timeSinceLastPing >= PING_INTERVAL) {
      // Se já passou o tempo, envia imediatamente
      sendHerePing(guild);
      nextPingDelay = PING_INTERVAL;
    } else {
      // Calcula quanto tempo falta
      nextPingDelay = PING_INTERVAL - timeSinceLastPing;
    }
  } else {
    // Primeira vez, aguarda 2 dias
    nextPingDelay = PING_INTERVAL;
  }

  console.log(`🔔 Próximo ping @here em: ${Math.round(nextPingDelay / 1000 / 60 / 60)} horas`);

  // Limpa timer anterior se existir
  if (pingIntervalTimer) {
    clearInterval(pingIntervalTimer);
  }

  // Envia o primeiro ping após o delay calculado
  setTimeout(() => {
    sendHerePing(guild);
    
    // Depois configura o intervalo de 2 em 2 dias
    pingIntervalTimer = setInterval(() => {
      sendHerePing(guild);
    }, PING_INTERVAL);
  }, nextPingDelay);
}

function saveReactionMessageId(id) {
  fs.writeFileSync(REACTION_MSG_FILE, JSON.stringify({ messageId: id }));
}

function loadReactionMessageId() {
  if (!fs.existsSync(REACTION_MSG_FILE)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(REACTION_MSG_FILE, 'utf8'));
    return data.messageId || null;
  } catch {
    return null;
  }
}

function buildReactionRolesEmbed() {
  const lines = REACTION_ROLES.map(r => `${r.emoji} - ${r.description}`).join('\n');
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('🎭 Cargos por Reação')
    .setDescription(`Você que está no comando de quando você será mencionado\n\n${lines}`)
    .setFooter({ text: 'The Classic Soccer Federation • Reaja abaixo para receber/remover um cargo' })
    .setTimestamp();
}

async function setupReactionRolesMessage(guild) {
  const channel = await guild.channels.fetch(REACTION_ROLES_CHANNEL).catch(() => null);
  if (!channel) {
    console.error('❌ Canal de reaction roles não encontrado!');
    return;
  }

  // Se já existe uma mensagem salva, verifica se ainda está lá
  if (reactionMessageId) {
    try {
      const existing = await channel.messages.fetch(reactionMessageId);
      if (existing) {
        console.log('✅ Mensagem de reaction roles já existe, reutilizando.');
        return;
      }
    } catch {
      console.log('⚠️ Mensagem de reaction roles não encontrada, criando nova...');
    }
  }

  // Cria nova mensagem
  const msg = await channel.send({
    embeds: [buildReactionRolesEmbed()],
  });

  for (const r of REACTION_ROLES) {
    await msg.react(r.emoji);
  }

  reactionMessageId = msg.id;
  saveReactionMessageId(msg.id);
  console.log(`✅ Mensagem de reaction roles criada: ${msg.id}`);
}

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

const HELP_AUTO_CHANNEL = '1494336905104331014';

// ═══════════════════════════════════════════════════════
// 🚫 ANTI-INVITE
// ═══════════════════════════════════════════════════════

const INVITE_REGEX = /(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+/i;

// ═══════════════════════════════════════════════════════
// 🚫 ANTI-DIVULGAÇÃO
// ═══════════════════════════════════════════════════════

const DIVULGACAO_REGEX = /^algu[eé]m\s+quer\s+entrar/i;

// ═══════════════════════════════════════════════════════
// 🚫 ANTI-LINK ROBLOX SERVIDOR PRIVADO
// ═══════════════════════════════════════════════════════

const ROBLOX_PRIVATE_SERVER_REGEX = /https:\/\/www\.roblox\.com\/share\?code=/i;

const ALLOWED_ROBLOX_LINK_CHANNELS = [
  '1491438344130007332',
  '1491439536545202216',
  '1491439591654166618',
  '1492342601758544033',
];

// ═══════════════════════════════════════════════════════
// 🤖 RESPOSTAS AUTOMÁTICAS DE COMANDOS
// ═══════════════════════════════════════════════════════

const AUTO_RESPONSES = [
  {
    keywords: [
      'como uso fa', 'como usar fa', 'como faço fa', 'como faz fa',
      'como anuncio fa', 'como ser fa', 'como postar fa', 'como manda fa',
      'onde uso fa', 'onde faço fa', 'onde fica o fa', 'cade o fa',
      'o que e fa', 'oque e fa', 'pra que serve fa', 'como funciona fa',
      'free agent como', 'como viro fa', 'quero ser fa', 'como posto fa',
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
];

// ═══════════════════════════════════════════════════════
// 📤 HELPER — Envia embed em canal normal OU fórum
// ═══════════════════════════════════════════════════════

async function sendToChannel(guild, channelId, payload, threadName) {
  const channel = await guild.channels.fetch(channelId);
  if (!channel) return;

  if (channel.type === ChannelType.GuildForum) {
    await channel.threads.create({
      name: threadName,
      message: payload,
    });
  } else {
    await channel.send(payload);
  }
}

// ═══════════════════════════════════════════════════════
// 📖 EMBED DE HELP
// ═══════════════════════════════════════════════════════

function buildHelpEmbed() {
  return new EmbedBuilder()
    .setColor(0x2b2d31)
    .setTitle('📖 Central de Comandos')
    .setDescription('Veja todos os comandos disponíveis abaixo:')
    .addFields(
      {
        name: '📋 /contract',
        value: 'Envia proposta de contrato\n`Uso: /contract jogador time posicao`',
        inline: false,
      },
      {
        name: '🌍 /fa',
        value: 'Se tornar Free Agent\n`Uso: /fa posicao plataforma experiencia`',
        inline: false,
      },
      {
        name: '🔓 /release',
        value: 'Se liberar de um time\n`Uso: /release`',
        inline: false,
      },
      {
        name: '🤝 /friendly',
        value: 'Criar pedido de amistoso\n`Uso: /friendly sobre`',
        inline: false,
      },
      {
        name: '🔍 /scouting',
        value: 'Criar scouting de clube\n`Uso: /scouting time posicao sobre`',
        inline: false,
      },
    )
    .setFooter({ text: 'The Classic Soccer Federation • Sistema Oficial' })
    .setTimestamp();
}

// ═══════════════════════════════════════════════════════

const pendingContracts = new Map();
const activeContracts = new Map();
const expirationTimers = new Map();

// ═══════════════════════════════════════════════════════
// 💾 PERSISTÊNCIA DE CONTRATOS
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
      role: c.role,
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
              const channel = guild.channels.cache.get(CONTRACT_ANNOUNCEMENT_CHANNEL);
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
                await channel.send({
                  content: `⚠️ <@${c.contractor.id}> <@${c.signee.id}>`,
                  embeds: [expirationEmbed]
                });
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
  return ALLOWED_COMMAND_ROLES.some(roleId => 
    member.roles.cache.has(roleId)
  );
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
          const channel = guild.channels.cache.get(CONTRACT_ANNOUNCEMENT_CHANNEL);
          const member = await guild.members.fetch(contract.signee.id).catch(() => null);
          if (member && contract.teamRoleId) {
            await member.roles.remove(contract.teamRoleId).catch(err =>
              console.error('Erro ao remover cargo:', err)
            );
          }
          if (member) {
            await member.roles.add('1492562238761074870').catch(() => {});
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
    .addStringOption(opt => opt.setName('posicao').setDescription('Posição do jogador (ex: cb, st, gk)').setRequired(true))
    .addStringOption(opt => opt.setName('role').setDescription('Role do jogador (ex: Titular, Subs)').setRequired(true)),

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

  new SlashCommandBuilder()
    .setName('help')
    .setDescription('Ver todos os comandos disponíveis'),

  new SlashCommandBuilder()
    .setName('setup_reaction_roles')
    .setDescription('(Admin) Envia a mensagem de cargos por reação')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  new SlashCommandBuilder()

  .setName('announce')
  .setDescription('Faz um anúncio em formato embed em um canal específico (Apenas Administradores)')
  .setDefaultMemberPermissions(null)
  .addChannelOption(opt =>
    opt.setName('canal')
      .setDescription('Canal onde o anúncio será enviado')
      .setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('mensagem')
      .setDescription('Mensagem do anúncio')
      .setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('titulo')
      .setDescription('Título do anúncio (opcional)')
      .setRequired(false)
  ),
];

client.once('ready', async () => {
  console.log(`✅ Bot online como: ${client.user.tag}`);

  loadContracts();

  // Carrega o ID da mensagem de reaction roles salva
  reactionMessageId = loadReactionMessageId();

  // 🔔 Inicia o sistema de ping @here a cada 2 dias
  const guild = client.guilds.cache.first();
  if (guild) {
    schedulePingInterval(guild);
  }

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
// 🎭 REACTION ROLES — Adicionar cargo ao reagir
// ═══════════════════════════════════════════════════════

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== reactionMessageId) return;

  // Busca parcial (caso o bot reiniciou)
  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const emojiName = reaction.emoji.name;
  const roleConfig = REACTION_ROLES.find(r => r.emoji === emojiName);
  if (!roleConfig) return;

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    await member.roles.add(roleConfig.roleId);
    console.log(`✅ Cargo "${roleConfig.label}" adicionado a ${user.tag}`);

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0x57f287)
          .setTitle('✅ Cargo Recebido!')
          .setDescription(`Você recebeu o cargo **${roleConfig.label}** no servidor **The Classic Soccer Federation**!\n\nPara remover, é só tirar a reação.`)
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp()
      ]
    }).catch(() => {});
  } catch (err) {
    console.error('Erro ao adicionar cargo por reação:', err);
  }
});

// ═══════════════════════════════════════════════════════
// 🎭 REACTION ROLES — Remover cargo ao tirar reação
// ═══════════════════════════════════════════════════════

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.message.id !== reactionMessageId) return;

  if (reaction.partial) {
    try { await reaction.fetch(); } catch { return; }
  }

  const emojiName = reaction.emoji.name;
  const roleConfig = REACTION_ROLES.find(r => r.emoji === emojiName);
  if (!roleConfig) return;

  try {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    await member.roles.remove(roleConfig.roleId);
    console.log(`🗑️ Cargo "${roleConfig.label}" removido de ${user.tag}`);

    await user.send({
      embeds: [
        new EmbedBuilder()
          .setColor(0xed4245)
          .setTitle('🗑️ Cargo Removido')
          .setDescription(`O cargo **${roleConfig.label}** foi removido do servidor **The Classic Soccer Federation**.\n\nPara receber novamente, reaja à mensagem de cargos.`)
          .setFooter({ text: 'The Classic Soccer Federation' })
          .setTimestamp()
      ]
    }).catch(() => {});
  } catch (err) {
    console.error('Erro ao remover cargo por reação:', err);
  }
});

// ═══════════════════════════════════════════════════════
// 💬 MENSAGENS
// ═══════════════════════════════════════════════════════

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const msgLower = message.content.toLowerCase().trim();
  const channelName = message.channel.name?.toLowerCase() || '';

  // 🚫 ANTI-INVITE
  if (
    message.member &&
    !message.member.permissions.has(PermissionFlagsBits.ManageMessages) &&
    !channelName.startsWith('ticket')
  ) {
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

  // 🚫 ANTI-DIVULGAÇÃO
  if (DIVULGACAO_REGEX.test(msgLower)) {
    const temPermissao = message.member && message.member.roles.cache.has(ALLOWED_COMMAND_ROLE);
    if (!temPermissao) {
      try {
        await message.delete();
        const warning = await message.channel.send({
          content: `🚫 ${message.author}, **divulgações não são permitidas aqui!** Apenas membros autorizados podem fazer este tipo de anúncio.`,
        });
        setTimeout(() => warning.delete().catch(() => {}), 5000);
        console.log(`🚫 Divulgação bloqueada de ${message.author.tag} em #${message.channel.name}`);
      } catch (err) {
        console.error('Erro ao deletar divulgação:', err);
      }
      return;
    }
  }

  // 🚫 ANTI-LINK ROBLOX SERVIDOR PRIVADO
  if (ROBLOX_PRIVATE_SERVER_REGEX.test(message.content)) {
    const canalPermitido = ALLOWED_ROBLOX_LINK_CHANNELS.includes(message.channelId);
    if (!canalPermitido) {
      try {
        await message.delete();
        const warning = await message.channel.send({
          content: `🚫 ${message.author}, **links de servidores privados do Roblox não são permitidos aqui!** Use os canais específicos para isso.`,
        });
        setTimeout(() => warning.delete().catch(() => {}), 5000);
        console.log(`🚫 Link Roblox bloqueado de ${message.author.tag} em #${message.channel.name}`);
      } catch (err) {
        console.error('Erro ao deletar link Roblox:', err);
      }
      return;
    }
  }

  // 📖 HELP AUTOMÁTICO NO CANAL ESPECÍFICO
  if (message.channelId === HELP_AUTO_CHANNEL) {
    const helpTriggers = ['help', 'ajuda', 'comandos', 'como usar', 'quais comandos'];
    const isHelpMsg = helpTriggers.some(t => msgLower.includes(t));
    if (isHelpMsg) {
      try {
        await message.delete().catch(() => {});
        await message.channel.send({
          content: `${message.author}`,
          embeds: [buildHelpEmbed()],
        }).then(msg => setTimeout(() => msg.delete().catch(() => {}), 30000));
      } catch (err) {
        console.error('Erro ao enviar help automático:', err);
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

    // /help
    if (interaction.commandName === 'help') {
      return interaction.reply({
        embeds: [buildHelpEmbed()],
        ephemeral: true,
      });
    }

    // /setup_reaction_roles
    if (interaction.commandName === 'setup_reaction_roles') {
      await interaction.deferReply({ ephemeral: true });
      try {
        await setupReactionRolesMessage(interaction.guild);
        await interaction.editReply({ content: '✅ Mensagem de reaction roles enviada com sucesso!' });
      } catch (err) {
        console.error('Erro no setup_reaction_roles:', err);
        await interaction.editReply({ content: '❌ Erro ao enviar mensagem de reaction roles. Verifique o canal configurado.' });
      }
      return;
    }

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
      const role = interaction.options.getString('role');
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

// Verifica se o jogador já possui cargo de algum time
const signeeGuildMember = await interaction.guild.members.fetch(signee.id).catch(() => null);
const signeeHasTeamRole = signeeGuildMember &&
  ALLOWED_TEAM_ROLES.some(id => signeeGuildMember.roles.cache.has(id));

if (signeeHasTeamRole) {
  const teamRoleOfSignee = ALLOWED_TEAM_ROLES
    .map(id => interaction.guild.roles.cache.get(id))
    .find(role => role && signeeGuildMember.roles.cache.has(role.id));

  const errorEmbed = new EmbedBuilder()
    .setColor(0xed4245)
    .setTitle('⛔ Jogador Já em um Time')
    .setDescription(`${signee} já faz parte de um time e não pode receber um contrato no momento.`)
    .addFields(
      { name: 'Jogador', value: `${signee}`, inline: true },
      { name: 'Time Atual', value: teamRoleOfSignee ? teamRoleOfSignee.name : 'Desconhecido', inline: true },
    )
    .setFooter({ text: 'The Classic Soccer Federation • O jogador deve usar /release primeiro' })
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
        role,
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
          { name: 'Role', value: role, inline: true },
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
        await sendToChannel(
          interaction.guild,
          CONTRACT_ANNOUNCEMENT_CHANNEL,
          {
            content: `🔔 ${signee}, um contrato foi proposto por ${contractor}.`,
            embeds: [embed],
            components: [row],
          },
          `Contract — ${signee.username}`
        );
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
          .setTitle('📋 Contract Recebido!')
          .setDescription(`Você recebeu um **offer de contract** na liga **The Classic Soccer Federation**!`)
          .addFields(
            { name: '👕 Time', value: teamRole.name, inline: true },
            { name: '⚽ Posição', value: position, inline: true },
            { name: '👤 Enviado por', value: contractor.username, inline: false },
            { 
              name: 'Ação Necessária', 
              value: `Confira os detalhes e aceite ou rejeite o contrato no canal:\n\n🔗 [Ir para o Canal de Contratos](https://discord.com/channels/1491080801662533878/1491447652422914220)`, 
              inline: false 
            }
          )
          .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
          .setFooter({ text: 'The Classic Soccer Federation • Responda o mais rápido possível!' })
          .setTimestamp();

        await signee.send({ embeds: [dmEmbed] });
        console.log(`✅ DM de contrato enviada para ${signee.username}`);
      } catch (err) {
        console.log(`⚠️ Não foi possível enviar DM para ${signee.username}: ${err.message}`);
      }
    }

    // /announce
else if (interaction.commandName === 'announce') {
  const ALLOWED_ANNOUNCE_ROLES = [
    '1491438719201181717',
    '1491439004149747842',
    '1491438424685805608',
    '1491438613379153990',
    '1491437519760261178',
    '1491437072547057805',
    '1491436528725917888',
    '1491436756678217819',
    '1491081676158275615',
    '1492378748610412575',
    '1495428206264713308',
  ];

  const hasAnnouncePermission = ALLOWED_ANNOUNCE_ROLES.some(id => interaction.member.roles.cache.has(id));

  if (!hasAnnouncePermission) {
    return interaction.reply({
      content: '❌ Você não tem permissão para usar este comando.',
      ephemeral: true
    });
  }
  const canal = interaction.options.getChannel('canal');
  const mensagem = interaction.options.getString('mensagem').replace(/\\n/g, '\n');
  const titulo = interaction.options.getString('titulo');

  const announceEmbed = new EmbedBuilder()
    .setColor(0x5865f2)
    .setDescription(titulo ? `# ${titulo}\n\n${mensagem}` : mensagem)
    .setAuthor({
      name: interaction.user.username,
      iconURL: interaction.user.displayAvatarURL({ dynamic: true })
    })
    .setFooter({ text: 'The Classic Soccer Federation' })
    .setTimestamp();

  try {
    await canal.send({ embeds: [announceEmbed] });
    await interaction.reply({
      content: `✅ Anúncio enviado com sucesso em ${canal}!`,
      ephemeral: true
    });
    console.log(`📢 Anúncio enviado por ${interaction.user.tag} no canal #${canal.name}`);
  } catch (err) {
    console.error('❌ Erro ao enviar anúncio:', err);
    await interaction.reply({
      content: '❌ Não foi possível enviar o anúncio. Verifique se o bot tem permissão nesse canal.',
      ephemeral: true
    });
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
        await sendToChannel(
          interaction.guild,
          FA_ANNOUNCEMENT_CHANNEL,
          { embeds: [faEmbed] },
          `FA — ${interaction.user.username}`
        );
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
        await sendToChannel(
          interaction.guild,
          SCOUTING_ANNOUNCEMENT_CHANNEL,
          { embeds: [scoutingEmbed] },
          `Scouting — ${scout.username}`
        );
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
        await sendToChannel(
          interaction.guild,
          FRIENDLY_ANNOUNCEMENT_CHANNEL,
          { embeds: [friendlyEmbed] },
          `Friendly — ${interaction.user.username}`
        );
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
          { name: 'Role', value: contractData.role, inline: true },
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