import mysql from 'promise-mysql';
import dotenv from 'dotenv';
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
  user: process.env.SQL_USER,
  password: process.env.SQL_PASSWORD,
  multipleStatements: true,
});

const getConnection = () => {
  return connection;
};

export { getConnection };
