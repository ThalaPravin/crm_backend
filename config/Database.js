
require("dotenv").config();
require("dotenv").config();
const Sequelize = require("sequelize");

const db = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,       // <-- ADD THIS!
    dialect: process.env.DB_DIALECT,
    logging: false                   // optional: disable SQL logging
  }
);

module.exports = db;



// const db = new Sequelize('fyjrbbgt_crm', 'fyjrbbgt_siddharth', 'Siddharth@123', {
//     host: "localhost",
//     dialect: "mysql"
// });
 
// module.exports = db;
