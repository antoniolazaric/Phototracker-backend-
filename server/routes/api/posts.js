const express = require("express");
const mongodb = require("mongodb");
const User = require("../../user/model/User");
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
    "mongodb+srv://admin:admin@cluster0.jcggbwf.mongodb.net/",
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
  try {
    const users = await User.find({}); // Fetch all users

    // Map the users and their photos as in the second function
    const usersWithPhotos = users.map((user) => {
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        equipment: user.equipment, // Include other user properties as needed
        photos: [],
      };

      if (user.photos && user.photos.length > 0) {
        userData.photos = user.photos.map((photo) => {
          if (photo.data instanceof Buffer && photo.contentType) {
            // Convert the buffer to a base64 string
            const dataBuffer = photo.data;
            return {
              _id: photo._id,
              url: photo.data,
              type: photo.contentType,
            };
          } else {
            return {
              _id: photo._id,
              url: "", // Provide a default URL or empty string if photo data or contentType is missing
              type: "",
            };
          }
        });
      }

      return userData;
    });

    res.send(usersWithPhotos);
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: "Internal server error" });
  }
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
      url: photo.data,
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

//DELETE
router.delete("/:userId/photos/:imageId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const imageId = req.params.imageId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    // Find the image in the user's photos array by ID
    const imageIndex = user.photos.findIndex((photo) => photo._id == imageId);

    if (imageIndex === -1) {
      return res.status(404).send({ error: "Image not found" });
    }

    // Remove the image from the user's photos array
    user.photos.splice(imageIndex, 1);

    // Save the updated user data
    await user.save();

    res.send({ success: true });
  } catch (error) {
    console.error("Error deleting image:", error);
    res.status(500).send({ error: "Internal server error" });
  }
});

module.exports = router;
