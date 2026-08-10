// import libraries
const mongoose = require("mongoose");

// Database connection
// below dataBaseConnection function is used to connect with database
const databaseConnection = async () => {
  try {
    // connecting with database using mongoose library and passing database url as an argument in mongoose.connect() function and it will connect with database await keyword is used to wait for the database to connect
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Successfully connected to database");
  } catch (error) {
    console.log(error);
  }
};

module.exports = databaseConnection;
