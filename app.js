const express = require("express");

const path = require("path");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const app = express();

const session = require("express-session");

const mongodbBlog = require("connect-mongodb-session")(session);

const flash = require("connect-flash");

const User = require("./models/user");

app.use(flash());

app.set("view engine", "ejs");
app.set("views", "views");

const landPageRoutes = require("./routes/landing-page");
const authRoutes = require("./routes/auth");
const adminRoutes = require("./routes/admin");

const MONGODB_URI = "mongodb+srv://jt:1402@doka2.ad8v9qr.mongodb.net/";
const blog = new mongodbBlog({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  session({
    secret: "as312zxvds@!@$!!@sadsa",
    resave: false,
    saveUninitialized: false,
    store: blog,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});


app.use("/", landPageRoutes);
app.use("/", authRoutes);
app.use("/admin", adminRoutes);

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => console.log(err));
