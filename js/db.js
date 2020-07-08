const Server = require('../schemas/server')
const Request = require('../schemas/request')

module.exports = {
    async getServerData(id) {

        // exclude fields that do not matter for our purposes
        const data =  await Server.findOne({serverID: id}, { __v: 0}).lean().exec()

        // console.log(`[ DB ] Server: ${JSON.stringify(data, null, 2 )}`)
        if(!data) { // return an empty object
            return {}
        }

        return data
    },
    /**
     * 
     * @param {string} id - user id
     */
    async getRequestData(id) {
        const data = await Request.findOne({userID: id}).lean().exec()

        // console.log(`[ DB ] Request: ${JSON.stringify(data, null, 2)}`)

        if(!data) {
            return undefined
        }

        return data
    },
    async newRequest(data) {
        const newReq = await Request.create(data)

        // console.log(`[ DB ] New request saved: ${JSON.stringify(newReq, null, 2)}`)
        return newReq
    },
    /**
     * 
     * @param {string} id - request _id
     * @param {number} amount 
     */
    async updateRequest(id, amount) {
        const updatedReq = await Request.findByIdAndUpdate(id, {remaining: amount}, {new:true, lean: true}).exec()

        //console.log(`[ DB ] Request updated to: ${JSON.stringify(updatedReq, null, 2)}`)
        return updatedReq
    },
    /**
     * 
     * @param {string} id - request _id
     */
    async deleteRequest(id) {
        await Request.findByIdAndDelete(id).exec()
        return
    },
}