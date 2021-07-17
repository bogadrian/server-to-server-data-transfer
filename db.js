const sql = require('mssql');
require('dotenv').config();
const config = {
  user: process.env.sqlUser,
  password: process.env.sqlPassword,
  server: process.env.sqlServer,
  database: process.env.sqlDatabase,
  options: {
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    },
    enableArithAbort: true
  },
  requestTimeout: 1000000,
  pool: {
    min: 5
  }
};
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('DB connected success!');
    return pool;
  })
  .catch(err => console.log('DB connection failed ', err));

module.exports = {
  sql,
  poolPromise
};
