const mongoose = require("mongoose");
const uri = process.env.MONGO_URL;

// Connect to MongoDB using createConnection method
// var conn_options = {
//   autoIndex: false, // Don't build indexes
//   reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
//   reconnectInterval: 500, // Reconnect every 500ms
//   poolSize: 5, // Maintain up to 10 socket connections
//   // If not connected, return errors immediately rather than waiting for reconnect
//   bufferMaxEntries: 0,
//   useNewUrlParser: true,
//   useUnifiedTopology: false,
//   socketTimeoutMS: 30000,
//   keepAlive: true,
//   keepAliveInitialDelay: 150000,
// }
const db = mongoose.createConnection(uri)//, conn_options);

// Check for connection errors
db.on("error", console.error.bind(console, "connection error:"));

// Once connected, log a success message
db.once("open", async function () {
  console.log("Connected to VB Store database");
});

module.exports = db;
