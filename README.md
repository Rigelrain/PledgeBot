# Manna
Discord.js bot for asking for donations/crowdfunding and pledging for them.   
Join the official [Discord server](https://discord.gg/vH3DJwP) for Rigelrain bots to get updates on what new features Manna gets, test the bot or report issues.   
[Invite Manna to your server](https://discord.com/api/oauth2/authorize?client_id=726711574030581840&permissions=268462160&scope=bot) for the fun!

***[For Developers](#Manna)***

***[For Users](#Manna-in-your-server)***

## Setup
After cloning the repository, use `npm install` to get all the needed 3rd party modules.

Main file is `bot.js`.  `npm start` will start the bot.

Configuration files are under `/config`. Note that local bot token and Mongo config should only be used in local development phase and are not suitable to be used if your bot is hosted in the cloud! You should never save this kind of sensitive data as a file in the cloud, only as process variables.

### Discord Access configuration (for local development)

Bot token goes in `token.js`. Create if not present:
```
module.exports = {
  token: 'TOKEN HERE'
}
```

### MongoDB configuration (for local development)
MongoDB details go into `mongodb_config.js`. Create if not present:
```
module.exports = {
    path: 'FULL MONGODB URL HERE',
    dbname: 'NAME OF THE DATABASE HERE',
}
```

### Server-specific configurations
Information about the server's configuration (prefix, role IDs etc.) are given to the bot when it is invited to a server. User must have `manage server` permissions to use this command.

It is recommended that you limit the bot's access to specific channel(s) on your server. Make a specific role for this bot, give it permissions to send and manage messages but *not read* on the server level. Then only allow this role to read the channels you want the bot to operate on.

## Deployment
This bot is configured to be deployed to Heroku.

Sensitive tokens should be saved into Heroku Dashboard in Config Vars. In code these are read as `process.env.<key>`. Add the following 'keys' to the Config Vars:
- TOKEN - Discord bot token
- DBPATH - Path to Mongo database in full
- DBNAME - Name of the database with these collections

## Database
Bot uses MongoDB through Mongoose to save data about the server's configuration, user info and active requests and queues. A member can remove their data with a `clear` command.

### Server schema
Server data can be removed with the command `reset`. This can only be done by server administrator(s).
```
{
    serverID: String, // ID of the server, cannot be set by commands
    prefix: String,
    disabled: [String], // disabled features, corresponds to command's type
    roles: {
        moderator: String, // ID of role that can edit bot settings
        requester: String, // ID of role that can initiate requests
        pledger: String, // ID of role that can respond to requests
        queue: [String], // IDs of roles that use queues
        queuemod: [String], // IDs of roles that create queues
        giveaway: [String], // IDs of roles that can start giveaways
    },
    requestTypes: [String], // an array of allowed requests
    queueCategory: String, // category to use for queues
    queueChannel: String, // channel where queue messages should go
    queueMsg: String, // message that is added in every queue channel
}
```

A moderator can check current server settings by using command `getserver`.

### Request schema
```
{
    serverID: String, // ID of the server the request was made
    userID: String, // ID of the user who made the request
    messageID: String, // ID of the message of the request (bot-made)
    request: {
        type: String, // request type (allowed types can be set by server)
        amount: Number, // how much needed total
        remaining: Number, // how much is left unpledged
    },
}
```

### User schema
A user is shared across all servers. Setting this info will make it available on all servers where the bot is, although only the member themselves can use it. No one else can see this data unless the member joins a queue. If a member removes this data with the `clear` command, it will be deleted from all servers at once.
```
{ 
    userID: String, // ID of the Discord user
    ign: String, // in-game-name
    island: String, // name of their ACNH island
}
```

### Queue schema
```
{
    serverID: String, // ID of the server where the queue was created
    channelID: String, // ID of the created queue channel
    name: String,
    host: String, // user id of the host
    capacity: Number, // total amount of people that the host allows in the queue
    taken: {type: Number, default: 0}, // the amount of slots in queue that have been claimed
    done: {type: Number, default: 0}, // amount of people who are done, and are not waiting anymore
    users: {type: [String], default: []},
}
```

## Queue system
Queues need a bit of setup: the server needs to have a category under which the bot will create the queue channels, and the server needs a channel where the queues infos will be posted. Use command `setqueueinfo` to setup.

For clarity, the bot will only accept queue creation commands in the 'queue list channel'. This is because queues can be closed from the queue channels and the bot will only try to find the queue info message from the list channel. Once a queue is successfully created, the bot will create a new channel which only the bot, bot moderators and the host can see at first. Bot will create an info message about the queue in the list channel with a reaction counter.

Members can join the queue by either using `join` command or by reacting to the queue info message. If the user has set their info, the bot will add the member to the queue's channel.

Members can leave a queue, and if they do so before their turn, it will not be counted against the queue's capacity.

The host is supposed to call `next` in the queue channel when they are ready for the next person. This will show the info of the next member in line. After a while the member will be kicked from the channel.

The host can also `close` the queue whenever.

# Manna in your server

## Features 

Manna currently has the following features, which can be turned off by using `disable <feature>`:

* *donations* - use for requests for donations and donating, include commands like `request`, `donate`
* *queues* - use to make special channels to wait in line for something, include commands like `create`, `join`, `set` (giving information to be used in queues)
* *giveaways* - use to make giveaways, include commands like \`give\`, \`reroll\`

### Donations
Requests have a type and amount/description.

Type is loosely the unit of the request. If you request 3 hugs, the type is 'hugs'. If you request passionate kiss, the type is 'kiss'. By default you can use any type, but the server might choose to limit these to specific types of donations allowed on the server. The type has to be the last word in your command.

The amount is simple, it's simply the quantity of the requested item/service. If left blank, by default you are requesting one (1) item/service.

You can also give a description (quality). This is a free form text describing any details of your request.

Example1: `3 hugs` --> will create a request: `@Manna requests 3 hugs!`

Example2: `passionate kiss` --> will create a request: `@Manna requests 1 kiss! Needs: passionate`

Example3: `5 blue in a flower pot roses` --> will create a request: `@Manna requests 5 roses! Needs: blue in a flower pot`

![Example request with description](https://github.com/Rigelrain/manna-bot/blob/master/images/donation01.jpg?raw=true)

**Donating to a request**
Donations are done with command `donate (amount/all) @user`. With every donation the request is edited and progress is shown. When the request is fulfilled, the requester is notified by a DM containing info on all users who made a donation.

![Fulfilled request](https://github.com/Rigelrain/manna-bot/blob/master/images/donation01-fulfilled.jpg?raw=true)

**Request types**
By default members can request all kinds of items/services. This can be configured by adding specific types as allowed in the server.

Use `settype add/remove <type(s)>` to make these changes. Note that all types must be one (1) word. Use for example dashes for multipart-types (ex. bottles-of-janx).

### Queues
A moderator needs to setup queue settings before the queues can be used in the server. This bot needs info about:
* *queue category* - This is where all the new queue channels will appear. You can get the value of the category ID by right-clicking on the category title and selecting Copy ID.
* *queue list channel* - This is the only channel where queues can be created. The bot will keep track of queues in info messages.
Use `queuesetup` command to setup these.

You can also set role restrictions on who can use the queues (see [roles](#Role-types))

Queues are meant for special events, where there are many people wanting to do something and only a few can do it simultaneously. A queue will hold info on the order of participants (first come, first served) and the host can pick the next in line easyli with a command.

For queues to work efficiently, all members who want to be added to a queue need to set their game info first. They can do this by using `set <IGN> | <island>` command. A member can see their own info with `me` and delete their data from the bot by using `clear`.

*Currently queue system only uses game information suitable for ACNH*

Use command `create <queue name> <capacity>` to make a new queue. Others can join a queue by reacting to the queue message.

![Example queue message](https://github.com/Rigelrain/manna-bot/blob/master/images/queue01.jpg?raw=true)

### Giveaways
You must specify the length of the giveaway and the amount of winners.
*Time*: Specify time unit! Ex. 10s (10 seconds), 15m (15 minutes), 1d (one day)
*Amount of winners*: give as a plain number. Ex. 1, 10, 50

Others join the giveaway by reacting and once the giveaway ends, the bot will randomly choose a winner.

The host or a moderator can end the giveaway at anytime using command `end <giveawayID>`. If the prize cannot be delivered for some reason, the host or a moderator can reroll a winner using command `reroll <giveawayID>`. Each reroll will get one new winner, so if you need to reroll multiple winners, then use the command as many times as needed.

The host can also give a more detailed description of the giveaway or giveaway rules for example. Todo this, include the description inside double quotes in the give command: `give 1day 1 hug "This hug is given virtually and must be claimed within 24h or the prize will be rerolled."`

![Giveaway with a description](https://github.com/Rigelrain/manna-bot/blob/master/images/giveaway01.jpg?raw=true)

## Server settings
You can edit the following settings of the bot:

* *prefix* - Use command `setprefix <your chosen prefix> [true]` to setup a custom prefix. Add the 'true' if you do not want whitespace between the prefix and the command (Ex. difference of  `!help` and `! help`).
* *roles* - Use command `setroles add <roletype> <@role>` to add a role to the given roletype list, and use `setroles remove <roletype> <@role>` to remove it from the list. See additional info with `help setroles`.
* *request types* - Use command `settypes <add/remove> <request type(s)>` to limit the kinds of requests the members can make. Ex. if the server has added 'bottles-of-janx' and 'towels' as request types, then no member can request 'guides'. There are some premade sets that you can adapt and edit.
* *queues* - You need to be set a *queue category* and a *queue list channel* before the queue system can be used. Use `help queuesetup` for more information.

## Role restrictions

Initially the bot setup can only be done by a server admin (has 'manage server' permissions). The admin can setup roles which can have bot moderator permissions, meaning that members with at least one of these roles can also edit bot settings.

By default, donations and queues can be used by anyone (@everyone role). A bot moderator can setup specific roles which the member has to have in order to use these commands.

### Role types
* *moderator* - role(s) that can edit bot settings
* *requester* - role(s) that can use `request` command
* *pledger* - role(s) that can use `donate` command
* *queuemod* - role(s) that can host queues, note that if *queue* role is set, then that will also act as a restriction to queuemod, if queuemod is not specifically set
* *queue* - role(s) that can join queues
* *giveaway* - role(s) that can create giveaways (participating in a giveaway is not restricted)

Each role type can have one or more roles specified. So you can have multiple roles which can edit the bot, as well as request or pledge. You can add the same role into all the role types if you need to.

## Best Practices
* It's best practice to give the bot some specific role that you can use to limit the channels the bot can use. Ex. make a Manna role that can only access channel #donations.
* Bot needs *at least* 'Read messages', 'Send messages', 'Manage messages', 'Manage roles', 'Manage channels' permissions for the channel(s) it is supposed to operate in. The manage messages is needed so that the bot can delete the command messages (to keep the channel cleaner) and edit past donations. The manage roles and channels is used for creating and deleting the queue channels and adding people to them.
* The bot has no control over how the donations are actually given to the requester. Requester is notified on who pledged and for how much. It is recommended these be handled via DMs
