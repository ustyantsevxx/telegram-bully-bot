const { Telegraf } = require('telegraf')
const dotenv = require('dotenv')

dotenv.config()

const fs = require('fs')
const path = require('path')

const NAME_PLACEHOLDER = '$'

const DEFAULT_LINES_FILE = 'assets/default.txt'

const getRandomItem = arr => {
  return arr[Math.floor(Math.random() * arr.length)]
}

const getLinesFromTxtFile = filePath => {
  try {
    const defaultLines = fs.readFileSync(path.join(__dirname, filePath), 'utf8')
    return defaultLines.split('\n').filter(Boolean)
  } catch {
    console.log(`Error reading file "${filePath}"`)
    process.exit(1)
  }
}

const DB = []

const COMMANDS = {
  ADD_TARGET: 'add_target'
}

const WRONG_FORMAT_MESSAGE = [
  'Неверный формат',
  'Формат: /add_user @username погоняло',
  'Пример: /add_user @KingsBounty рус'
].join('\n')

const __main = () => {
  const defaultLines = getLinesFromTxtFile(DEFAULT_LINES_FILE)

  const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)

  bot.command(COMMANDS.ADD_TARGET, async context => {
    const ADMINS = ['ustyantsevxx']
    // if (!ADMINS.includes(context.from.username)) {
    //   return context.reply('ОТСТАВИТЬ!')
    // }

    const parts = context.message.text.split(' ')

    if (parts.length !== 3) {
      return context.reply(WRONG_FORMAT_MESSAGE)
    }

    const [rawUsername, name] = parts.slice(1)

    if (!/@.+/.test(rawUsername) || !name) {
      return context.reply(WRONG_FORMAT_MESSAGE)
    }

    const username = rawUsername.replace('@', '')
    console.log(username, name)

    const target = DB.find(x => x.username === username)
    if (target) {
      context.reply(`Ок. Теперь @${username} не "${target.name}", а "${name}"`)
      target.name = name
    } else {
      DB.push({ username, name })
      context.reply(`Ок. Сохранил @${username} как "${name}"`)
    }

    console.log(DB)
  })

  bot.on('message', context => {
    const username = context.from.username

    const target = DB.find(x => x.username === username)
    if (target) {
      let result = getRandomItem(defaultLines)
      if (result.includes(NAME_PLACEHOLDER)) {
        result = result.replace(NAME_PLACEHOLDER, target.name)
      }

      context.reply(result, { reply_to_message_id: context.message.message_id })
    }
  })

  bot.launch()
}

__main()
