const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
  text: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  children: {
    Object: [
      {
        url: String,
        name: String,
      },
    ],
    type: Array,
  },
});

const Post = mongoose.model("Post", postSchema);
module.exports = Post;