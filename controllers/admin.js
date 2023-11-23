const Post = require("../models/posts");
const User = require("../models/user");

exports.getIndex = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments(); // Fetch post count

    res.render("admin/index", {
      userCount: userCount,
      postCount: postCount, // Pass post count to the template
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAdvanced = (req, res, next) => {
  res.render("admin/advanced");
};

exports.getData = (req, res, next) => {
  res.render("admin/data");
};

exports.getJsgrid = (req, res, next) => {
  res.render("admin/jsgrid");
};

exports.getSimple = (req, res, next) => {
  res.render("admin/simple");
};

exports.getEditor = (req, res, next) => {
  res.render("admin/editors");
};

exports.getPosts = async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });;;
    const postCount = await Post.countDocuments();

    res.render("admin/posts", {
      postList: posts,
      postCount: postCount,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCreatePost = async (req, res, next) => {
  try {
    res.render("admin/create-post", {});
  } catch (err) {
    if (err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      if (!post) {
        res.redirect("/admin/posts");
      } else {
        res.render("admin/single-post", {
          post: post,
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCreatePost = async (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;

  try {
    const post = new Post({
      title: title,
      imageUrl: imageUrl,
      description: description,
    });

    await post.save();

    // Increment the post count
    const posts = await Post.find().sort({ createdAt: -1 });;
    const postCount = await Post.countDocuments();
    res.render("admin/posts", {
      postList: posts, // You may fetch the actual post list here,
      postCount: postCount,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getEditPost = async (req, res, next) => {
  const editMode = req.query.edit || false;
  if (!editMode) {
    res.redirect("/admin/posts");
  }

  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      res.redirect("/admin/posts");
    } else {
      res.render("admin/edit-post", {
        post: post,
      });
    }
  } catch (err) {
    if (err.statusCode) {
      err.statusCode = 500;
    }
  }
};
exports.postEditPost = (req, res, next) => {
  const postId = req.params.postId;
  const updatedTitle = req.body.title;
  const updatedDescription = req.body.description;
  const updatedImageUrl = req.body.imageUrl;
  Post.findById(postId)
    .then((post) => {
      post.title = updatedTitle;
      post.description = updatedDescription;
      post.imageUrl = updatedImageUrl;
      post.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/posts");
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
    });
};

exports.destroyPost = (req, res, next) => {
  const postId = req.params.postId;
  Post.findByIdAndRemove(postId)
    .then(res.redirect("/admin/posts"))
    .catch((err) => {
      console.log(err);
    });
};
