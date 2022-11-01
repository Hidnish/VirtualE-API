import { getConnection } from '../database.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import Joi from 'joi'
import dotenv from 'dotenv'

dotenv.config()

const dbTable = 'User'
const saltRounds = 10
const key = process.env.ACCESS_TOKEN_SECRET

const getUsers = async (req, res) => {
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

const register = async (req, res) => {
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
      password_confirmation: Joi.any()
        .equal(Joi.ref('password'))
        .required()
        .label('Confirm password')
        .messages({ 'any.only': '{{#label}} does not match' }),
    })

    const { error, value } = schema.validate(req.body)
    if (error) {
      res.status(400)
      res.json({ error: error.details[0].message })
      return
    }

    const connection = await getConnection()

    let { username, password, email } = value

    const existingUser = await connection.query(
      `SELECT * FROM ${dbTable} WHERE email = ? OR username = ?`,
      [email, username]
    )

    if (existingUser[0]) {
      res.json({ error: 'User already exists' }).status(409)
      return
    }

    password = await bcrypt.hash(password, saltRounds)
    const queryValues = [username, password, email]

    const dbQuery = `INSERT INTO ${dbTable}  
    (username, password, email)
    VALUES(?, ?, ?)
    RETURNING *`

    const createdUser = await connection.query(dbQuery, queryValues)
    const userId = createdUser[0]['id']
    const token = jwt.sign({ id: userId }, key)

    res.json({ createdUser, token }).status(200)
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

const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().min(3).max(30).required(),
      password: Joi.string().min(3).max(30).required(),
    })

    const { error, value } = schema.validate(req.body)
    if (error) {
      res.json({ error: error.details[0].message }).status(400)
      return
    }

    const { password, email } = value
    const connection = await getConnection()
    const dbQuery = `SELECT * FROM ${dbTable} WHERE email = ?`
    const user = await connection.query(dbQuery, email)

    if (user) {
      const match = await bcrypt.compare(password, user[0].password)
      if (match) {
        const token = jwt.sign({ id: user[0].id }, key)
        res.json({ token }).status(200)
      } else {
        res.json({ error: 'email or password is incorrect' }).status(401)
      }
    } else {
      res.json({ error: 'email or password is incorrect' }).status(401)
    }
  } catch (e) {
    return res.json({ err: e.message })
  }
}

export { getUsers, register, getUser, deleteUser, login }
