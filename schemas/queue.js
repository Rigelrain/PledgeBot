const mongoose = require('mongoose')
const Schema = mongoose.Schema

const schema = new Schema({
    serverID: String,
    channelID: String,
    name: String,
    host: String,
    capacity: Number, // total amount of people that the host allows in the queue
    taken: Number, // the amount of slots in queue that have been claimed
    done: Number, // amount of people who are done, and are not waiting anymore
    users: [String],
})

module.exports = mongoose.model('Queue', schema)