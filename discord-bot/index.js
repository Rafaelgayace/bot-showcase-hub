require('dotenv').config();
const { Client, GatewayIntentBits, Collection, REST, Routes, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
  ]
});

client.commands = new Collection();

// ============================================
// DEFINIÇÃO DOS 100 COMANDOS
// ============================================

const commands = [
  // ==================== SCRIPTBLOX (COMANDO PRINCIPAL) ====================
  {
    name: 'scriptsearch',
    description: '🔍 Busca scripts no ScriptBlox',
    options: [{
      name: 'query',
      description: 'O que você quer buscar',
      type: 3,
      required: true
    }]
  },
  {
    name: 'scriptinfo',
    description: '📜 Mostra informações detalhadas de um script',
    options: [{
      name: 'script_id',
      description: 'ID do script no ScriptBlox',
      type: 3,
      required: true
    }]
  },
  {
    name: 'scripttop',
    description: '🏆 Mostra os scripts mais populares do ScriptBlox'
  },
  {
    name: 'scriptrecent',
    description: '🆕 Mostra os scripts mais recentes do ScriptBlox'
  },
  {
    name: 'scriptgame',
    description: '🎮 Busca scripts para um jogo específico',
    options: [{
      name: 'game',
      description: 'Nome do jogo',
      type: 3,
      required: true
    }]
  },

  // ==================== MODERAÇÃO ====================
  {
    name: 'ban',
    description: '🔨 Bane um usuário do servidor',
    options: [
      { name: 'user', description: 'Usuário para banir', type: 6, required: true },
      { name: 'reason', description: 'Motivo do ban', type: 3, required: false }
    ]
  },
  {
    name: 'kick',
    description: '👢 Expulsa um usuário do servidor',
    options: [
      { name: 'user', description: 'Usuário para expulsar', type: 6, required: true },
      { name: 'reason', description: 'Motivo da expulsão', type: 3, required: false }
    ]
  },
  {
    name: 'mute',
    description: '🔇 Silencia um usuário',
    options: [
      { name: 'user', description: 'Usuário para silenciar', type: 6, required: true },
      { name: 'duration', description: 'Duração (ex: 10m, 1h, 1d)', type: 3, required: true },
      { name: 'reason', description: 'Motivo', type: 3, required: false }
    ]
  },
  {
    name: 'unmute',
    description: '🔊 Remove o silenciamento de um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'warn',
    description: '⚠️ Avisa um usuário',
    options: [
      { name: 'user', description: 'Usuário', type: 6, required: true },
      { name: 'reason', description: 'Motivo do aviso', type: 3, required: true }
    ]
  },
  {
    name: 'warnings',
    description: '📋 Lista os avisos de um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'clearwarnings',
    description: '🧹 Limpa os avisos de um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'purge',
    description: '🗑️ Apaga mensagens do canal',
    options: [{ name: 'amount', description: 'Quantidade (1-100)', type: 4, required: true }]
  },
  {
    name: 'slowmode',
    description: '🐌 Define o modo lento do canal',
    options: [{ name: 'seconds', description: 'Segundos (0 para desativar)', type: 4, required: true }]
  },
  {
    name: 'lock',
    description: '🔒 Bloqueia o canal atual'
  },
  {
    name: 'unlock',
    description: '🔓 Desbloqueia o canal atual'
  },
  {
    name: 'nuke',
    description: '💣 Recria o canal (apaga tudo)'
  },
  {
    name: 'setprefix',
    description: '⚙️ Define o prefixo do bot',
    options: [{ name: 'prefix', description: 'Novo prefixo', type: 3, required: true }]
  },
  {
    name: 'automod',
    description: '🤖 Configura a moderação automática',
    options: [{ name: 'status', description: 'Ativar ou desativar', type: 5, required: true }]
  },
  {
    name: 'antispam',
    description: '🚫 Configura o anti-spam',
    options: [{ name: 'status', description: 'Ativar ou desativar', type: 5, required: true }]
  },

  // ==================== UTILIDADES ====================
  {
    name: 'help',
    description: '❓ Mostra todos os comandos disponíveis'
  },
  {
    name: 'ping',
    description: '🏓 Verifica a latência do bot'
  },
  {
    name: 'botinfo',
    description: '🤖 Informações sobre o bot'
  },
  {
    name: 'serverinfo',
    description: '📊 Informações sobre o servidor'
  },
  {
    name: 'userinfo',
    description: '👤 Informações sobre um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'avatar',
    description: '🖼️ Mostra o avatar de um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'banner',
    description: '🎨 Mostra o banner de um usuário',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'invite',
    description: '📨 Gera um link de convite do bot'
  },
  {
    name: 'support',
    description: '🆘 Link do servidor de suporte'
  },
  {
    name: 'vote',
    description: '⭐ Link para votar no bot'
  },
  {
    name: 'uptime',
    description: '⏰ Mostra há quanto tempo o bot está online'
  },
  {
    name: 'membercount',
    description: '👥 Mostra o número de membros'
  },
  {
    name: 'roleinfo',
    description: '🏷️ Informações sobre um cargo',
    options: [{ name: 'role', description: 'Cargo', type: 8, required: true }]
  },
  {
    name: 'channelinfo',
    description: '📺 Informações sobre um canal',
    options: [{ name: 'channel', description: 'Canal', type: 7, required: false }]
  },
  {
    name: 'emojis',
    description: '😀 Lista todos os emojis do servidor'
  },
  {
    name: 'stickers',
    description: '🏷️ Lista todos os stickers do servidor'
  },
  {
    name: 'roles',
    description: '📋 Lista todos os cargos do servidor'
  },
  {
    name: 'firstmessage',
    description: '📜 Mostra a primeira mensagem do canal'
  },
  {
    name: 'snipe',
    description: '👀 Mostra a última mensagem apagada'
  },
  {
    name: 'editsnipe',
    description: '✏️ Mostra a última mensagem editada'
  },

  // ==================== DIVERSÃO ====================
  {
    name: '8ball',
    description: '🎱 Faça uma pergunta ao 8ball',
    options: [{ name: 'question', description: 'Sua pergunta', type: 3, required: true }]
  },
  {
    name: 'coinflip',
    description: '🪙 Joga uma moeda'
  },
  {
    name: 'dice',
    description: '🎲 Rola um dado',
    options: [{ name: 'sides', description: 'Número de lados', type: 4, required: false }]
  },
  {
    name: 'rps',
    description: '✊ Pedra, papel ou tesoura',
    options: [{ name: 'choice', description: 'Sua escolha', type: 3, required: true, choices: [
      { name: 'Pedra', value: 'rock' },
      { name: 'Papel', value: 'paper' },
      { name: 'Tesoura', value: 'scissors' }
    ]}]
  },
  {
    name: 'meme',
    description: '😂 Mostra um meme aleatório'
  },
  {
    name: 'joke',
    description: '😄 Conta uma piada'
  },
  {
    name: 'fact',
    description: '📚 Fato aleatório interessante'
  },
  {
    name: 'quote',
    description: '💬 Citação inspiradora aleatória'
  },
  {
    name: 'ship',
    description: '💕 Calcula a compatibilidade entre dois usuários',
    options: [
      { name: 'user1', description: 'Primeiro usuário', type: 6, required: true },
      { name: 'user2', description: 'Segundo usuário', type: 6, required: true }
    ]
  },
  {
    name: 'hug',
    description: '🤗 Abraça alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'slap',
    description: '👋 Dá um tapa em alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'kiss',
    description: '💋 Beija alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'pat',
    description: '🖐️ Faz carinho em alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'punch',
    description: '👊 Soca alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'wink',
    description: '😉 Pisca para alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'rate',
    description: '⭐ Avalia algo de 0 a 10',
    options: [{ name: 'thing', description: 'O que avaliar', type: 3, required: true }]
  },
  {
    name: 'howgay',
    description: '🏳️‍🌈 Quão gay é alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'howsmart',
    description: '🧠 Quão inteligente é alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'roast',
    description: '🔥 Zoeira com alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'compliment',
    description: '💖 Elogia alguém',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'choose',
    description: '🤔 Escolhe entre opções',
    options: [{ name: 'options', description: 'Opções separadas por |', type: 3, required: true }]
  },
  {
    name: 'reverse',
    description: '🔄 Inverte um texto',
    options: [{ name: 'text', description: 'Texto', type: 3, required: true }]
  },
  {
    name: 'ascii',
    description: '📝 Converte texto para ASCII art',
    options: [{ name: 'text', description: 'Texto', type: 3, required: true }]
  },
  {
    name: 'mock',
    description: '🐔 tExTo MoCkAdO',
    options: [{ name: 'text', description: 'Texto', type: 3, required: true }]
  },
  {
    name: 'emojify',
    description: '😀 Converte texto em emojis',
    options: [{ name: 'text', description: 'Texto', type: 3, required: true }]
  },

  // ==================== ECONOMIA ====================
  {
    name: 'balance',
    description: '💰 Verifica seu saldo',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'daily',
    description: '📅 Coleta sua recompensa diária'
  },
  {
    name: 'weekly',
    description: '📆 Coleta sua recompensa semanal'
  },
  {
    name: 'work',
    description: '💼 Trabalha para ganhar dinheiro'
  },
  {
    name: 'crime',
    description: '🦹 Tenta cometer um crime'
  },
  {
    name: 'rob',
    description: '💸 Tenta roubar alguém',
    options: [{ name: 'user', description: 'Vítima', type: 6, required: true }]
  },
  {
    name: 'pay',
    description: '💵 Paga dinheiro a alguém',
    options: [
      { name: 'user', description: 'Usuário', type: 6, required: true },
      { name: 'amount', description: 'Quantia', type: 4, required: true }
    ]
  },
  {
    name: 'deposit',
    description: '🏦 Deposita dinheiro no banco',
    options: [{ name: 'amount', description: 'Quantia', type: 4, required: true }]
  },
  {
    name: 'withdraw',
    description: '💳 Saca dinheiro do banco',
    options: [{ name: 'amount', description: 'Quantia', type: 4, required: true }]
  },
  {
    name: 'leaderboard',
    description: '🏆 Ranking dos mais ricos'
  },
  {
    name: 'shop',
    description: '🛒 Abre a loja'
  },
  {
    name: 'buy',
    description: '🛍️ Compra um item',
    options: [{ name: 'item', description: 'Item para comprar', type: 3, required: true }]
  },
  {
    name: 'inventory',
    description: '🎒 Mostra seu inventário'
  },
  {
    name: 'use',
    description: '✨ Usa um item do inventário',
    options: [{ name: 'item', description: 'Item', type: 3, required: true }]
  },
  {
    name: 'sell',
    description: '💲 Vende um item',
    options: [{ name: 'item', description: 'Item', type: 3, required: true }]
  },
  {
    name: 'gamble',
    description: '🎰 Aposta dinheiro',
    options: [{ name: 'amount', description: 'Quantia', type: 4, required: true }]
  },
  {
    name: 'slots',
    description: '🎰 Joga caça-níqueis',
    options: [{ name: 'bet', description: 'Aposta', type: 4, required: true }]
  },
  {
    name: 'blackjack',
    description: '🃏 Joga blackjack',
    options: [{ name: 'bet', description: 'Aposta', type: 4, required: true }]
  },

  // ==================== NÍVEIS ====================
  {
    name: 'rank',
    description: '📊 Mostra seu nível e XP',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: false }]
  },
  {
    name: 'xpleaderboard',
    description: '🏅 Ranking de XP do servidor'
  },
  {
    name: 'setxp',
    description: '⚙️ Define o XP de um usuário (admin)',
    options: [
      { name: 'user', description: 'Usuário', type: 6, required: true },
      { name: 'xp', description: 'Quantidade de XP', type: 4, required: true }
    ]
  },
  {
    name: 'setlevel',
    description: '⚙️ Define o nível de um usuário (admin)',
    options: [
      { name: 'user', description: 'Usuário', type: 6, required: true },
      { name: 'level', description: 'Nível', type: 4, required: true }
    ]
  },

  // ==================== MÚSICA ====================
  {
    name: 'play',
    description: '▶️ Toca uma música',
    options: [{ name: 'query', description: 'Nome ou URL', type: 3, required: true }]
  },
  {
    name: 'pause',
    description: '⏸️ Pausa a música'
  },
  {
    name: 'resume',
    description: '▶️ Continua a música'
  },
  {
    name: 'skip',
    description: '⏭️ Pula a música atual'
  },
  {
    name: 'stop',
    description: '⏹️ Para a música e limpa a fila'
  },
  {
    name: 'queue',
    description: '📋 Mostra a fila de músicas'
  },
  {
    name: 'nowplaying',
    description: '🎵 Mostra a música atual'
  },
  {
    name: 'volume',
    description: '🔊 Ajusta o volume',
    options: [{ name: 'level', description: 'Volume (0-100)', type: 4, required: true }]
  },
  {
    name: 'loop',
    description: '🔁 Ativa/desativa loop'
  },
  {
    name: 'shuffle',
    description: '🔀 Embaralha a fila'
  },

  // ==================== GIVEAWAY ====================
  {
    name: 'giveaway',
    description: '🎉 Inicia um sorteio',
    options: [
      { name: 'duration', description: 'Duração (ex: 1h, 1d)', type: 3, required: true },
      { name: 'winners', description: 'Número de ganhadores', type: 4, required: true },
      { name: 'prize', description: 'Prêmio', type: 3, required: true }
    ]
  },
  {
    name: 'greroll',
    description: '🔄 Sorteia novamente um giveaway',
    options: [{ name: 'message_id', description: 'ID da mensagem', type: 3, required: true }]
  },
  {
    name: 'gend',
    description: '🛑 Finaliza um giveaway',
    options: [{ name: 'message_id', description: 'ID da mensagem', type: 3, required: true }]
  },

  // ==================== TICKETS ====================
  {
    name: 'ticket',
    description: '🎫 Cria um ticket de suporte'
  },
  {
    name: 'ticketsetup',
    description: '⚙️ Configura o sistema de tickets'
  },
  {
    name: 'ticketclose',
    description: '🔐 Fecha o ticket atual'
  },
  {
    name: 'ticketadd',
    description: '➕ Adiciona usuário ao ticket',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },
  {
    name: 'ticketremove',
    description: '➖ Remove usuário do ticket',
    options: [{ name: 'user', description: 'Usuário', type: 6, required: true }]
  },

  // ==================== CONFIGURAÇÃO ====================
  {
    name: 'setwelcome',
    description: '👋 Configura o canal de boas-vindas',
    options: [{ name: 'channel', description: 'Canal', type: 7, required: true }]
  },
  {
    name: 'setleave',
    description: '👋 Configura o canal de despedida',
    options: [{ name: 'channel', description: 'Canal', type: 7, required: true }]
  },
  {
    name: 'setlogs',
    description: '📝 Configura o canal de logs',
    options: [{ name: 'channel', description: 'Canal', type: 7, required: true }]
  },
  {
    name: 'autorole',
    description: '🏷️ Configura cargo automático',
    options: [{ name: 'role', description: 'Cargo', type: 8, required: true }]
  },
  {
    name: 'setsuggestions',
    description: '💡 Configura o canal de sugestões',
    options: [{ name: 'channel', description: 'Canal', type: 7, required: true }]
  },

  // ==================== POLLS ====================
  {
    name: 'poll',
    description: '📊 Cria uma enquete',
    options: [
      { name: 'question', description: 'Pergunta', type: 3, required: true },
      { name: 'options', description: 'Opções separadas por |', type: 3, required: true }
    ]
  },
  {
    name: 'quickpoll',
    description: '👍 Cria uma enquete rápida (sim/não)',
    options: [{ name: 'question', description: 'Pergunta', type: 3, required: true }]
  },
  {
    name: 'suggest',
    description: '💡 Envia uma sugestão',
    options: [{ name: 'suggestion', description: 'Sua sugestão', type: 3, required: true }]
  },

  // ==================== OUTROS ====================
  {
    name: 'afk',
    description: '💤 Define seu status AFK',
    options: [{ name: 'reason', description: 'Motivo', type: 3, required: false }]
  },
  {
    name: 'remind',
    description: '⏰ Define um lembrete',
    options: [
      { name: 'time', description: 'Tempo (ex: 10m, 1h)', type: 3, required: true },
      { name: 'message', description: 'Mensagem', type: 3, required: true }
    ]
  },
  {
    name: 'todo',
    description: '📝 Gerencia sua lista de tarefas',
    options: [
      { name: 'action', description: 'Ação', type: 3, required: true, choices: [
        { name: 'Adicionar', value: 'add' },
        { name: 'Remover', value: 'remove' },
        { name: 'Listar', value: 'list' },
        { name: 'Limpar', value: 'clear' }
      ]},
      { name: 'task', description: 'Tarefa', type: 3, required: false }
    ]
  },
  {
    name: 'calc',
    description: '🔢 Calculadora',
    options: [{ name: 'expression', description: 'Expressão matemática', type: 3, required: true }]
  },
  {
    name: 'weather',
    description: '🌤️ Mostra o clima de uma cidade',
    options: [{ name: 'city', description: 'Cidade', type: 3, required: true }]
  },
  {
    name: 'translate',
    description: '🌐 Traduz texto',
    options: [
      { name: 'text', description: 'Texto', type: 3, required: true },
      { name: 'to', description: 'Para qual idioma (ex: en, pt, es)', type: 3, required: true }
    ]
  },
  {
    name: 'color',
    description: '🎨 Mostra informações de uma cor',
    options: [{ name: 'hex', description: 'Código hex (ex: #FF5733)', type: 3, required: true }]
  },
  {
    name: 'qrcode',
    description: '📱 Gera um QR Code',
    options: [{ name: 'text', description: 'Texto ou URL', type: 3, required: true }]
  },
  {
    name: 'screenshot',
    description: '📸 Tira screenshot de um site',
    options: [{ name: 'url', description: 'URL do site', type: 3, required: true }]
  },
  {
    name: 'github',
    description: '🐙 Mostra perfil do GitHub',
    options: [{ name: 'username', description: 'Nome de usuário', type: 3, required: true }]
  }
];

// ============================================
// DADOS EM MEMÓRIA (em produção use um banco de dados)
// ============================================

const userData = new Map();
const warnings = new Map();
const afkUsers = new Map();
const deletedMessages = new Map();
const editedMessages = new Map();
const reminders = [];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getUser(id) {
  if (!userData.has(id)) {
    userData.set(id, {
      balance: 0,
      bank: 0,
      xp: 0,
      level: 1,
      inventory: [],
      lastDaily: 0,
      lastWeekly: 0,
      lastWork: 0,
      lastCrime: 0
    });
  }
  return userData.get(id);
}

function addXP(userId, amount) {
  const user = getUser(userId);
  user.xp += amount;
  const xpNeeded = user.level * 100;
  if (user.xp >= xpNeeded) {
    user.level++;
    user.xp -= xpNeeded;
    return true;
  }
  return false;
}

function parseTime(timeStr) {
  const match = timeStr.match(/^(\d+)(s|m|h|d)$/);
  if (!match) return null;
  const amount = parseInt(match[1]);
  const unit = match[2];
  const multipliers = { s: 1000, m: 60000, h: 3600000, d: 86400000 };
  return amount * multipliers[unit];
}

// ============================================
// SCRIPTBLOX API FUNCTIONS
// ============================================

async function searchScriptBlox(query) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&max=10`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar no ScriptBlox:', error);
    return null;
  }
}

async function getScriptBloxTop() {
  try {
    const response = await axios.get('https://scriptblox.com/api/script/fetch?page=1&max=10');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar top scripts:', error);
    return null;
  }
}

async function getScriptBloxRecent() {
  try {
    const response = await axios.get('https://scriptblox.com/api/script/fetch?page=1&max=10&sort=date');
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar scripts recentes:', error);
    return null;
  }
}

async function searchScriptBloxByGame(game) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(game)}&max=10&mode=game`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar scripts por jogo:', error);
    return null;
  }
}

// ============================================
// HANDLER DE COMANDOS
// ============================================

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, options, user, member, guild, channel } = interaction;

  try {
    // ==================== SCRIPTBLOX COMMANDS ====================
    
    if (commandName === 'scriptsearch') {
      await interaction.deferReply();
      const query = options.getString('query');
      const data = await searchScriptBlox(query);
      
      if (!data || !data.result || !data.result.scripts || data.result.scripts.length === 0) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Nenhum resultado')
            .setDescription(`Não encontrei scripts para: **${query}**`)
          ]
        });
      }

      const scripts = data.result.scripts.slice(0, 5);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🔍 Resultados para: ${query}`)
        .setDescription(`Encontrados ${data.result.totalPages * 10}+ scripts`)
        .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
        .setTimestamp();

      scripts.forEach((script, index) => {
        const gameInfo = script.game ? `🎮 ${script.game.name}` : '🎮 Universal';
        const views = script.views || 0;
        const verified = script.verified ? '✅' : '';
        
        embed.addFields({
          name: `${index + 1}. ${script.title} ${verified}`,
          value: `${gameInfo}\n👁️ ${views.toLocaleString()} views\n[Ver Script](https://scriptblox.com/script/${script.slug})`,
          inline: true
        });
      });

      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'scripttop') {
      await interaction.deferReply();
      const data = await getScriptBloxTop();
      
      if (!data || !data.result || !data.result.scripts) {
        return interaction.editReply('❌ Erro ao buscar scripts populares.');
      }

      const scripts = data.result.scripts.slice(0, 10);
      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Scripts Mais Populares')
        .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
        .setTimestamp();

      scripts.forEach((script, index) => {
        embed.addFields({
          name: `#${index + 1} ${script.title}`,
          value: `👁️ ${(script.views || 0).toLocaleString()} views`,
          inline: true
        });
      });

      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'scriptrecent') {
      await interaction.deferReply();
      const data = await getScriptBloxRecent();
      
      if (!data || !data.result || !data.result.scripts) {
        return interaction.editReply('❌ Erro ao buscar scripts recentes.');
      }

      const scripts = data.result.scripts.slice(0, 10);
      const embed = new EmbedBuilder()
        .setColor('#00FF00')
        .setTitle('🆕 Scripts Mais Recentes')
        .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
        .setTimestamp();

      scripts.forEach((script, index) => {
        embed.addFields({
          name: `${index + 1}. ${script.title}`,
          value: `🎮 ${script.game?.name || 'Universal'}`,
          inline: true
        });
      });

      return interaction.editReply({ embeds: [embed] });
    }

    if (commandName === 'scriptgame') {
      await interaction.deferReply();
      const game = options.getString('game');
      const data = await searchScriptBloxByGame(game);
      
      if (!data || !data.result || !data.result.scripts || data.result.scripts.length === 0) {
        return interaction.editReply({
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Nenhum resultado')
            .setDescription(`Não encontrei scripts para o jogo: **${game}**`)
          ]
        });
      }

      const scripts = data.result.scripts.slice(0, 5);
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎮 Scripts para: ${game}`)
        .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
        .setTimestamp();

      scripts.forEach((script, index) => {
        embed.addFields({
          name: `${index + 1}. ${script.title}`,
          value: `👁️ ${(script.views || 0).toLocaleString()} views\n[Ver Script](https://scriptblox.com/script/${script.slug})`,
          inline: true
        });
      });

      return interaction.editReply({ embeds: [embed] });
    }

    // ==================== UTILITY COMMANDS ====================

    if (commandName === 'ping') {
      const sent = await interaction.reply({ content: '🏓 Calculando...', fetchReply: true });
      const latency = sent.createdTimestamp - interaction.createdTimestamp;
      return interaction.editReply(`🏓 Pong!\n📡 Latência: **${latency}ms**\n💓 API: **${client.ws.ping}ms**`);
    }

    if (commandName === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📚 Comandos do Nexus Bot')
        .setDescription('Aqui estão todas as categorias de comandos disponíveis:')
        .addFields(
          { name: '🔍 ScriptBlox', value: '`/scriptsearch` `/scripttop` `/scriptrecent` `/scriptgame`', inline: false },
          { name: '🔨 Moderação', value: '`/ban` `/kick` `/mute` `/warn` `/purge` `/lock` e mais...', inline: false },
          { name: '🎮 Diversão', value: '`/8ball` `/coinflip` `/meme` `/ship` `/hug` e mais...', inline: false },
          { name: '💰 Economia', value: '`/balance` `/daily` `/work` `/rob` `/shop` e mais...', inline: false },
          { name: '📊 Níveis', value: '`/rank` `/xpleaderboard` `/setxp` `/setlevel`', inline: false },
          { name: '🎵 Música', value: '`/play` `/pause` `/skip` `/queue` `/volume` e mais...', inline: false },
          { name: '🎉 Giveaway', value: '`/giveaway` `/greroll` `/gend`', inline: false },
          { name: '🎫 Tickets', value: '`/ticket` `/ticketclose` `/ticketadd` `/ticketremove`', inline: false },
          { name: '⚙️ Config', value: '`/setwelcome` `/setlogs` `/autorole` e mais...', inline: false },
          { name: '🔧 Utilidades', value: '`/userinfo` `/serverinfo` `/avatar` `/calc` `/weather` e mais...', inline: false }
        )
        .setFooter({ text: `Total: ${commands.length} comandos • Nexus Bot` })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'botinfo') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🤖 Nexus Bot')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
          { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
          { name: '📝 Comandos', value: `${commands.length}`, inline: true },
          { name: '⏰ Uptime', value: `${Math.floor(client.uptime / 3600000)}h ${Math.floor((client.uptime % 3600000) / 60000)}m`, inline: true },
          { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
          { name: '📦 Versão', value: '1.0.0', inline: true }
        )
        .setFooter({ text: 'Nexus Bot • O melhor bot para seu servidor!' })
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'serverinfo') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${guild.name}`)
        .setThumbnail(guild.iconURL())
        .addFields(
          { name: '👑 Dono', value: `<@${guild.ownerId}>`, inline: true },
          { name: '👥 Membros', value: `${guild.memberCount}`, inline: true },
          { name: '💬 Canais', value: `${guild.channels.cache.size}`, inline: true },
          { name: '🏷️ Cargos', value: `${guild.roles.cache.size}`, inline: true },
          { name: '😀 Emojis', value: `${guild.emojis.cache.size}`, inline: true },
          { name: '📅 Criado em', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:R>`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'userinfo') {
      const targetUser = options.getUser('user') || user;
      const targetMember = guild.members.cache.get(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`👤 ${targetUser.tag}`)
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '🆔 ID', value: targetUser.id, inline: true },
          { name: '📅 Conta criada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📥 Entrou no servidor', value: targetMember ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
          { name: '🏷️ Cargos', value: targetMember ? targetMember.roles.cache.map(r => r.name).slice(0, 10).join(', ') || 'Nenhum' : 'N/A', inline: false }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'avatar') {
      const targetUser = options.getUser('user') || user;
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🖼️ Avatar de ${targetUser.tag}`)
        .setImage(targetUser.displayAvatarURL({ size: 4096 }))
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'invite') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📨 Convide o Nexus Bot!')
        .setDescription('[Clique aqui para adicionar ao seu servidor](https://discord.com/api/oauth2/authorize?client_id=' + client.user.id + '&permissions=8&scope=bot%20applications.commands)')
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'uptime') {
      const uptime = client.uptime;
      const hours = Math.floor(uptime / 3600000);
      const minutes = Math.floor((uptime % 3600000) / 60000);
      const seconds = Math.floor((uptime % 60000) / 1000);

      return interaction.reply(`⏰ Estou online há: **${hours}h ${minutes}m ${seconds}s**`);
    }

    // ==================== MODERATION COMMANDS ====================

    if (commandName === 'ban') {
      if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return interaction.reply({ content: '❌ Você não tem permissão para banir.', ephemeral: true });
      }

      const targetUser = options.getUser('user');
      const reason = options.getString('reason') || 'Sem motivo especificado';
      const targetMember = guild.members.cache.get(targetUser.id);

      if (!targetMember) return interaction.reply({ content: '❌ Usuário não encontrado.', ephemeral: true });
      if (!targetMember.bannable) return interaction.reply({ content: '❌ Não posso banir este usuário.', ephemeral: true });

      await targetMember.ban({ reason });
      return interaction.reply(`✅ **${targetUser.tag}** foi banido.\n📝 Motivo: ${reason}`);
    }

    if (commandName === 'kick') {
      if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return interaction.reply({ content: '❌ Você não tem permissão para expulsar.', ephemeral: true });
      }

      const targetUser = options.getUser('user');
      const reason = options.getString('reason') || 'Sem motivo especificado';
      const targetMember = guild.members.cache.get(targetUser.id);

      if (!targetMember) return interaction.reply({ content: '❌ Usuário não encontrado.', ephemeral: true });
      if (!targetMember.kickable) return interaction.reply({ content: '❌ Não posso expulsar este usuário.', ephemeral: true });

      await targetMember.kick(reason);
      return interaction.reply(`✅ **${targetUser.tag}** foi expulso.\n📝 Motivo: ${reason}`);
    }

    if (commandName === 'mute') {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: '❌ Você não tem permissão para silenciar.', ephemeral: true });
      }

      const targetUser = options.getUser('user');
      const duration = options.getString('duration');
      const reason = options.getString('reason') || 'Sem motivo especificado';
      const targetMember = guild.members.cache.get(targetUser.id);

      if (!targetMember) return interaction.reply({ content: '❌ Usuário não encontrado.', ephemeral: true });

      const ms = parseTime(duration);
      if (!ms) return interaction.reply({ content: '❌ Duração inválida. Use: 10m, 1h, 1d', ephemeral: true });

      await targetMember.timeout(ms, reason);
      return interaction.reply(`✅ **${targetUser.tag}** foi silenciado por ${duration}.\n📝 Motivo: ${reason}`);
    }

    if (commandName === 'purge') {
      if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return interaction.reply({ content: '❌ Você não tem permissão para apagar mensagens.', ephemeral: true });
      }

      const amount = options.getInteger('amount');
      if (amount < 1 || amount > 100) {
        return interaction.reply({ content: '❌ Quantidade deve ser entre 1 e 100.', ephemeral: true });
      }

      const deleted = await channel.bulkDelete(amount, true);
      return interaction.reply({ content: `✅ ${deleted.size} mensagens apagadas.`, ephemeral: true });
    }

    if (commandName === 'lock') {
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
      }

      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: false });
      return interaction.reply('🔒 Canal bloqueado.');
    }

    if (commandName === 'unlock') {
      if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
      }

      await channel.permissionOverwrites.edit(guild.roles.everyone, { SendMessages: true });
      return interaction.reply('🔓 Canal desbloqueado.');
    }

    if (commandName === 'warn') {
      if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return interaction.reply({ content: '❌ Você não tem permissão.', ephemeral: true });
      }

      const targetUser = options.getUser('user');
      const reason = options.getString('reason');

      if (!warnings.has(targetUser.id)) warnings.set(targetUser.id, []);
      warnings.get(targetUser.id).push({ reason, date: Date.now(), by: user.id });

      return interaction.reply(`⚠️ **${targetUser.tag}** foi avisado.\n📝 Motivo: ${reason}\n📊 Total de avisos: ${warnings.get(targetUser.id).length}`);
    }

    // ==================== FUN COMMANDS ====================

    if (commandName === '8ball') {
      const responses = [
        '🎱 Certamente!', '🎱 Com certeza!', '🎱 Sem dúvidas!', '🎱 Sim!',
        '🎱 Provavelmente sim.', '🎱 As perspectivas são boas.',
        '🎱 Não tenho certeza.', '🎱 Pergunte novamente.',
        '🎱 Melhor não contar agora.', '🎱 Não posso prever agora.',
        '🎱 Não conte com isso.', '🎱 Minha resposta é não.',
        '🎱 As perspectivas não são boas.', '🎱 Muito duvidoso.'
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      return interaction.reply(`${response}\n\n❓ Pergunta: *${options.getString('question')}*`);
    }

    if (commandName === 'coinflip') {
      const result = Math.random() < 0.5 ? '🪙 Cara!' : '🪙 Coroa!';
      return interaction.reply(result);
    }

    if (commandName === 'dice') {
      const sides = options.getInteger('sides') || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      return interaction.reply(`🎲 Você tirou: **${result}** (d${sides})`);
    }

    if (commandName === 'rps') {
      const choices = ['rock', 'paper', 'scissors'];
      const userChoice = options.getString('choice');
      const botChoice = choices[Math.floor(Math.random() * 3)];

      const emojis = { rock: '🪨', paper: '📄', scissors: '✂️' };
      const names = { rock: 'Pedra', paper: 'Papel', scissors: 'Tesoura' };

      let result;
      if (userChoice === botChoice) result = '🤝 Empate!';
      else if (
        (userChoice === 'rock' && botChoice === 'scissors') ||
        (userChoice === 'paper' && botChoice === 'rock') ||
        (userChoice === 'scissors' && botChoice === 'paper')
      ) result = '🎉 Você ganhou!';
      else result = '😢 Você perdeu!';

      return interaction.reply(`${emojis[userChoice]} ${names[userChoice]} vs ${emojis[botChoice]} ${names[botChoice]}\n\n${result}`);
    }

    if (commandName === 'ship') {
      const user1 = options.getUser('user1');
      const user2 = options.getUser('user2');
      const percentage = Math.floor(Math.random() * 101);

      let bar = '';
      const filled = Math.floor(percentage / 10);
      bar = '❤️'.repeat(filled) + '🖤'.repeat(10 - filled);

      let message;
      if (percentage >= 80) message = '💕 Um casal perfeito!';
      else if (percentage >= 60) message = '💖 Tem potencial!';
      else if (percentage >= 40) message = '💛 Talvez funcione...';
      else if (percentage >= 20) message = '💔 Difícil...';
      else message = '💀 Nem tenta.';

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('💕 Love Calculator')
        .setDescription(`${user1} + ${user2}\n\n${bar}\n**${percentage}%**\n\n${message}`)
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'rate') {
      const thing = options.getString('thing');
      const rating = Math.floor(Math.random() * 11);
      const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
      return interaction.reply(`📊 Avaliação de **${thing}**:\n\n${stars}\n**${rating}/10**`);
    }

    if (commandName === 'choose') {
      const optionsStr = options.getString('options');
      const choices = optionsStr.split('|').map(c => c.trim());
      const chosen = choices[Math.floor(Math.random() * choices.length)];
      return interaction.reply(`🤔 Eu escolho: **${chosen}**`);
    }

    if (commandName === 'reverse') {
      const text = options.getString('text');
      return interaction.reply(`🔄 ${text.split('').reverse().join('')}`);
    }

    if (commandName === 'mock') {
      const text = options.getString('text');
      const mocked = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      return interaction.reply(`🐔 ${mocked}`);
    }

    // ==================== ECONOMY COMMANDS ====================

    if (commandName === 'balance') {
      const targetUser = options.getUser('user') || user;
      const data = getUser(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`💰 Saldo de ${targetUser.tag}`)
        .addFields(
          { name: '👛 Carteira', value: `${data.balance.toLocaleString()} moedas`, inline: true },
          { name: '🏦 Banco', value: `${data.bank.toLocaleString()} moedas`, inline: true },
          { name: '💎 Total', value: `${(data.balance + data.bank).toLocaleString()} moedas`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'daily') {
      const data = getUser(user.id);
      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000;

      if (now - data.lastDaily < cooldown) {
        const remaining = cooldown - (now - data.lastDaily);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return interaction.reply({ content: `⏰ Você já coletou hoje! Volte em **${hours}h ${minutes}m**.`, ephemeral: true });
      }

      const amount = 1000 + Math.floor(Math.random() * 500);
      data.balance += amount;
      data.lastDaily = now;

      return interaction.reply(`📅 Você coletou sua recompensa diária de **${amount.toLocaleString()}** moedas!`);
    }

    if (commandName === 'work') {
      const data = getUser(user.id);
      const now = Date.now();
      const cooldown = 30 * 60 * 1000;

      if (now - data.lastWork < cooldown) {
        const remaining = cooldown - (now - data.lastWork);
        const minutes = Math.floor(remaining / 60000);
        return interaction.reply({ content: `⏰ Você está cansado! Descanse por mais **${minutes}m**.`, ephemeral: true });
      }

      const jobs = ['programador', 'chef', 'médico', 'professor', 'artista', 'engenheiro'];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const amount = 200 + Math.floor(Math.random() * 300);

      data.balance += amount;
      data.lastWork = now;

      return interaction.reply(`💼 Você trabalhou como **${job}** e ganhou **${amount.toLocaleString()}** moedas!`);
    }

    if (commandName === 'rob') {
      const targetUser = options.getUser('user');
      if (targetUser.id === user.id) return interaction.reply({ content: '❌ Você não pode roubar de si mesmo!', ephemeral: true });

      const data = getUser(user.id);
      const targetData = getUser(targetUser.id);

      if (targetData.balance < 100) return interaction.reply({ content: '❌ Esse usuário é muito pobre para roubar.', ephemeral: true });

      const success = Math.random() < 0.4;
      if (success) {
        const amount = Math.floor(targetData.balance * (Math.random() * 0.3 + 0.1));
        data.balance += amount;
        targetData.balance -= amount;
        return interaction.reply(`💸 Você roubou **${amount.toLocaleString()}** moedas de ${targetUser}!`);
      } else {
        const fine = Math.floor(data.balance * 0.2);
        data.balance -= fine;
        return interaction.reply(`🚔 Você foi pego e pagou **${fine.toLocaleString()}** moedas de multa!`);
      }
    }

    if (commandName === 'pay') {
      const targetUser = options.getUser('user');
      const amount = options.getInteger('amount');

      if (targetUser.id === user.id) return interaction.reply({ content: '❌ Você não pode pagar a si mesmo!', ephemeral: true });
      if (amount <= 0) return interaction.reply({ content: '❌ Quantia inválida!', ephemeral: true });

      const data = getUser(user.id);
      if (data.balance < amount) return interaction.reply({ content: '❌ Saldo insuficiente!', ephemeral: true });

      const targetData = getUser(targetUser.id);
      data.balance -= amount;
      targetData.balance += amount;

      return interaction.reply(`💵 Você transferiu **${amount.toLocaleString()}** moedas para ${targetUser}!`);
    }

    if (commandName === 'deposit') {
      const amount = options.getInteger('amount');
      const data = getUser(user.id);

      if (amount <= 0) return interaction.reply({ content: '❌ Quantia inválida!', ephemeral: true });
      if (data.balance < amount) return interaction.reply({ content: '❌ Saldo insuficiente!', ephemeral: true });

      data.balance -= amount;
      data.bank += amount;

      return interaction.reply(`🏦 Você depositou **${amount.toLocaleString()}** moedas no banco!`);
    }

    if (commandName === 'withdraw') {
      const amount = options.getInteger('amount');
      const data = getUser(user.id);

      if (amount <= 0) return interaction.reply({ content: '❌ Quantia inválida!', ephemeral: true });
      if (data.bank < amount) return interaction.reply({ content: '❌ Saldo insuficiente no banco!', ephemeral: true });

      data.bank -= amount;
      data.balance += amount;

      return interaction.reply(`💳 Você sacou **${amount.toLocaleString()}** moedas do banco!`);
    }

    if (commandName === 'gamble') {
      const amount = options.getInteger('amount');
      const data = getUser(user.id);

      if (amount <= 0) return interaction.reply({ content: '❌ Quantia inválida!', ephemeral: true });
      if (data.balance < amount) return interaction.reply({ content: '❌ Saldo insuficiente!', ephemeral: true });

      const win = Math.random() < 0.45;
      if (win) {
        data.balance += amount;
        return interaction.reply(`🎰 Você ganhou **${amount.toLocaleString()}** moedas! 🎉`);
      } else {
        data.balance -= amount;
        return interaction.reply(`🎰 Você perdeu **${amount.toLocaleString()}** moedas! 😢`);
      }
    }

    if (commandName === 'leaderboard') {
      const sorted = [...userData.entries()]
        .map(([id, data]) => ({ id, total: data.balance + data.bank }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Ranking dos Mais Ricos')
        .setTimestamp();

      let description = '';
      for (let i = 0; i < sorted.length; i++) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        description += `${medal} <@${sorted[i].id}> - **${sorted[i].total.toLocaleString()}** moedas\n`;
      }

      embed.setDescription(description || 'Nenhum dado encontrado.');
      return interaction.reply({ embeds: [embed] });
    }

    // ==================== LEVEL COMMANDS ====================

    if (commandName === 'rank') {
      const targetUser = options.getUser('user') || user;
      const data = getUser(targetUser.id);
      const xpNeeded = data.level * 100;

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 Rank de ${targetUser.tag}`)
        .setThumbnail(targetUser.displayAvatarURL())
        .addFields(
          { name: '🏅 Nível', value: `${data.level}`, inline: true },
          { name: '✨ XP', value: `${data.xp}/${xpNeeded}`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });
    }

    if (commandName === 'xpleaderboard') {
      const sorted = [...userData.entries()]
        .map(([id, data]) => ({ id, level: data.level, xp: data.xp }))
        .sort((a, b) => b.level - a.level || b.xp - a.xp)
        .slice(0, 10);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏅 Ranking de XP')
        .setTimestamp();

      let description = '';
      for (let i = 0; i < sorted.length; i++) {
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        description += `${medal} <@${sorted[i].id}> - Nível **${sorted[i].level}** (${sorted[i].xp} XP)\n`;
      }

      embed.setDescription(description || 'Nenhum dado encontrado.');
      return interaction.reply({ embeds: [embed] });
    }

    // ==================== MISC COMMANDS ====================

    if (commandName === 'calc') {
      const expression = options.getString('expression');
      try {
        const sanitized = expression.replace(/[^0-9+\-*/().%\s]/g, '');
        const result = Function('"use strict"; return (' + sanitized + ')')();
        return interaction.reply(`🔢 **Resultado:** ${result}`);
      } catch {
        return interaction.reply({ content: '❌ Expressão inválida!', ephemeral: true });
      }
    }

    if (commandName === 'remind') {
      const time = options.getString('time');
      const message = options.getString('message');
      const ms = parseTime(time);

      if (!ms) return interaction.reply({ content: '❌ Tempo inválido. Use: 10m, 1h, 1d', ephemeral: true });

      setTimeout(() => {
        user.send(`⏰ Lembrete: **${message}**`).catch(() => {});
      }, ms);

      return interaction.reply(`✅ Te lembrarei em **${time}**: ${message}`);
    }

    if (commandName === 'afk') {
      const reason = options.getString('reason') || 'Sem motivo';
      afkUsers.set(user.id, { reason, since: Date.now() });
      return interaction.reply(`💤 Você está AFK: **${reason}**`);
    }

    if (commandName === 'poll') {
      const question = options.getString('question');
      const optionsStr = options.getString('options');
      const choices = optionsStr.split('|').map(c => c.trim()).slice(0, 10);

      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      let description = '';
      choices.forEach((choice, i) => {
        description += `${emojis[i]} ${choice}\n`;
      });

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${question}`)
        .setDescription(description)
        .setFooter({ text: `Enquete criada por ${user.tag}` })
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      for (let i = 0; i < choices.length; i++) {
        await msg.react(emojis[i]);
      }
    }

    if (commandName === 'quickpoll') {
      const question = options.getString('question');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${question}`)
        .setDescription('👍 Sim | 👎 Não')
        .setFooter({ text: `Enquete criada por ${user.tag}` })
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [embed], fetchReply: true });
      await msg.react('👍');
      await msg.react('👎');
    }

    if (commandName === 'membercount') {
      return interaction.reply(`👥 Este servidor tem **${guild.memberCount}** membros!`);
    }

    if (commandName === 'emojis') {
      const emojis = guild.emojis.cache.map(e => e.toString()).slice(0, 50).join(' ');
      return interaction.reply(`😀 Emojis (${guild.emojis.cache.size}): ${emojis || 'Nenhum'}`);
    }

    if (commandName === 'roles') {
      const roles = guild.roles.cache.sort((a, b) => b.position - a.position).map(r => r.name).slice(0, 20).join(', ');
      return interaction.reply(`🏷️ Cargos (${guild.roles.cache.size}): ${roles}`);
    }

    // Default response for unimplemented commands
    return interaction.reply({ content: '⚙️ Este comando está em desenvolvimento!', ephemeral: true });

  } catch (error) {
    console.error('Erro no comando:', error);
    if (interaction.replied || interaction.deferred) {
      return interaction.followUp({ content: '❌ Ocorreu um erro ao executar este comando.', ephemeral: true });
    }
    return interaction.reply({ content: '❌ Ocorreu um erro ao executar este comando.', ephemeral: true });
  }
});

// ============================================
// EVENTOS
// ============================================

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Sistema de XP
  const leveledUp = addXP(message.author.id, Math.floor(Math.random() * 10) + 5);
  if (leveledUp) {
    const data = getUser(message.author.id);
    message.channel.send(`🎉 Parabéns ${message.author}! Você subiu para o nível **${data.level}**!`);
  }

  // Verificar AFK
  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.reply({ content: '👋 Bem-vindo de volta! Seu AFK foi removido.', allowedMentions: { repliedUser: false } });
  }

  // Mencionar usuário AFK
  message.mentions.users.forEach(u => {
    if (afkUsers.has(u.id)) {
      const afkData = afkUsers.get(u.id);
      message.reply({ content: `💤 **${u.tag}** está AFK: ${afkData.reason}`, allowedMentions: { repliedUser: false } });
    }
  });
});

// Salvar mensagens deletadas
client.on('messageDelete', message => {
  if (message.author?.bot) return;
  deletedMessages.set(message.channel.id, {
    content: message.content,
    author: message.author,
    timestamp: Date.now()
  });
});

// Salvar mensagens editadas
client.on('messageUpdate', (oldMessage, newMessage) => {
  if (oldMessage.author?.bot) return;
  editedMessages.set(oldMessage.channel.id, {
    oldContent: oldMessage.content,
    newContent: newMessage.content,
    author: oldMessage.author,
    timestamp: Date.now()
  });
});

// ============================================
// INICIALIZAÇÃO
// ============================================

client.once('ready', async () => {
  console.log(`✅ ${client.user.tag} está online!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`👥 Usuários: ${client.users.cache.size}`);

  // Registrar comandos
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

  try {
    console.log('🔄 Registrando comandos...');
    
    // Registra globalmente (demora até 1 hora para propagar)
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );

    console.log(`✅ ${commands.length} comandos registrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }

  // Status do bot
  client.user.setActivity('/help | nexusbot.com', { type: 3 });
});

// Login
client.login(process.env.DISCORD_TOKEN);
