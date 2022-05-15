const Lobby = require("../models/lobby")

/**
 * Gets existing lobby for a Telegram group
 * @param {Number} chatId Telegram group id
 * @returns {Promise<Object>} Existing lobby in the group or null
 */
const getGroupLobby = async chatId => {
  return await Lobby.findOne({ chatId })
}

/**
 * Create a new lobby in a group
 * @param {Number} chatId Telegram group id
 * @param {String} [title] Lobby title
 * @returns {Promise<Object>} Created lobby
 */
const createGroupLobby = async (chatId, title) => {
  return await Lobby.create({ chatId, title })
}

/**
 * Delete the current grup lobby
 * @param {Numer} chatId Telegram group id
 * @returns {Promise<Object>} Deleted lobby
 */
const deleteGroupLobby = async chatId => {
  return await Lobby.deleteOne({ chatId })
}

/**
 * Adds the user to the "in" list of the current group lobby
 * @param {Numer} chatId Telegram group id
 * @param {(in|maybe|out)} listType List that the user is joining 
 * @param {Number} telegramId Telegram user id joining the lobby
 * @param {String} username Telegram username joining the lobby
 * @param {String} description Description about participation
 * @returns {Promise<Object>} Updated lobby
 */
const joinGroupLobby = async (chatId, listType, telegramId, username, description) => {
  const removeUserFromLobby = (lobby, username) => {
    lobby.in = lobby.in.filter(user => user.username !== username)
    lobby.maybe = lobby.maybe.filter(user => user.username !== username)
    lobby.out = lobby.out.filter(user => user.username !== username)
  }

  const lobby = await Lobby.findOne({ chatId })
  if (!lobby) {
    throw {
      notify: true,
      message: "There's no lobby created",
    }
  }

  removeUserFromLobby(lobby, username)

  lobby[listType].push({ telegramId, username, description })

  return await lobby.save()
}

/**
 * Set a new title for the current group lobby
 * @param {Numer} chatId Telegram group id
 * @param {Object} data New data for the group 
 * @returns {Promise<Object>} Updated lobby
 */
const setGroupLobbyTitle = async (chatId, title) => {
  const lobby = await Lobby.findOne({ chatId })
  if (!lobby) {
    throw {
      notify: true,
      message: "There's no lobby created",
    }
  }

  lobby.title = title
  return await lobby.save()
}

module.exports = {
  getGroupLobby,
  createGroupLobby,
  deleteGroupLobby,
  joinGroupLobby,
  setGroupLobbyTitle
}
