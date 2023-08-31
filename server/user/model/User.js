const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please Include your name"],
  },
  email: {
    type: String,
    required: [true, "Please Include your email"],
  },
  password: {
    type: String,
    required: [true, "Please Include your password"],
  },

  equipment: [
    {
      type: [String],
      required: false,
    },
  ],
  tokens: [
    {
      token: {
        type: String,
        required: false,
      },
    },
  ],
  photos: [
    {
      data: Buffer,
      contentType: String,
    },
  ],
});

//hash the password
userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

//generate auth token
userSchema.methods.generateAuthToken = async function () {
  const user = this;
  const token = jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      equipment: user.equipment,
    },
    "secret",
    {
      algorithm: "HS512",
      expiresIn: "1 week",
    }
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

//search for a user by email and password.
userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error({ error: "Invalid login details" });
  }
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new Error({ error: "Invalid login details" });
  }
  return user;
};

const User = mongoose.model("User", userSchema, "User");
module.exports = User;
