const mongoose = require('mongoose')
const Schema = mongoose.Schema

const serverSchema = new Schema({
    serverID: String, // ID of the server, cannot be set by commands
    prefix: String,
    roles: {
        moderator: [String], // IDs of roles that can edit bot settings
        requester: [String], // IDs of roles that can initiate requests
        pledger: [String], // IDs of roles that can respond to requests
    },
    requestTypes: [String], // an array of allowed requests
})

serverSchema.index({serverID: 1})

module.exports = mongoose.model('Server', serverSchema)