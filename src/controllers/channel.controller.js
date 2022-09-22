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
			res.json({ error: 'The channel you are looking for does not exist!' }).status(204)
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

		// Extract req.user.id from jwt middleware
		const authorId = req.user.id

		const queryValues = [authorId, channelName]

		const existingChannelName = await connection.query(
			`SELECT * FROM ${dbTable} WHERE channelName = ?`,
			channelName
		)

		if (existingChannelName[0]) {
			res.json({
				error: 'A channel with the same name already exists',
			}).status(409)
			return
		}

		const dbQuery = `INSERT INTO ${dbTable} (authorId, channelName) VALUES(?, ?) RETURNING *`

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
			channelName: Joi.string().min(2).max(30).required()
		})

		const { error, value } = schema.validate(req.body)
		
		if (error) {
			res.status(400)
			res.json({ error: error.details[0].message })
			return
		}

		const connection = await getConnection()

		const { channelName } = value

		const dbQuery = `UPDATE ${dbTable} SET channelName = ? WHERE id = ?`
		const queryValues = [channelName, parseInt(req.params.channelId)]
		const result = await connection.query(dbQuery, queryValues)
		if (result.affectedRows == 0) {
			res.json({ error: 'Channel does not exist!' }).status(204)
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
		const dbQuery = `DELETE FROM ${dbTable} WHERE id = ?`
		const queryValues = [parseInt(req.params.channelId)]
		const result = await connection.query(dbQuery, queryValues)
		if (result.affectedRows == 0) {
			res.json({ error: 'Channel does not exist!' }).status(204)
			return
		} else {
			res.json({ result: 'Record deleted successfully!' }).status(200)
		}
	} catch (error) {
		res.status(500)
		res.send(error.message)
	}
}

export { getChannel, getChannels, addChannel, editChannelName, deleteChannel }
