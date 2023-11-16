const Post = require("../models/posts");

const ITEMS_PER_PAGE = 9;

exports.getContact = (req, res, next) => {
  res.render("blog/contact-page", {
    pageTitle: "Contact",
    path: "/contact",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getBlog = (req, res, next) => {
  res.render("blog/blog-page", {
    pageTitle: "Doka 2 Updates",
    path: "/blog",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getPost = (req, res, next) => {
  res.render("blog/post-details", {
    pageTitle: "Posts",
    path: "/post",
    isAuthenticated: req.session.isLoggedIn,
  });
};
exports.getAbout = (req, res, next) => {
  res.render("blog/about-page", {
    pageTitle: "Information",
    path: "/about",
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.getIndex = async (req, res, next) => {
  const page = +req.query.page || 1;
  try {
    const selected = await Post.find({ isSelected: true });
    const latestPosts = await Post.find({ islatest: true }).sort([
      ["createdAt", -1],
    ]);
    const totalItems = await Post.find().countDocuments();
    const posts = await Post.find()
      .sort([["createdAt", -1]])
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("blog/landing-page", {
      latestPostsList: latestPosts,
      postList: posts,
      selectedPosts: selected,
      pageTitle: "Doka 2",
      path: "/landPage",
      isAuthenticated: req.session.isLoggedIn,
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalItems,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSinglePage = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const latestPosts = await Post.find({ islatest: true }).sort([
      ["createdAt", -1],
    ]);
    const posts = await Post.find();
    const post = await Post.findById(postId);
    if (!post) {
      res.redirect("/");
    } else {
      res.render("blog/single-page", {
        latestPostsList: latestPosts,
        post: post,
        postList: posts,
        pageTitle: "Post",
        path: "about",
        isAuthenticated: req.session.isLoggedIn,
      });
    }
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};

exports.postComment = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const comment = req.body.comment;
    const latestPosts = await Post.find({ islatest: true }).sort([
      ["createdAt", -1],
    ]);
    const posts = await Post.find();
    const post = await Post.findById(postId);
    await post.updateOne({
      $push: { comments: [{ comment: comment, userId: req.userId }] },
    });
    res.render("blog/single-page", {
      latestPostsList: latestPosts,
      post: post,
      postList: posts,
      pageTitle: "Post",
      path: "about",
      isAuthenticated: req.session.isLoggedIn,
    });
  } catch (err) {
    if (!err.statuscode) {
      err.statuscode = 500;
    }
    next(err);
  }
};
