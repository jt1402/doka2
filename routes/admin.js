const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin");

router.get("/index", adminController.getIndex);

router.get("/advanced", adminController.getAdvanced);

router.get("/data", adminController.getData);

router.get("/editors", adminController.getEditor);

router.get("/posts", adminController.getPosts);

router.get("/simple", adminController.getSimple);

router.get("/jsgrid", adminController.getJsgrid);

router.get("/singlepost/:postId", adminController.getPost);

router.get("/createpost", adminController.getCreatePost);

router.post("/createpost", adminController.postCreatePost);

router.get("/editpost/:postId", adminController.getEditPost);

router.post("/editpost/:postId", adminController.postEditPost);

router.get("/delete-post/:postId", adminController.destroyPost);

module.exports = router;
