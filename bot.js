const dotenv = require("dotenv")
const TeleBot = require("telebot")
const lobbyServices = require("./services/lobby")

dotenv.config()

const createUserDataList = users => {
  const list = []
  users.forEach((user, index) => {
    const description = user.description ? ` (${user.description})` : ""
    const text = `${index + 1}. ${user.username}${description}`
    list.push(text)
  })
  return list
}

const getCommandParameter = (commandText) => {
  return commandText.split(" ").slice(1).join(" ")
}

const formatLobbyMessage = lobby => {
  const lines = []
  if (lobby.title) lines.push(lobby.title)
  lines.push(...createUserDataList(lobby.in))

  if (lobby.maybe.length) {
    lines.push("")
    lines.push("Maybe:")
    lines.push(...createUserDataList(lobby.maybe))
  }

  if (lobby.out.length) {
    lines.push("")
    lines.push("Out:")
    lines.push(...createUserDataList(lobby.out))
  }

  return lines.join("\n")
}

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN)

bot.on("/create", async (msg) => {
  const title = getCommandParameter(msg.text)
  const chatId = msg.chat.id
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (groupLobby) {
      throw {
        notify: true,
        message: "A lobby is already created. Finish it before creating a new one",
      }
    }
    groupLobby = await lobbyServices.createGroupLobby(chatId, title)
    return bot.sendMessage(chatId, "Lobby created")
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to create a new lobby")
    }
  }
})

bot.on("/end", async (msg) => {
  const chatId = msg.chat.id
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    groupLobby = await lobbyServices.deleteGroupLobby(chatId)
    return bot.sendMessage(chatId, "Lobby finished")
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to create a new lobby")
    }
  }
})

bot.on("/current", async (msg) => {
  const chatId = msg.chat.id
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    return bot.sendMessage(chatId, formatLobbyMessage(groupLobby))
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to create a new lobby")
    }
  }
})

bot.on("/set_title", async (msg) => {
  const title = getCommandParameter(msg.text)
  const chatId = msg.chat.id
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    groupLobby = await lobbyServices.setGroupLobbyTitle(chatId, title)
    return bot.sendMessage(chatId, `New title set: ${groupLobby.title}`)
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to join a lobby")
    }
  }
})

bot.on("/in", async (msg) => {
  const description = getCommandParameter(msg.text)
  const chatId = msg.chat.id
  const { id: telegramId, username } = msg.from
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    groupLobby = await lobbyServices.joinGroupLobby(chatId, "in", telegramId, username ?? first_name, description)
    return bot.sendMessage(chatId, formatLobbyMessage(groupLobby))
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to join a lobby")
    }
  }
})

bot.on("/maybe", async (msg) => {
  const description = getCommandParameter(msg.text)
  const chatId = msg.chat.id
  const { id: telegramId, username, first_name } = msg.from
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    groupLobby = await lobbyServices.joinGroupLobby(chatId, "maybe", telegramId, username ?? first_name, description)
    return bot.sendMessage(chatId, formatLobbyMessage(groupLobby))
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to join a lobby")
    }
  }
})

bot.on("/out", async (msg) => {
  const description = getCommandParameter(msg.text)
  const chatId = msg.chat.id
  const { id: telegramId, username, first_name } = msg.from
  try {
    let groupLobby = await lobbyServices.getGroupLobby(chatId)
    if (!groupLobby) {
      throw {
        notify: true,
        message: "There's no lobby created",
      }
    }
    groupLobby = await lobbyServices.joinGroupLobby(chatId, "out", telegramId, username ?? first_name, description)
    return bot.sendMessage(chatId, formatLobbyMessage(groupLobby))
  } catch (err) {
    if (err.notify) {
      return bot.sendMessage(chatId, err.message)
    } else {
      console.error(err)
      return bot.sendMessage(chatId, "Unexpected error when trying to join a lobby")
    }
  }
})

module.exports = bot
