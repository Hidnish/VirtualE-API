import { getConnection } from '../database.js'
import jwt from 'jsonwebtoken'
import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

const dbTable = 'User'

//example of a get request
const getUsers = async (req, res) => {
	try {
		const connection = await getConnection()
		// all you need to do is to write the query on the next line
		// for the other controller functions just copy this one.
		const dbQuery = `SELECT * FROM ${dbTable}`
		const result = await connection.query(dbQuery)
		res.json(result).status(200)
	} catch (error) {
		res.status(500)
		res.send(error.message)
	}
}

const getUser = async (req, res) => {
	try {
		const connection = await getConnection()
		const dbQuery = `SELECT * FROM ${dbTable} WHERE id = ?`
		const queryValues = [parseInt(req.params.userId)]
		const result = await connection.query(dbQuery, queryValues)

		if (!result[0]) {
			res.json({ error: 'user does not exist!' }).status(204)
			return
		}
		res.json(result).status(200)
	} catch (error) {
		res.status(500)
		res.json({ error: error.message })
	}
}

const addUser = async (req, res) => {
	try {
		const schema = Joi.object({
			username: Joi.string().min(2).max(30).required(),
			email: Joi.string()
				.email({
					minDomainSegments: 2,
					tlds: { allow: ['com', 'net'] },
				})
				.required(),
			password: Joi.string().min(3).max(30).required(),
		})

		const { error, value } = schema.validate(req.body)
		if (error) {
			res.status(400)
			res.json({ error: error.details[0].message })
			return
		}

		const connection = await getConnection()

		const { username, password, email } = value
		const queryValues = [username, password, email]

		const existingEmail = await connection.query(
			`SELECT * FROM ${dbTable} WHERE email = ?`,
			email
		)

		if (existingEmail[0]) {
			res.json({ error: 'email already exists' }).status(409)
			return
		}

		const dbQuery = `INSERT INTO ${dbTable}  
    (username, password, email)
    VALUES(?, ?, ?)
    RETURNING *`

		const result = await connection.query(dbQuery, queryValues)
		res.json(result).status(200)
	} catch (error) {
		res.status(500)
		res.send(error.message)
	}
}

const deleteUser = async (req, res) => {
	try {
		const connection = await getConnection()
		const dbQuery = `DELETE FROM ${dbTable} WHERE id = ?`
		const queryValues = [parseInt(req.params.userId)]
		const result = await connection.query(dbQuery, queryValues)
		if (result.affectedRows == 0) {
			res.json({ error: 'user does not exist!' }).status(204)
			return
		} else {
			res.json({ result: 'record deleted successfully!' }).status(200)
		}
	} catch (error) {
		res.status(500)
		res.send(error.message)
	}
}

// ENDPOINT FOR TESTING: Recreate scenario where user has logged in successfully and receives access token
const login = (req, res) => {
  const userId = req.body.id
	const user = { id: userId }
	const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)

  // accessToken -> to be used inside a REQUEST HEADER when user needs to be verified:
  // Authorizaton: "Bearer <accessToken>" 
	res.json({ accessToken: accessToken })
}

export { getUsers, addUser, getUser, deleteUser, login }
