# 🤖 Nexus Bot - Discord Bot

Bot Discord multifuncional com **100+ comandos**, incluindo integração com ScriptBlox!

## 📝 Prefixo

O prefixo padrão é `.` (ponto). Exemplo:
- `.help` - Ver todos os comandos
- `.scriptsearch blox fruits` - Buscar scripts
- `.balance` - Ver seu saldo

Você pode alterar o prefixo por servidor usando `.setprefix <novo prefixo>`

## ✨ Funcionalidades

### 🔍 ScriptBlox Integration
- `.scriptsearch [query]` - Busca scripts no ScriptBlox
- `.scripttop` - Scripts mais populares
- `.scriptrecent` - Scripts mais recentes
- `.scriptgame [game]` - Scripts por jogo

### 🔨 Moderação
- Ban, Kick, Mute, Warn
- Purge, Lock, Unlock, Nuke
- AutoMod, AntiSpam
- Sistema de avisos

### 🎮 Diversão
- 8ball, Coinflip, Dice, RPS
- Ship, Hug, Kiss, Slap
- Rate, Mock, Choose
- Memes e piadas

### 💰 Economia
- Balance, Daily, Weekly
- Work, Crime, Rob
- Shop, Inventory, Gambling
- Slots, Blackjack

### 📊 Níveis
- Sistema de XP automático
- Rank e Leaderboards
- Recompensas por nível

### 🎵 Música
- Play, Pause, Skip, Stop
- Queue, Loop, Shuffle
- Volume control

### 🎉 Giveaways
- Criar sorteios
- Reroll, End

### 🎫 Tickets
- Sistema de suporte
- Add/Remove users

### ⚙️ Configuração
- Welcome/Leave messages
- Logs, AutoRole
- Sugestões

## 🚀 Instalação

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- Conta no [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Criar Bot no Discord

1. Acesse [Discord Developer Portal](https://discord.com/developers/applications)
2. Clique em "New Application"
3. Dê um nome ao seu bot
4. Vá em "Bot" no menu lateral
5. Clique em "Add Bot"
6. Copie o **Token** (guarde em segredo!)
7. Ative as intents:
   - `PRESENCE INTENT`
   - `SERVER MEMBERS INTENT`
   - `MESSAGE CONTENT INTENT`

### 3. Convidar o Bot

1. Vá em "OAuth2" > "URL Generator"
2. Selecione:
   - Scopes: `bot`
   - Permissions: `Administrator` (ou permissões específicas)
3. Copie a URL e abra no navegador
4. Selecione seu servidor

### 4. Configurar e Rodar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nexus-bot.git
cd nexus-bot/discord-bot

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com seu token

# Inicie o bot
npm start
```

### 5. Variáveis de Ambiente

Crie um arquivo `.env` com:

```env
DISCORD_TOKEN=seu_token_aqui
```

## 📝 Comandos Disponíveis (100+)

Todos os comandos usam o prefixo `.` (ou o prefixo customizado do servidor)

| Categoria | Comandos |
|-----------|----------|
| ScriptBlox | `.scriptsearch`, `.scripttop`, `.scriptrecent`, `.scriptgame` |
| Moderação | `.ban`, `.kick`, `.mute`, `.unmute`, `.warn`, `.warnings`, `.clearwarnings`, `.purge`, `.slowmode`, `.lock`, `.unlock`, `.setprefix` |
| Utilidades | `.help`, `.ping`, `.botinfo`, `.serverinfo`, `.userinfo`, `.avatar`, `.banner`, `.invite`, `.uptime`, `.membercount`, `.emojis`, `.roles`, `.snipe`, `.editsnipe` |
| Diversão | `.8ball`, `.coinflip`, `.dice`, `.rps`, `.meme`, `.ship`, `.hug`, `.slap`, `.kiss`, `.pat`, `.punch`, `.rate`, `.howgay`, `.howsmart`, `.choose`, `.reverse`, `.mock`, `.emojify` |
| Economia | `.balance`, `.daily`, `.weekly`, `.work`, `.crime`, `.rob`, `.pay`, `.deposit`, `.withdraw`, `.leaderboard`, `.gamble`, `.slots` |
| Níveis | `.rank`, `.xpleaderboard` |
| Outros | `.poll`, `.quickpoll`, `.afk`, `.remind`, `.calc`, `.github`, `.qrcode`, `.color` |

## 🌐 Hospedagem Gratuita

### Railway (Recomendado)
1. Acesse [railway.app](https://railway.app)
2. Conecte seu GitHub
3. Importe o repositório
4. Adicione a variável `DISCORD_TOKEN`
5. Deploy automático!

### Heroku
1. Crie uma conta em [heroku.com](https://heroku.com)
2. Crie um novo app
3. Conecte ao GitHub
4. Adicione as Config Vars
5. Deploy!

### Replit
1. Importe de GitHub em [replit.com](https://replit.com)
2. Adicione Secrets com o token
3. Configure o run command: `node index.js`
4. Use UptimeRobot para manter online

## 🛠️ Desenvolvimento

```bash
# Modo desenvolvimento (com hot reload)
npm run dev
```

## 📄 Licença

MIT License - use como quiser!

## 🤝 Suporte

- Discord: [Servidor de Suporte](https://discord.gg/seu-servidor)
- Issues: Use a aba Issues do GitHub

---

Feito com ❤️ para a comunidade Discord
