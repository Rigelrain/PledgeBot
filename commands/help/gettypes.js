const reply = require('../../js/reply')

/**
 * Get request types    
 */

const options = {
    type: 'donations',

    name: 'gettypes',
    aliases: ['getypes', 'getype', 'gettype', 'showtypes', 'checktype', 'checktypes', 'check'],

    description: 'Show available request types for this server.',
    minArgs: 0,

    roleRestrict: 'requester',

    cooldown: 2,
}

async function execute(message) { 
    console.log('[ INFO ] Fetching server request types...')
    if(message.requestTypes.length == 0) {
        return reply.success(message, 'All types approved!', 'You can request anything you wish, but keep it cool ;) Good luck!', true)
    }

    return reply.success(message, 'You can request these:', message.requestTypes.join(', '), true)
}

module.exports = options
module.exports.execute = execute