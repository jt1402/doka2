const path = require("path");

const express = require("express");

const router = express.Router();

const landPageController = require("../controllers/landing-page");

const isAuth = require("../middleware/is-auth");

router.get("/", landPageController.getIndex);

router.get("/blog-updates", landPageController.getBlog);

router.get("/contact", landPageController.getContact);

router.get("/about", landPageController.getAbout);

router.get("/post-details", landPageController.getPost);

router.get("/single-page/:postId", landPageController.getSinglePage);

router.post("/single-page/:postId", landPageController.postComment);

module.exports = router;
