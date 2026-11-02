require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(express.json());



// Database connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Your database is connected"))
  .catch((e) => console.log(e));

app.listen(PORT, () => {
  console.log(`Server iko on na inarun kwa port ${PORT}`);
});