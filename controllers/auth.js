const bcrypt = require("bcrypt");
const User = require("../models/user");

const crypto = require("crypto");

const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const { validationResult } = require("express-validator");

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.status(200).render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message,
  });
};
exports.postLogin = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
    });
  }
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      req.flash("error", "Invalid email or password");
      res.redirect("/login");
    }
    const bcryptPassword = await bcrypt.compare(password, user.password);
    if (bcryptPassword) {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        console.log(err);
        res.redirect("/");
      });
    } else {
      req.flash("error", "Invalid email or password");
      res.redirect("/login");
    }
  } catch (err) {
    console.log(err);
  }
};

//logging out
exports.getLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

//redirecting to signup page
exports.getSignup = (req, res, next) => {
  res.status(200).render("auth/signup", {
    pageTitle: "signup",
  });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/signup", {
      pageTitle: "Signup",
    });
  }
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name,
      });
      return user.save();
    })
    .then((result) => {
      res.redirect("/login");
      return transporter.sendMail({
        to: email,
        from: "theway1402@gmail.com",
        subject: "Signup succeeded",
        html: "<h1>Signup succeeded<h1>",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.statusCode = 500;
      throw error;
    });
};

exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    pageTitle: "reset",
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        res.redirect("/");
        transporter.sendMail({
          to: req.body.email,
          from: "theway1402@gmail.com",
          subject: "Password Reset",
          html: `<h1>You requested a password reset<h1>
                  <p>click a <a href="http://localhost:3000/reset/${token}">link</a> to set a new Password</p>`,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({
    resetToken: token,
    resetTokenExpiration: { $gt: new Date() },
  })
    .then((user) => {
      res.render("auth/new-password", {
        pageTitle: "New Password",
        userId: user.id.toString(),
        passwordToken: token,
      });
    })
    .catch();
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPw) => {
      resetUser.password = hashedPw;
      resetUser.resetToken = null;
      resetUser.resetTokenExpiration = null;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
