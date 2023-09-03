const express = require("express");
const mongodb = require("mongodb");
const User = require("../../user/model/User");
const Post = require("../../user/model/Post");
const { db } = require("../../user/model/User");
const multer = require("multer");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Set the destination folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Set a unique filename
  },
});
const upload = multer({ storage: storage });

// Load post func
async function loadUserCollection() {
  const client = await mongodb.MongoClient.connect(
    "mongodb+srv://admin:admin@cluster0.jcggbwf.mongodb.net/Phototracker?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
    }
  );
  console.log(client.db("Phototracker").collection("User"));

  return client.db("Phototracker").collection("User");
}

// posts.js

const { getUserCollection } = require("../../user/config/db");

const router = express.Router();

// Load posts
router.get("/", async (req, res) => {
  const posts = await loadUserCollection();
  res.send(await posts.find({}).toArray());
});

//GET
router.get("/:id", async (req, res) => {
  console.log(req.params.id);
  const users = await loadUserCollection();
  const id2 = req.params.id;
  //const id = req.params.id;
  res.send(await users.find({ _id: id2 }).toArray());
});
//ADD

//POST
router.post("/picture", upload.single("image"), async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    user.photos.push(req.file.path);
    await user.save();
    res.send({ success: true });
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

router.post("/picture2", upload.single("image"), async (req, res) => {
  try {
    const file = req.file;
    // Use file.buffer and file.mimetype to save image data to MongoDB
    // ...
    res.send({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

//experimental
router.post("/add-picture", upload.single("image"), (req, res) => {
  const saveImage = User.photos({
    photos: {
      data: fs.readFileSync("uploads/" + req.file.filename),
      contentType: "image/png",
    },
  });
  saveImage
    .save()
    .then((res) => {
      console.log("image is saved");
    })
    .catch((err) => {
      console.log(err, "error has occur");
    });
  res.send("image is saved");
});

router.get("/picturesAll/:userId", async (req, res) => {
  const userId = req.params.userId;
  const allData = await User.findById(userId);

  res.json(allData);
});

//PATCH

router.patch("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    console.log("userId:", userId);
    const updates = Object.keys(req.body);
    console.log("updates:", updates);

    // ...
    const user = await User.findById(userId);
    console.log("user before update:", user);
    updates.forEach((update) => {
      user[update] = req.body[update];
    });
    // ...
    await user.save();
    console.log("user after update:", user);
    res.send(user);
  } catch (err) {
    res.status(400).send(err);
  }
});

//SEARCH

router.get("/:userId/photos", async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    const imageUrls = user.photos.map((photo) => ({
      _id: photo._id,
      url: `http://localhost:5000/${photo.data}`,
    }));

    res.set("Cache-Control", "no-store");
    res.send(imageUrls);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
});

router.post("/photo", function (req, res) {
  var newItem = new Item();
  newItem.img.data = fs.readFileSync(req.files.userPhoto.path);
  newItem.img.contentType = "image/png";
  newItem.save();
});

router.post("/add-entry/:id", upload.single("image"), async (req, res) => {
  try {
    const userId = req.params.id;

    if (!req.file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const newEntryData = {
      data: fs.readFileSync("uploads/" + req.file.filename), // Save the path to the uploaded image
      contentType: req.file.mimetype,
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    if (!user.photos) {
      user.photos = []; // Initialize as an empty array if it's null
    }

    user.photos.push(newEntryData);
    await user.save();

    res.send({ success: true });
  } catch (error) {
    console.error("Error adding new entry:", error);
    res.status(400).send({ error: error.message });
  }
});

module.exports = router;
