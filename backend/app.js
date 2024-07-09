require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bookRoutes = require("./routes/book");

mongoose
  .connect(process.env.MONGO_DB)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch((error) => console.log("Connexion à MongoDB échouée !", error));

const app = express();

app.use(cors()); // Utilisation du middleware cors
app.use(express.json()); // Middleware pour parser les requêtes JSON

app.use("/api/books", bookRoutes);

module.exports = app;
