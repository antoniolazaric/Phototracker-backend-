const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const auth = require("../config/auth");
const { collection } = require("../model/User");


router.post("/register", userController.registerNewUser);
router.post("/login", userController.loginUser);
router.get("/me", auth, userController.getUserDetails);



module.exports = router;
