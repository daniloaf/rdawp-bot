const mongoose = require("mongoose")
const uuid = require("uuid")

const Lobby = mongoose.Schema({
  _id: {
    type: String,
    default: () => uuid.v4(),
  },
  chatId: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
  },
  in: [
    {
      telegramId: Number,
      username: String,
      name: String,
      description: String,
    },
  ],
  maybe: [
    {
      telegramId: Number,
      username: String,
      name: String,
      description: String,
    },
  ],
  out: [
    {
      telegramId: Number,
      username: String,
      name: String,
      description: String,
    },
  ],
})

Lobby.index({ chatId: 1 }, { unique: 1 })

module.exports = mongoose.model("Lobby", Lobby)
