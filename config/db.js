const mongoose = require("mongoose");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });

const DB_URL = process.env.DB_URL;
const dbConnect = () => {
  mongoose
    .connect(DB_URL)
    .then((data) => {
      console.log(`MongoDB connection succesfully connected.`);
    })
    .catch((err) => {
      console.log(`error connecting to the database ${err}`);
    });
};

module.exports = dbConnect;
