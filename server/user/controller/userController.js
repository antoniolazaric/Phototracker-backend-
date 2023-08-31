const User = require("../model/User");

exports.getUserDetails = async (req, res) => {
  await res.json(req.userData);
};

exports.registerNewUser = async (req, res) => {
  try {
    console.log("Registering new user:", req.body);
    const equipmentformated = req.body.equipment;
    console.log("before ", equipmentformated);
    const newequipment = equipmentformated.replace("\n", " ");
    console.log("--------------------------------------called ");

    const user = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      equipment: newequipment,
      photos: null,
    });
    let data = await user.save();
    const token = await user.generateAuthToken();
    res.status(201).json({ data, token });
  } catch (err) {
    console.error("Error registering new user:", err);
    res.status(400).json({ err: err });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const user = await User.findByCredentials(email, password);
    if (!user) {
      return res
        .status(401)
        .json({ error: "Login failed! Check authentication credentials" });
    }
    const token = await user.generateAuthToken();
    res.status(201).json({ user, token });
  } catch (err) {
    res.status(400).json({ err: err });
  }
};
exports.checkUser = async (req, res) => {
  try {
    if (auth) next();
  } catch (err) {
    res.status(400).json({ err: err });
  }
};
