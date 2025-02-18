const express = require("express");
const connectDB = require("./config/connectdb");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(express.json());

connectDB();

app.use("/api", userRoutes);
app.use('/', (req, res) => res.send("API console"));

module.exports = app;