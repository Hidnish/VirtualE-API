import { getConnection } from '../database.js'
import Joi from 'joi'
const dbTable = 'Channel'

const getChannels = async (req, res) => {
  try {
    const connection = await getConnection()
    const dbQuery = `SELECT * FROM ${dbTable}`
    const result = await connection.query(dbQuery)
    res.json(result).status(200)
  } catch (error) {
    res.status(500)
    res.send(error.message)
  }
}

const getChannel = async (req, res) => {
  try {
    const connection = await getConnection()
    const dbQuery = `SELECT * FROM ${dbTable} WHERE id = ?`
    const queryValues = [parseInt(req.params.channelId)]
    const result = await connection.query(dbQuery, queryValues)

    if (!result[0]) {
      res
        .json({ error: 'The channel you are looking for does not exist!' })
        .status(204)
      return
    }

    res.json(result).status(200)
  } catch (error) {
    res.status(500)
    res.json({ error: error.message })
  }
}

const addChannel = async (req, res) => {
  try {
    const schema = Joi.object({
      channelName: Joi.string().min(2).max(30).required(),
    })
    const { error, value } = schema.validate(req.body)

    if (error) {
      res.status(400)
      res.json({ error: error.details[0].message })
      return
    }

    const { channelName } = value
    const connection = await getConnection()

    const authorId = req.user.id
    const queryValues = [authorId, channelName, authorId]

    const existingChannelName = await connection.query(
      `SELECT * FROM ${dbTable} WHERE channelName = ?`,
      channelName
    )

    if (existingChannelName[0]) {
      res
        .json({
          error: 'A channel with the same name already exists',
        })
        .status(409)
      return
    }

    const dbQuery = `INSERT INTO ${dbTable} (authorId, channelName) VALUES(?, ?) RETURNING *;
    INSERT INTO userchannel (userId, channelId) VALUES(?, LAST_INSERT_ID()) RETURNING *`

    const result = await connection.query(dbQuery, queryValues)
    res.json(result).status(200)
  } catch (error) {
    res.status(500)
    res.send(error.message)
  }
}

const editChannelName = async (req, res) => {
  try {
    const schema = Joi.object({
      channelName: Joi.string().min(2).max(30).required(),
    })

    const { error, value } = schema.validate(req.body)

    if (error) {
      res.status(400)
      res.json({ error: error.details[0].message })
      return
    }

    const connection = await getConnection()
    const authorId = req.user.id

    const { channelName } = value

    const dbQuery = `UPDATE ${dbTable} SET channelName = ? WHERE id = ? AND authorId = ?`
    const queryValues = [channelName, parseInt(req.params.channelId), authorId]
    const result = await connection.query(dbQuery, queryValues)
    if (result.affectedRows == 0) {
      res
        .json({
          error:
            'Channel does not exist, or user is not authorized to change channel name',
        })
        .status(204)
      return
    } else {
      res.json({ result: 'Record edited successfully!' }).status(200)
    }
  } catch (error) {
    res.status(500)
    res.json({ error: error.message })
  }
}

const deleteChannel = async (req, res) => {
  try {
    const connection = await getConnection()
    const authorId = req.user.id
    const channelId = parseInt(req.params.channelId)

    const dbQuery = `
    DELETE FROM ${dbTable} WHERE id = ? AND authorId = ?`
    const queryValues = [channelId, authorId]
    const result = await connection.query(dbQuery, queryValues)

    if (result.affectedRows == 0) {
      res
        .json({
          error:
            'Channel does not exist, or user is not authorized to delete channel',
        })
        .status(204)
      return
    } else {
      res.json({ result: 'Record deleted successfully!' }).status(200)
    }
  } catch (error) {
    res.status(500)
    res.send(error.message)
  }
}

const subscribeChannel = async (req, res) => {
  try {
    const userId = req.user.id
    const channelId = parseInt(req.params.channelId)
    const connection = await getConnection()
    const queryValues = [userId, channelId]

    const existingChannel = await connection.query(
      `SELECT * FROM ${dbTable} WHERE id = ?`,
      channelId
    )

    if (!existingChannel[0]) {
      res.json({ error: 'Channel does not exist' }).status(204)
      return
    }

    const subscribedUser = await connection.query(
      `SELECT * FROM userchannel
      WHERE userId = ? AND channelId = ?`,
      queryValues
    )

    if (subscribedUser[0]) {
      res
        .json({ error: 'User is already subscribed to the channel' })
        .status(409)
      return
    }

    const dbQuery = `INSERT INTO userchannel (userId, channelId) VALUES(?, ?) RETURNING *`
    const result = await connection.query(dbQuery, queryValues)
    res.json({ result: result }).status(200)
  } catch (error) {
    res.status(500)
    res.send(error.message)
  }
}

const unSubscribeChannel = async (req, res) => {
  try {
    const userId = req.user.id
    const channelId = parseInt(req.params.channelId)
    const connection = await getConnection()
    const queryValues = [userId, channelId]

    const existingChannel = await connection.query(
      `SELECT * FROM ${dbTable} WHERE id = ?`,
      channelId
    )

    if (!existingChannel[0]) {
      res.json({ error: 'Channel does not exist' }).status(204)
      return
    }

    const subscribedUser = await connection.query(
      `SELECT * FROM userchannel
      WHERE userId = ? AND channelId = ?`,
      queryValues
    )

    if (!subscribedUser[0]) {
      res.json({ error: 'User is NOT subscribed to the channel' }).status(204)
      return
    }

    const dbQuery = `DELETE FROM userchannel WHERE userId = ? AND channelId = ? RETURNING *`
    const result = await connection.query(dbQuery, queryValues)
    res.json({ result: result }).status(200)
  } catch (error) {
    res.status(500)
    res.send(error.message)
  }
}

const getUserChannels = async (req, res) => {
  try {
    const userId = req.user.id
    const connection = await getConnection()
    const dbQuery = `
    SELECT newchannel.id, channelName, newchannel.authorId, user.id AS participantId, username, email, user.createdAt, user.updatedAt

	    FROM (SELECT channel.id, channelName, channel.authorId, channel.createdAt, channel.updatedAt
	    FROM channel
		  INNER JOIN userchannel
		  ON channel.id = userchannel.channelId
		  WHERE userId = ?) AS newchannel
    
	  INNER JOIN userchannel
	  ON newchannel.id = userchannel.channelId
	  INNER JOIN user
	  ON user.id = userchannel.userId`

    const result = await connection.query(dbQuery, userId)
    if (!result[0]) {
      res
        .json({
          error: 'User is not a participant in any channel',
        })
        .status(204)
      return
    }
    const channels = groupByChannel(result)
    res.json({ channels: channels }).status(200)
  } catch (error) {
    res.status(500).send(error.message)
  }
}

const groupByChannel = (data) => {
  const channels = {}
  for (let n of data) {
    let obj = {
      id: n.id,
      channelName: n.channelName,
      authorId: n.authorId,
      participants: [],
    }

    if (!channels[obj.id]) {
      channels[obj.id] = obj
    }
    const user = {
      id: n.participantId,
      username: n.username,
      email: n.email,
      createdAt: n.createdAt,
      updatedAt: n.updatedAt,
    }
    channels[n.id].participants.push(user)
  }
  return Object.values(channels)
}

export {
  getChannel,
  getChannels,
  addChannel,
  editChannelName,
  deleteChannel,
  subscribeChannel,
  unSubscribeChannel,
  getUserChannels,
}
