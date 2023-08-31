const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const config = require("./user/config/db");
const imgSchema = require("../server/user/model/Image");
const allowOrigin = process.env.ALLOW_ORIGIN || "*";
const multer = require("multer");

const app = express();
const cors = require("cors");

dotenv.config();
const db = require("./user/config/db");

// Connect to the database
mongoose
  .connect(config.database, { useNewUrlParser: true })
  .then(() => {
    console.log("Database is connected");
  })
  .catch((err) => {
    console.log({ database_error: err });
  });

// Middleware
app.use(
  cors({
    origin: "http://localhost:8080",
    methods: ["GET", "PATCH", "PUT", "POST", "DELETE"],
  })
);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan("dev"));

// Multer configuration for image uploads
const storage = multer.memoryStorage(); // Store the file in memory as a Buffer
const upload = multer({ storage: storage }); // Field name in FormData

// Route to handle image uploads
app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    // Multer has successfully uploaded the file as a Buffer in req.file.buffer
    const fileData = req.file.buffer;
    const contentType = req.file.mimetype;

    // Perform any further actions with fileData and contentType
    // For example, you can save this data to MongoDB
    // ...

    // Respond with success
    return res.json({ success: true });
  });
});

// Routes
const posts = require("./routes/api/posts");
const userRoutes = require("./user/route/user"); // Bring in user routes

app.use("/user", userRoutes);
app.use("/api/posts", posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`Server started on port ${port}`));
