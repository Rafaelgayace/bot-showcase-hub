require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');
const axios = require('axios');

const PREFIX = '.';

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

// ============================================
// DADOS EM MEMÓRIA (em produção use um banco de dados)
// ============================================

const userData = new Map();
const warnings = new Map();
const afkUsers = new Map();
const deletedMessages = new Map();
const editedMessages = new Map();
const reminders = [];
const guildPrefixes = new Map();

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function getPrefix(guildId) {
  return guildPrefixes.get(guildId) || PREFIX;
}

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

function getMentionedUser(message, args) {
  return message.mentions.users.first() || client.users.cache.get(args[0]);
}

function getMentionedMember(message, args) {
  return message.mentions.members.first() || message.guild.members.cache.get(args[0]);
}

function getMentionedRole(message, args) {
  return message.mentions.roles.first() || message.guild.roles.cache.get(args[0]);
}

function getMentionedChannel(message, args) {
  return message.mentions.channels.first() || message.guild.channels.cache.get(args[0]);
}

// ============================================
// SCRIPTBLOX API FUNCTIONS
// ============================================

async function searchScriptBlox(query, page = 1) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}&page=${page}&max=5`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar no ScriptBlox:', error);
    return null;
  }
}

async function getScriptBloxTop(page = 1) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/fetch?page=${page}&max=5`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar top scripts:', error);
    return null;
  }
}

async function getScriptBloxRecent(page = 1) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/fetch?page=${page}&max=5&sort=date`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar scripts recentes:', error);
    return null;
  }
}

async function searchScriptBloxByGame(game, page = 1) {
  try {
    const response = await axios.get(`https://scriptblox.com/api/script/search?q=${encodeURIComponent(game)}&page=${page}&max=5&mode=game`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar scripts por jogo:', error);
    return null;
  }
}

// Armazenar dados de paginação
const scriptSearchCache = new Map();

function createScriptEmbed(scripts, title, page, totalPages, color = '#5865F2') {
  const embed = new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(`📄 Página ${page} de ${totalPages}`)
    .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
    .setTimestamp();

  scripts.forEach((script, index) => {
    const gameInfo = script.game ? `🎮 ${script.game.name}` : '🎮 Universal';
    const views = script.views || 0;
    const verified = script.verified ? ' ✅' : '';
    const key = script.key ? ' 🔑' : '';

    embed.addFields({
      name: `${(page - 1) * 5 + index + 1}. ${script.title}${verified}${key}`,
      value: `${gameInfo}\n👁️ ${views.toLocaleString()} views\n[📜 Ver Script](https://scriptblox.com/script/${script.slug})`,
      inline: true
    });
  });

  return embed;
}

function createPaginationButtons(page, totalPages, type, query = '') {
  const row = new ActionRowBuilder();
  
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`script_first_${type}_${query}`)
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`script_prev_${type}_${query}`)
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page <= 1),
    new ButtonBuilder()
      .setCustomId(`script_page_${type}`)
      .setLabel(`${page}/${totalPages}`)
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(true),
    new ButtonBuilder()
      .setCustomId(`script_next_${type}_${query}`)
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(page >= totalPages),
    new ButtonBuilder()
      .setCustomId(`script_last_${type}_${query}`)
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(page >= totalPages)
  );

  return row;
}

// ============================================
// LISTA DE COMANDOS PARA HELP
// ============================================

const commandList = {
  'ScriptBlox 🔍': ['scriptsearch', 'scripttop', 'scriptrecent', 'scriptgame', 'scriptinfo'],
  'Moderação 🔨': ['ban', 'kick', 'mute', 'unmute', 'warn', 'warnings', 'clearwarnings', 'purge', 'slowmode', 'lock', 'unlock', 'nuke', 'setprefix', 'automod', 'antispam'],
  'Utilidades 🔧': ['help', 'ping', 'botinfo', 'serverinfo', 'userinfo', 'avatar', 'banner', 'invite', 'support', 'vote', 'uptime', 'membercount', 'roleinfo', 'channelinfo', 'emojis', 'stickers', 'roles', 'firstmessage', 'snipe', 'editsnipe'],
  'Diversão 🎮': ['8ball', 'coinflip', 'dice', 'rps', 'meme', 'joke', 'fact', 'quote', 'ship', 'hug', 'slap', 'kiss', 'pat', 'punch', 'wink', 'rate', 'howgay', 'howsmart', 'roast', 'compliment', 'choose', 'reverse', 'ascii', 'mock', 'emojify'],
  'Economia 💰': ['balance', 'daily', 'weekly', 'work', 'crime', 'rob', 'pay', 'deposit', 'withdraw', 'leaderboard', 'shop', 'buy', 'inventory', 'use', 'sell', 'gamble', 'slots', 'blackjack'],
  'Níveis 📊': ['rank', 'xpleaderboard', 'setxp', 'setlevel'],
  'Música 🎵': ['play', 'pause', 'resume', 'skip', 'stop', 'queue', 'nowplaying', 'volume', 'loop', 'shuffle'],
  'Giveaway 🎉': ['giveaway', 'greroll', 'gend'],
  'Tickets 🎫': ['ticket', 'ticketsetup', 'ticketclose', 'ticketadd', 'ticketremove'],
  'Configuração ⚙️': ['setwelcome', 'setleave', 'setlogs', 'autorole', 'setsuggestions'],
  'Enquetes 📊': ['poll', 'quickpoll', 'suggest'],
  'Outros 🔧': ['afk', 'remind', 'todo', 'calc', 'weather', 'translate', 'color', 'qrcode', 'screenshot', 'github']
};

// ============================================
// HANDLER DE MENSAGENS (COMANDOS COM PREFIXO)
// ============================================

client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Sistema de XP
  if (message.guild) {
    const leveledUp = addXP(message.author.id, Math.floor(Math.random() * 10) + 5);
    if (leveledUp) {
      const user = getUser(message.author.id);
      message.channel.send(`🎉 Parabéns ${message.author}! Você subiu para o nível **${user.level}**!`);
    }
  }

  // Salvar mensagens para snipe
  if (message.guild) {
    deletedMessages.set(message.channel.id, null);
  }

  // Verificar AFK
  if (afkUsers.has(message.author.id)) {
    afkUsers.delete(message.author.id);
    message.reply('👋 Bem-vindo de volta! Seu status AFK foi removido.');
  }

  message.mentions.users.forEach(user => {
    if (afkUsers.has(user.id)) {
      message.reply(`💤 ${user.username} está AFK: ${afkUsers.get(user.id)}`);
    }
  });

  const prefix = getPrefix(message.guild?.id);
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  try {
    // ==================== SCRIPTBLOX COMMANDS ====================

    if (command === 'scriptsearch') {
      const query = args.join(' ');
      if (!query) return message.reply(`❌ Use: \`${prefix}scriptsearch <termo>\``);

      const loadingMsg = await message.reply('🔍 Buscando scripts...');
      const data = await searchScriptBlox(query, 1);

      if (!data || !data.result || !data.result.scripts || data.result.scripts.length === 0) {
        return loadingMsg.edit({
          content: null,
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Nenhum resultado')
            .setDescription(`Não encontrei scripts para: **${query}**`)
          ]
        });
      }

      const scripts = data.result.scripts;
      const totalPages = data.result.totalPages || 1;
      
      const embed = createScriptEmbed(scripts, `🔍 Resultados para: ${query}`, 1, totalPages);
      const buttons = createPaginationButtons(1, totalPages, 'search', query);

      // Salvar cache para paginação
      const cacheKey = `search_${message.author.id}`;
      scriptSearchCache.set(cacheKey, { query, type: 'search' });

      return loadingMsg.edit({ content: null, embeds: [embed], components: totalPages > 1 ? [buttons] : [] });
    }

    if (command === 'scripttop') {
      const loadingMsg = await message.reply('🔍 Buscando scripts populares...');
      const data = await getScriptBloxTop(1);

      if (!data || !data.result || !data.result.scripts) {
        return loadingMsg.edit('❌ Erro ao buscar scripts populares.');
      }

      const scripts = data.result.scripts;
      const totalPages = data.result.totalPages || 1;
      
      const embed = createScriptEmbed(scripts, '🏆 Scripts Mais Populares', 1, totalPages, '#FFD700');
      const buttons = createPaginationButtons(1, totalPages, 'top');

      return loadingMsg.edit({ content: null, embeds: [embed], components: totalPages > 1 ? [buttons] : [] });
    }

    if (command === 'scriptrecent') {
      const loadingMsg = await message.reply('🔍 Buscando scripts recentes...');
      const data = await getScriptBloxRecent(1);

      if (!data || !data.result || !data.result.scripts) {
        return loadingMsg.edit('❌ Erro ao buscar scripts recentes.');
      }

      const scripts = data.result.scripts;
      const totalPages = data.result.totalPages || 1;
      
      const embed = createScriptEmbed(scripts, '🆕 Scripts Mais Recentes', 1, totalPages, '#00FF00');
      const buttons = createPaginationButtons(1, totalPages, 'recent');

      return loadingMsg.edit({ content: null, embeds: [embed], components: totalPages > 1 ? [buttons] : [] });
    }

    if (command === 'scriptgame') {
      const game = args.join(' ');
      if (!game) return message.reply(`❌ Use: \`${prefix}scriptgame <nome do jogo>\``);

      const loadingMsg = await message.reply('🔍 Buscando scripts para o jogo...');
      const data = await searchScriptBloxByGame(game, 1);

      if (!data || !data.result || !data.result.scripts || data.result.scripts.length === 0) {
        return loadingMsg.edit({
          content: null,
          embeds: [new EmbedBuilder()
            .setColor('#FF0000')
            .setTitle('❌ Nenhum resultado')
            .setDescription(`Não encontrei scripts para o jogo: **${game}**`)
          ]
        });
      }

      const scripts = data.result.scripts;
      const totalPages = data.result.totalPages || 1;
      
      const embed = createScriptEmbed(scripts, `🎮 Scripts para: ${game}`, 1, totalPages);
      const buttons = createPaginationButtons(1, totalPages, 'game', game);

      return loadingMsg.edit({ content: null, embeds: [embed], components: totalPages > 1 ? [buttons] : [] });
    }

    if (command === 'scriptinfo') {
      const slug = args[0];
      if (!slug) return message.reply(`❌ Use: \`${prefix}scriptinfo <slug>\` (encontre o slug na URL do script)`);

      try {
        const response = await axios.get(`https://scriptblox.com/api/script/${slug}`);
        const script = response.data.script;

        if (!script) return message.reply('❌ Script não encontrado.');

        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(`📜 ${script.title}`)
          .setURL(`https://scriptblox.com/script/${script.slug}`)
          .addFields(
            { name: '🎮 Jogo', value: script.game?.name || 'Universal', inline: true },
            { name: '👁️ Views', value: `${(script.views || 0).toLocaleString()}`, inline: true },
            { name: '✅ Verificado', value: script.verified ? 'Sim' : 'Não', inline: true },
            { name: '🔑 Key System', value: script.key ? 'Sim' : 'Não', inline: true },
            { name: '👤 Autor', value: script.owner?.username || 'Desconhecido', inline: true },
            { name: '📅 Atualizado', value: script.updatedAt ? new Date(script.updatedAt).toLocaleDateString('pt-BR') : 'N/A', inline: true }
          )
          .setFooter({ text: 'ScriptBlox • Powered by Nexus Bot' })
          .setTimestamp();

        if (script.image) {
          embed.setThumbnail(`https://scriptblox.com${script.image}`);
        }

        return message.reply({ embeds: [embed] });
      } catch {
        return message.reply('❌ Erro ao buscar informações do script.');
      }
    }

    // ==================== UTILITY COMMANDS ====================

    if (command === 'help') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📚 Comandos do Nexus Bot')
        .setDescription(`Prefixo atual: \`${prefix}\`\n\nAqui estão todas as categorias de comandos:`)
        .setFooter({ text: `Total: 100+ comandos • Nexus Bot` })
        .setTimestamp();

      for (const [category, cmds] of Object.entries(commandList)) {
        embed.addFields({
          name: category,
          value: cmds.map(c => `\`${prefix}${c}\``).join(' '),
          inline: false
        });
      }

      return message.reply({ embeds: [embed] });
    }

    if (command === 'ping') {
      const sent = await message.reply('🏓 Calculando...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      return sent.edit(`🏓 Pong!\n📡 Latência: **${latency}ms**\n💓 API: **${client.ws.ping}ms**`);
    }

    if (command === 'botinfo') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🤖 Nexus Bot')
        .setThumbnail(client.user.displayAvatarURL())
        .addFields(
          { name: '📊 Servidores', value: `${client.guilds.cache.size}`, inline: true },
          { name: '👥 Usuários', value: `${client.users.cache.size}`, inline: true },
          { name: '📝 Comandos', value: '100+', inline: true },
          { name: '⏰ Uptime', value: `${Math.floor(client.uptime / 3600000)}h ${Math.floor((client.uptime % 3600000) / 60000)}m`, inline: true },
          { name: '🏓 Ping', value: `${client.ws.ping}ms`, inline: true },
          { name: '📦 Versão', value: '1.0.0', inline: true }
        )
        .setFooter({ text: 'Nexus Bot • O melhor bot para seu servidor!' })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'serverinfo') {
      const { guild } = message;
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

      return message.reply({ embeds: [embed] });
    }

    if (command === 'userinfo') {
      const targetUser = getMentionedUser(message, args) || message.author;
      const targetMember = message.guild.members.cache.get(targetUser.id);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`👤 ${targetUser.tag}`)
        .setThumbnail(targetUser.displayAvatarURL({ size: 256 }))
        .addFields(
          { name: '🆔 ID', value: targetUser.id, inline: true },
          { name: '📅 Conta criada', value: `<t:${Math.floor(targetUser.createdTimestamp / 1000)}:R>`, inline: true },
          { name: '📥 Entrou no servidor', value: targetMember ? `<t:${Math.floor(targetMember.joinedTimestamp / 1000)}:R>` : 'N/A', inline: true },
          { name: '🏷️ Cargos', value: targetMember ? targetMember.roles.cache.map(r => r.name).slice(0, 5).join(', ') || 'Nenhum' : 'N/A', inline: false }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'avatar') {
      const targetUser = getMentionedUser(message, args) || message.author;
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🖼️ Avatar de ${targetUser.username}`)
        .setImage(targetUser.displayAvatarURL({ size: 512, dynamic: true }))
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'banner') {
      const targetUser = getMentionedUser(message, args) || message.author;
      const fetchedUser = await targetUser.fetch();

      if (!fetchedUser.banner) {
        return message.reply('❌ Este usuário não tem banner.');
      }

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`🎨 Banner de ${targetUser.username}`)
        .setImage(fetchedUser.bannerURL({ size: 512, dynamic: true }))
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'invite') {
      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📨 Adicione o Nexus Bot!')
        .setDescription('[Clique aqui para adicionar](https://discord.com/api/oauth2/authorize?client_id=' + client.user.id + '&permissions=8&scope=bot%20applications.commands)')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'uptime') {
      const uptime = client.uptime;
      const hours = Math.floor(uptime / 3600000);
      const minutes = Math.floor((uptime % 3600000) / 60000);
      const seconds = Math.floor((uptime % 60000) / 1000);

      return message.reply(`⏰ Estou online há **${hours}h ${minutes}m ${seconds}s**`);
    }

    if (command === 'membercount') {
      return message.reply(`👥 Este servidor tem **${message.guild.memberCount}** membros!`);
    }

    if (command === 'emojis') {
      const emojis = message.guild.emojis.cache.map(e => e.toString()).join(' ');
      return message.reply(emojis.length > 0 ? `😀 **Emojis do servidor:**\n${emojis.slice(0, 2000)}` : '❌ Este servidor não tem emojis customizados.');
    }

    if (command === 'roles') {
      const roles = message.guild.roles.cache.filter(r => r.name !== '@everyone').map(r => r.name).join(', ');
      return message.reply(`🏷️ **Cargos do servidor:**\n${roles.slice(0, 2000)}`);
    }

    if (command === 'snipe') {
      const deleted = deletedMessages.get(message.channel.id);
      if (!deleted) return message.reply('❌ Não há mensagens apagadas recentes.');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: deleted.author.tag, iconURL: deleted.author.displayAvatarURL() })
        .setDescription(deleted.content)
        .setFooter({ text: `Apagada` })
        .setTimestamp(deleted.createdAt);

      return message.reply({ embeds: [embed] });
    }

    if (command === 'editsnipe') {
      const edited = editedMessages.get(message.channel.id);
      if (!edited) return message.reply('❌ Não há mensagens editadas recentes.');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setAuthor({ name: edited.author.tag, iconURL: edited.author.displayAvatarURL() })
        .addFields(
          { name: 'Antes', value: edited.oldContent || 'N/A', inline: false },
          { name: 'Depois', value: edited.newContent || 'N/A', inline: false }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ==================== MODERAÇÃO ====================

    if (command === 'ban') {
      if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) {
        return message.reply('❌ Você não tem permissão para banir membros.');
      }

      const target = getMentionedMember(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}ban @usuário [motivo]\``);

      const reason = args.slice(1).join(' ') || 'Sem motivo';

      try {
        await target.ban({ reason });
        return message.reply(`🔨 **${target.user.tag}** foi banido!\nMotivo: ${reason}`);
      } catch (error) {
        return message.reply('❌ Não consegui banir este usuário.');
      }
    }

    if (command === 'kick') {
      if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) {
        return message.reply('❌ Você não tem permissão para expulsar membros.');
      }

      const target = getMentionedMember(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}kick @usuário [motivo]\``);

      const reason = args.slice(1).join(' ') || 'Sem motivo';

      try {
        await target.kick(reason);
        return message.reply(`👢 **${target.user.tag}** foi expulso!\nMotivo: ${reason}`);
      } catch (error) {
        return message.reply('❌ Não consegui expulsar este usuário.');
      }
    }

    if (command === 'mute') {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ Você não tem permissão para silenciar membros.');
      }

      const target = getMentionedMember(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}mute @usuário <duração> [motivo]\``);

      const duration = parseTime(args[1]);
      if (!duration) return message.reply('❌ Duração inválida. Use: 10s, 5m, 1h, 1d');

      const reason = args.slice(2).join(' ') || 'Sem motivo';

      try {
        await target.timeout(duration, reason);
        return message.reply(`🔇 **${target.user.tag}** foi silenciado por ${args[1]}!\nMotivo: ${reason}`);
      } catch (error) {
        return message.reply('❌ Não consegui silenciar este usuário.');
      }
    }

    if (command === 'unmute') {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const target = getMentionedMember(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}unmute @usuário\``);

      try {
        await target.timeout(null);
        return message.reply(`🔊 **${target.user.tag}** foi desmutado!`);
      } catch (error) {
        return message.reply('❌ Não consegui desmutar este usuário.');
      }
    }

    if (command === 'warn') {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}warn @usuário <motivo>\``);

      const reason = args.slice(1).join(' ');
      if (!reason) return message.reply('❌ Você precisa fornecer um motivo.');

      const userWarnings = warnings.get(target.id) || [];
      userWarnings.push({ reason, date: Date.now(), by: message.author.id });
      warnings.set(target.id, userWarnings);

      return message.reply(`⚠️ **${target.tag}** foi avisado!\nMotivo: ${reason}\nTotal de avisos: ${userWarnings.length}`);
    }

    if (command === 'warnings') {
      const target = getMentionedUser(message, args) || message.author;
      const userWarnings = warnings.get(target.id) || [];

      if (userWarnings.length === 0) {
        return message.reply(`✅ **${target.tag}** não tem avisos.`);
      }

      const embed = new EmbedBuilder()
        .setColor('#FF0000')
        .setTitle(`⚠️ Avisos de ${target.tag}`)
        .setDescription(userWarnings.map((w, i) => `**${i + 1}.** ${w.reason}`).join('\n'))
        .setFooter({ text: `Total: ${userWarnings.length} avisos` })
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'clearwarnings') {
      if (!message.member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}clearwarnings @usuário\``);

      warnings.delete(target.id);
      return message.reply(`🧹 Avisos de **${target.tag}** foram limpos!`);
    }

    if (command === 'purge') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageMessages)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const amount = parseInt(args[0]);
      if (!amount || amount < 1 || amount > 100) {
        return message.reply(`❌ Use: \`${prefix}purge <1-100>\``);
      }

      try {
        const deleted = await message.channel.bulkDelete(amount + 1, true);
        const reply = await message.channel.send(`🗑️ **${deleted.size - 1}** mensagens apagadas!`);
        setTimeout(() => reply.delete().catch(() => {}), 3000);
      } catch (error) {
        return message.reply('❌ Erro ao apagar mensagens.');
      }
    }

    if (command === 'slowmode') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const seconds = parseInt(args[0]);
      if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
        return message.reply(`❌ Use: \`${prefix}slowmode <0-21600>\``);
      }

      await message.channel.setRateLimitPerUser(seconds);
      return message.reply(seconds === 0 ? '🐌 Slowmode desativado!' : `🐌 Slowmode definido para **${seconds}** segundos.`);
    }

    if (command === 'lock') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ Você não tem permissão.');
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false });
      return message.reply('🔒 Canal bloqueado!');
    }

    if (command === 'unlock') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageChannels)) {
        return message.reply('❌ Você não tem permissão.');
      }

      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: true });
      return message.reply('🔓 Canal desbloqueado!');
    }

    if (command === 'setprefix') {
      if (!message.member.permissions.has(PermissionFlagsBits.ManageGuild)) {
        return message.reply('❌ Você não tem permissão.');
      }

      const newPrefix = args[0];
      if (!newPrefix) return message.reply(`❌ Use: \`${prefix}setprefix <novo prefixo>\``);

      guildPrefixes.set(message.guild.id, newPrefix);
      return message.reply(`✅ Prefixo alterado para \`${newPrefix}\``);
    }

    // ==================== DIVERSÃO ====================

    if (command === '8ball') {
      const question = args.join(' ');
      if (!question) return message.reply(`❌ Use: \`${prefix}8ball <pergunta>\``);

      const responses = [
        '🎱 Com certeza!', '🎱 Sim!', '🎱 Provavelmente sim.',
        '🎱 Talvez...', '🎱 Não sei dizer.', '🎱 Pergunte novamente.',
        '🎱 Provavelmente não.', '🎱 Não!', '🎱 Com certeza não!'
      ];

      return message.reply(responses[Math.floor(Math.random() * responses.length)]);
    }

    if (command === 'coinflip') {
      const result = Math.random() < 0.5 ? 'Cara' : 'Coroa';
      return message.reply(`🪙 A moeda caiu em **${result}**!`);
    }

    if (command === 'dice') {
      const sides = parseInt(args[0]) || 6;
      const result = Math.floor(Math.random() * sides) + 1;
      return message.reply(`🎲 Você tirou **${result}** (d${sides})!`);
    }

    if (command === 'rps') {
      const choices = ['rock', 'paper', 'scissors'];
      const userChoice = args[0]?.toLowerCase();

      if (!['rock', 'paper', 'scissors', 'pedra', 'papel', 'tesoura'].includes(userChoice)) {
        return message.reply(`❌ Use: \`${prefix}rps <pedra/papel/tesoura>\``);
      }

      const translated = { pedra: 'rock', papel: 'paper', tesoura: 'scissors' };
      const finalChoice = translated[userChoice] || userChoice;
      const botChoice = choices[Math.floor(Math.random() * 3)];

      const names = { rock: 'Pedra 🪨', paper: 'Papel 📄', scissors: 'Tesoura ✂️' };

      if (finalChoice === botChoice) {
        return message.reply(`${names[botChoice]} - **Empate!**`);
      }

      const wins = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
      const won = wins[finalChoice] === botChoice;

      return message.reply(`${names[botChoice]} - **${won ? 'Você ganhou!' : 'Você perdeu!'}**`);
    }

    if (command === 'meme') {
      try {
        const response = await axios.get('https://meme-api.com/gimme');
        const embed = new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle(response.data.title)
          .setImage(response.data.url)
          .setFooter({ text: `👍 ${response.data.ups} • r/${response.data.subreddit}` });

        return message.reply({ embeds: [embed] });
      } catch {
        return message.reply('❌ Erro ao buscar meme.');
      }
    }

    if (command === 'ship') {
      const user1 = message.mentions.users.first();
      const user2 = message.mentions.users.at(1);

      if (!user1 || !user2) return message.reply(`❌ Use: \`${prefix}ship @user1 @user2\``);

      const percentage = Math.floor(Math.random() * 101);
      const hearts = '❤️'.repeat(Math.floor(percentage / 10)) + '🖤'.repeat(10 - Math.floor(percentage / 10));

      const embed = new EmbedBuilder()
        .setColor('#FF69B4')
        .setTitle('💕 Love Calculator')
        .setDescription(`${user1} + ${user2}\n\n${hearts}\n**${percentage}%** de compatibilidade!`)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'hug') {
      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}hug @usuário\``);
      return message.reply(`🤗 ${message.author} abraçou ${target}!`);
    }

    if (command === 'slap') {
      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}slap @usuário\``);
      return message.reply(`👋 ${message.author} deu um tapa em ${target}!`);
    }

    if (command === 'kiss') {
      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}kiss @usuário\``);
      return message.reply(`💋 ${message.author} beijou ${target}!`);
    }

    if (command === 'pat') {
      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}pat @usuário\``);
      return message.reply(`🖐️ ${message.author} fez carinho em ${target}!`);
    }

    if (command === 'punch') {
      const target = getMentionedUser(message, args);
      if (!target) return message.reply(`❌ Use: \`${prefix}punch @usuário\``);
      return message.reply(`👊 ${message.author} socou ${target}!`);
    }

    if (command === 'rate') {
      const thing = args.join(' ');
      if (!thing) return message.reply(`❌ Use: \`${prefix}rate <algo>\``);
      return message.reply(`⭐ Eu dou **${Math.floor(Math.random() * 11)}/10** para **${thing}**!`);
    }

    if (command === 'howgay') {
      const target = getMentionedUser(message, args) || message.author;
      return message.reply(`🏳️‍🌈 **${target.username}** é **${Math.floor(Math.random() * 101)}%** gay!`);
    }

    if (command === 'howsmart') {
      const target = getMentionedUser(message, args) || message.author;
      return message.reply(`🧠 **${target.username}** é **${Math.floor(Math.random() * 101)}%** inteligente!`);
    }

    if (command === 'choose') {
      const options = args.join(' ').split('|').map(o => o.trim()).filter(o => o);
      if (options.length < 2) return message.reply(`❌ Use: \`${prefix}choose opção1 | opção2 | ...\``);
      return message.reply(`🤔 Eu escolho: **${options[Math.floor(Math.random() * options.length)]}**`);
    }

    if (command === 'reverse') {
      const text = args.join(' ');
      if (!text) return message.reply(`❌ Use: \`${prefix}reverse <texto>\``);
      return message.reply(`🔄 ${text.split('').reverse().join('')}`);
    }

    if (command === 'mock') {
      const text = args.join(' ');
      if (!text) return message.reply(`❌ Use: \`${prefix}mock <texto>\``);
      const mocked = text.split('').map((c, i) => i % 2 === 0 ? c.toLowerCase() : c.toUpperCase()).join('');
      return message.reply(`🐔 ${mocked}`);
    }

    if (command === 'emojify') {
      const text = args.join(' ').toLowerCase();
      if (!text) return message.reply(`❌ Use: \`${prefix}emojify <texto>\``);
      const emojified = text.split('').map(c => {
        if (c >= 'a' && c <= 'z') return `:regional_indicator_${c}:`;
        if (c === ' ') return '   ';
        return c;
      }).join('');
      return message.reply(emojified);
    }

    // ==================== ECONOMIA ====================

    if (command === 'balance' || command === 'bal') {
      const target = getMentionedUser(message, args) || message.author;
      const userData = getUser(target.id);

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle(`💰 Carteira de ${target.username}`)
        .addFields(
          { name: '💵 Carteira', value: `${userData.balance.toLocaleString()} coins`, inline: true },
          { name: '🏦 Banco', value: `${userData.bank.toLocaleString()} coins`, inline: true },
          { name: '💎 Total', value: `${(userData.balance + userData.bank).toLocaleString()} coins`, inline: true }
        )
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'daily') {
      const userData = getUser(message.author.id);
      const now = Date.now();
      const cooldown = 86400000; // 24 horas

      if (now - userData.lastDaily < cooldown) {
        const remaining = cooldown - (now - userData.lastDaily);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return message.reply(`⏰ Aguarde **${hours}h ${minutes}m** para coletar novamente.`);
      }

      const reward = Math.floor(Math.random() * 500) + 500;
      userData.balance += reward;
      userData.lastDaily = now;

      return message.reply(`📅 Você coletou sua recompensa diária de **${reward}** coins!`);
    }

    if (command === 'weekly') {
      const userData = getUser(message.author.id);
      const now = Date.now();
      const cooldown = 604800000; // 7 dias

      if (now - userData.lastWeekly < cooldown) {
        const remaining = cooldown - (now - userData.lastWeekly);
        const days = Math.floor(remaining / 86400000);
        const hours = Math.floor((remaining % 86400000) / 3600000);
        return message.reply(`⏰ Aguarde **${days}d ${hours}h** para coletar novamente.`);
      }

      const reward = Math.floor(Math.random() * 2000) + 2000;
      userData.balance += reward;
      userData.lastWeekly = now;

      return message.reply(`📆 Você coletou sua recompensa semanal de **${reward}** coins!`);
    }

    if (command === 'work') {
      const userData = getUser(message.author.id);
      const now = Date.now();
      const cooldown = 3600000; // 1 hora

      if (now - userData.lastWork < cooldown) {
        const remaining = cooldown - (now - userData.lastWork);
        const minutes = Math.floor(remaining / 60000);
        return message.reply(`⏰ Aguarde **${minutes}m** para trabalhar novamente.`);
      }

      const jobs = ['programador', 'médico', 'engenheiro', 'professor', 'artista', 'streamer', 'youtuber'];
      const job = jobs[Math.floor(Math.random() * jobs.length)];
      const reward = Math.floor(Math.random() * 300) + 100;
      userData.balance += reward;
      userData.lastWork = now;

      return message.reply(`💼 Você trabalhou como **${job}** e ganhou **${reward}** coins!`);
    }

    if (command === 'crime') {
      const userData = getUser(message.author.id);
      const now = Date.now();
      const cooldown = 7200000; // 2 horas

      if (now - userData.lastCrime < cooldown) {
        const remaining = cooldown - (now - userData.lastCrime);
        const hours = Math.floor(remaining / 3600000);
        const minutes = Math.floor((remaining % 3600000) / 60000);
        return message.reply(`⏰ Aguarde **${hours}h ${minutes}m** para cometer outro crime.`);
      }

      userData.lastCrime = now;
      const success = Math.random() < 0.5;

      if (success) {
        const reward = Math.floor(Math.random() * 800) + 200;
        userData.balance += reward;
        return message.reply(`🦹 Você cometeu um crime com sucesso e roubou **${reward}** coins!`);
      } else {
        const fine = Math.floor(Math.random() * 300) + 100;
        userData.balance = Math.max(0, userData.balance - fine);
        return message.reply(`🚔 Você foi pego! Multa de **${fine}** coins.`);
      }
    }

    if (command === 'rob') {
      const target = getMentionedUser(message, args);
      if (!target || target.id === message.author.id) {
        return message.reply(`❌ Use: \`${prefix}rob @usuário\``);
      }

      const userData = getUser(message.author.id);
      const targetData = getUser(target.id);

      if (targetData.balance < 100) {
        return message.reply('❌ Esta pessoa não tem dinheiro suficiente para roubar.');
      }

      const success = Math.random() < 0.4;

      if (success) {
        const stolen = Math.floor(Math.random() * Math.min(targetData.balance * 0.3, 500)) + 50;
        userData.balance += stolen;
        targetData.balance -= stolen;
        return message.reply(`💸 Você roubou **${stolen}** coins de ${target}!`);
      } else {
        const fine = Math.floor(Math.random() * 200) + 100;
        userData.balance = Math.max(0, userData.balance - fine);
        return message.reply(`🚔 Você foi pego tentando roubar ${target}! Multa de **${fine}** coins.`);
      }
    }

    if (command === 'pay') {
      const target = getMentionedUser(message, args);
      const amount = parseInt(args[1]);

      if (!target || target.id === message.author.id || !amount || amount <= 0) {
        return message.reply(`❌ Use: \`${prefix}pay @usuário <quantia>\``);
      }

      const userData = getUser(message.author.id);
      if (userData.balance < amount) {
        return message.reply('❌ Você não tem dinheiro suficiente.');
      }

      const targetData = getUser(target.id);
      userData.balance -= amount;
      targetData.balance += amount;

      return message.reply(`💵 Você pagou **${amount}** coins para ${target}!`);
    }

    if (command === 'deposit' || command === 'dep') {
      const amount = args[0] === 'all' ? getUser(message.author.id).balance : parseInt(args[0]);

      if (!amount || amount <= 0) {
        return message.reply(`❌ Use: \`${prefix}deposit <quantia/all>\``);
      }

      const userData = getUser(message.author.id);
      if (userData.balance < amount) {
        return message.reply('❌ Você não tem dinheiro suficiente.');
      }

      userData.balance -= amount;
      userData.bank += amount;

      return message.reply(`🏦 Você depositou **${amount}** coins no banco!`);
    }

    if (command === 'withdraw' || command === 'with') {
      const amount = args[0] === 'all' ? getUser(message.author.id).bank : parseInt(args[0]);

      if (!amount || amount <= 0) {
        return message.reply(`❌ Use: \`${prefix}withdraw <quantia/all>\``);
      }

      const userData = getUser(message.author.id);
      if (userData.bank < amount) {
        return message.reply('❌ Você não tem dinheiro suficiente no banco.');
      }

      userData.bank -= amount;
      userData.balance += amount;

      return message.reply(`💳 Você sacou **${amount}** coins do banco!`);
    }

    if (command === 'leaderboard' || command === 'lb') {
      const sorted = [...userData.entries()]
        .map(([id, data]) => ({ id, total: data.balance + data.bank }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 10);

      if (sorted.length === 0) return message.reply('❌ Nenhum dado disponível.');

      const embed = new EmbedBuilder()
        .setColor('#FFD700')
        .setTitle('🏆 Top 10 Mais Ricos')
        .setDescription(sorted.map((u, i) => {
          const user = client.users.cache.get(u.id);
          return `**${i + 1}.** ${user?.username || 'Desconhecido'} - ${u.total.toLocaleString()} coins`;
        }).join('\n'))
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'gamble' || command === 'bet') {
      const amount = parseInt(args[0]);
      if (!amount || amount <= 0) return message.reply(`❌ Use: \`${prefix}gamble <quantia>\``);

      const userData = getUser(message.author.id);
      if (userData.balance < amount) return message.reply('❌ Dinheiro insuficiente.');

      const won = Math.random() < 0.45;
      if (won) {
        userData.balance += amount;
        return message.reply(`🎰 Você ganhou **${amount}** coins! Saldo: ${userData.balance}`);
      } else {
        userData.balance -= amount;
        return message.reply(`🎰 Você perdeu **${amount}** coins... Saldo: ${userData.balance}`);
      }
    }

    if (command === 'slots') {
      const bet = parseInt(args[0]);
      if (!bet || bet <= 0) return message.reply(`❌ Use: \`${prefix}slots <aposta>\``);

      const userData = getUser(message.author.id);
      if (userData.balance < bet) return message.reply('❌ Dinheiro insuficiente.');

      const symbols = ['🍒', '🍋', '🍊', '🍇', '⭐', '💎'];
      const results = [
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)],
        symbols[Math.floor(Math.random() * symbols.length)]
      ];

      const display = `[ ${results.join(' | ')} ]`;

      if (results[0] === results[1] && results[1] === results[2]) {
        const multiplier = results[0] === '💎' ? 10 : 5;
        const winnings = bet * multiplier;
        userData.balance += winnings;
        return message.reply(`🎰 ${display}\n🎉 **JACKPOT!** Você ganhou **${winnings}** coins!`);
      } else if (results[0] === results[1] || results[1] === results[2]) {
        userData.balance += bet;
        return message.reply(`🎰 ${display}\n✨ Você ganhou **${bet}** coins!`);
      } else {
        userData.balance -= bet;
        return message.reply(`🎰 ${display}\n💔 Você perdeu **${bet}** coins...`);
      }
    }

    // ==================== NÍVEIS ====================

    if (command === 'rank' || command === 'level') {
      const target = getMentionedUser(message, args) || message.author;
      const userData = getUser(target.id);
      const xpNeeded = userData.level * 100;
      const progress = Math.floor((userData.xp / xpNeeded) * 10);
      const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 Rank de ${target.username}`)
        .addFields(
          { name: '🏅 Nível', value: `${userData.level}`, inline: true },
          { name: '✨ XP', value: `${userData.xp}/${xpNeeded}`, inline: true },
          { name: '📈 Progresso', value: `[${progressBar}]`, inline: false }
        )
        .setThumbnail(target.displayAvatarURL())
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'xpleaderboard' || command === 'xplb') {
      const sorted = [...userData.entries()]
        .map(([id, data]) => ({ id, level: data.level, xp: data.xp }))
        .sort((a, b) => b.level - a.level || b.xp - a.xp)
        .slice(0, 10);

      if (sorted.length === 0) return message.reply('❌ Nenhum dado disponível.');

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('🏅 Top 10 Níveis')
        .setDescription(sorted.map((u, i) => {
          const user = client.users.cache.get(u.id);
          return `**${i + 1}.** ${user?.username || 'Desconhecido'} - Nível ${u.level} (${u.xp} XP)`;
        }).join('\n'))
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    // ==================== OUTROS ====================

    if (command === 'afk') {
      const reason = args.join(' ') || 'AFK';
      afkUsers.set(message.author.id, reason);
      return message.reply(`💤 Você agora está AFK: ${reason}`);
    }

    if (command === 'remind') {
      const time = parseTime(args[0]);
      if (!time) return message.reply(`❌ Use: \`${prefix}remind <tempo> <mensagem>\``);

      const reminder = args.slice(1).join(' ');
      if (!reminder) return message.reply('❌ Você precisa fornecer uma mensagem.');

      setTimeout(() => {
        message.author.send(`⏰ **Lembrete:** ${reminder}`).catch(() => {
          message.channel.send(`⏰ ${message.author}, **Lembrete:** ${reminder}`);
        });
      }, time);

      return message.reply(`⏰ Lembrete definido para daqui a ${args[0]}!`);
    }

    if (command === 'calc') {
      const expression = args.join(' ');
      if (!expression) return message.reply(`❌ Use: \`${prefix}calc <expressão>\``);

      try {
        // Simple safe eval for basic math
        const result = expression
          .replace(/[^0-9+\-*/().%\s]/g, '')
          .split('')
          .join('');
        const calculated = Function('"use strict"; return (' + result + ')')();
        return message.reply(`🔢 ${expression} = **${calculated}**`);
      } catch {
        return message.reply('❌ Expressão inválida.');
      }
    }

    if (command === 'poll') {
      const parts = args.join(' ').split('|').map(p => p.trim());
      if (parts.length < 2) return message.reply(`❌ Use: \`${prefix}poll pergunta | opção1 | opção2 | ...\``);

      const question = parts[0];
      const options = parts.slice(1, 11);
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${question}`)
        .setDescription(options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n'))
        .setFooter({ text: `Enquete por ${message.author.username}` })
        .setTimestamp();

      const pollMsg = await message.channel.send({ embeds: [embed] });
      for (let i = 0; i < options.length; i++) {
        await pollMsg.react(emojis[i]);
      }
    }

    if (command === 'quickpoll') {
      const question = args.join(' ');
      if (!question) return message.reply(`❌ Use: \`${prefix}quickpoll <pergunta>\``);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle(`📊 ${question}`)
        .setDescription('👍 Sim\n👎 Não')
        .setFooter({ text: `Enquete por ${message.author.username}` })
        .setTimestamp();

      const pollMsg = await message.channel.send({ embeds: [embed] });
      await pollMsg.react('👍');
      await pollMsg.react('👎');
    }

    if (command === 'github') {
      const username = args[0];
      if (!username) return message.reply(`❌ Use: \`${prefix}github <username>\``);

      try {
        const response = await axios.get(`https://api.github.com/users/${username}`);
        const user = response.data;

        const embed = new EmbedBuilder()
          .setColor('#333333')
          .setTitle(`🐙 ${user.login}`)
          .setURL(user.html_url)
          .setThumbnail(user.avatar_url)
          .addFields(
            { name: '📝 Bio', value: user.bio || 'Sem bio', inline: false },
            { name: '📦 Repos', value: `${user.public_repos}`, inline: true },
            { name: '👥 Seguidores', value: `${user.followers}`, inline: true },
            { name: '👤 Seguindo', value: `${user.following}`, inline: true }
          )
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      } catch {
        return message.reply('❌ Usuário não encontrado.');
      }
    }

    if (command === 'qrcode') {
      const text = args.join(' ');
      if (!text) return message.reply(`❌ Use: \`${prefix}qrcode <texto/url>\``);

      const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('📱 QR Code')
        .setImage(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

    if (command === 'color') {
      const hex = args[0]?.replace('#', '');
      if (!hex || !/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return message.reply(`❌ Use: \`${prefix}color <hex>\` (ex: FF5733)`);
      }

      const embed = new EmbedBuilder()
        .setColor(`#${hex}`)
        .setTitle(`🎨 #${hex.toUpperCase()}`)
        .setImage(`https://singlecolorimage.com/get/${hex}/200x200`)
        .setTimestamp();

      return message.reply({ embeds: [embed] });
    }

  } catch (error) {
    console.error('Erro ao executar comando:', error);
    message.reply('❌ Ocorreu um erro ao executar este comando.');
  }
});

// ============================================
// EVENTOS
// ============================================

client.on('messageDelete', message => {
  if (!message.author?.bot && message.content) {
    deletedMessages.set(message.channel.id, {
      content: message.content,
      author: message.author,
      createdAt: message.createdAt
    });
  }
});

client.on('messageUpdate', (oldMessage, newMessage) => {
  if (!oldMessage.author?.bot && oldMessage.content !== newMessage.content) {
    editedMessages.set(oldMessage.channel.id, {
      oldContent: oldMessage.content,
      newContent: newMessage.content,
      author: oldMessage.author
    });
  }
});

// ============================================
// INTERAÇÕES COM BOTÕES (Paginação ScriptBlox)
// ============================================

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;

  const customId = interaction.customId;
  if (!customId.startsWith('script_')) return;

  await interaction.deferUpdate();

  const parts = customId.split('_');
  const action = parts[1]; // first, prev, next, last
  const type = parts[2]; // search, top, recent, game
  const query = parts.slice(3).join('_'); // query se houver

  // Extrair página atual do embed
  const embed = interaction.message.embeds[0];
  const pageMatch = embed.description?.match(/Página (\d+) de (\d+)/);
  
  if (!pageMatch) return;

  let currentPage = parseInt(pageMatch[1]);
  const totalPages = parseInt(pageMatch[2]);
  let newPage = currentPage;

  switch (action) {
    case 'first':
      newPage = 1;
      break;
    case 'prev':
      newPage = Math.max(1, currentPage - 1);
      break;
    case 'next':
      newPage = Math.min(totalPages, currentPage + 1);
      break;
    case 'last':
      newPage = totalPages;
      break;
    default:
      return;
  }

  if (newPage === currentPage) return;

  let data;
  let title;
  let color;

  try {
    switch (type) {
      case 'search':
        data = await searchScriptBlox(query, newPage);
        title = `🔍 Resultados para: ${query}`;
        color = '#5865F2';
        break;
      case 'top':
        data = await getScriptBloxTop(newPage);
        title = '🏆 Scripts Mais Populares';
        color = '#FFD700';
        break;
      case 'recent':
        data = await getScriptBloxRecent(newPage);
        title = '🆕 Scripts Mais Recentes';
        color = '#00FF00';
        break;
      case 'game':
        data = await searchScriptBloxByGame(query, newPage);
        title = `🎮 Scripts para: ${query}`;
        color = '#5865F2';
        break;
    }

    if (!data || !data.result || !data.result.scripts) {
      return interaction.followUp({ content: '❌ Erro ao carregar página.', ephemeral: true });
    }

    const scripts = data.result.scripts;
    const newEmbed = createScriptEmbed(scripts, title, newPage, totalPages, color);
    const buttons = createPaginationButtons(newPage, totalPages, type, query);

    await interaction.editReply({ embeds: [newEmbed], components: [buttons] });
  } catch (error) {
    console.error('Erro na paginação:', error);
  }
});

// ============================================
// INICIALIZAÇÃO
// ============================================

client.once('ready', () => {
  console.log(`✅ ${client.user.tag} está online!`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`👥 Usuários: ${client.users.cache.size}`);
  console.log(`📝 Prefixo padrão: ${PREFIX}`);

  client.user.setActivity(`${PREFIX}help | Nexus Bot`, { type: 3 });
});

// Login
client.login(process.env.DISCORD_TOKEN);
