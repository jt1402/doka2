const express = require("express");

const router = express.Router();

const authController = require("../controllers/auth");

const { body } = require("express-validator");

const User = require("../models/user");

router.get("/signup", authController.getSignup);

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email address.")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      }),
    body("password").isLength({ min: 6, max: 32 }).trim(),
    body("name").trim().not().isEmpty(),
  ],
  authController.postSignup
);

router.get("/login", authController.getLogin);

router.post("/login", authController.postLogin);

router.get("/logout", authController.getLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
