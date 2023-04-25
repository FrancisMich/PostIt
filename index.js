require('dotenv').config();
const express = require("express");
const mongoose = require("./myDataBase");
const bodyParser = require("body-parser");
const app = express();
const ejs = require("ejs");
const path = require("path");
const session = require('express-session');
const passport = require('passport');
const User = require("./Schemas/userDB");
const Post = require("./Schemas/postDB");
const Comment = require("./Schemas/commentDB");
const methodOverride = require('method-override');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.use(session({
  secret: "This is our session parse",
  saveUninitialized: false,
  resave: false
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

app.use(methodOverride('_method'));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get('/main', async function (req, res) {
  let page = 1;
  if (req.query.page) {
    page = req.query.page;
  }

  const limit = 5;

  try {
    const posts = await Post.find().sort({ createdAt: 'desc' }).limit(limit * 1).skip((page - 1) * limit).exec();
    const totalPosts = await Post.find().sort({ createdAt: 'desc' }).countDocuments();
    res.render('main', {
      posts, totalPages: Math.ceil(totalPosts / limit), currentPage: page
    });
  } catch (err) {
    console.log(err);
  }
});

app.get('/posts/:id', function (req, res) {
  const id = req.params.id.trim();
  Post.findById(id).populate('comments').exec()
    .then(function (post) {
      if (post) {
        res.render('feature', { post: post })
      }
    })
    .catch(function (err) {
      console.log(err)
    });
});


app.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

app.post("/signup", function (req, res) {
  User.register(new User({
    username: req.body.username
  }), req.body.password, function (err, user) {
    if (err) {
      console.log(err);
      res.redirect("/signup");
    } else {
      passport.authenticate("local")(req, res, function () {
        console.log(User);
        res.redirect("/main");
      });
    }
  });
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/main",
  failureRedirect: "/login"
}));

app.post('/posts', function (req, res) {
  const post = new Post(req.body)
  post.save()
    .then(function (post) {
      res.redirect('/main')
    })
    .catch(function (err) {
      console.log(err);
    })
})

app.post('/posts/:id/comment', function (req, res) {
  const id = req.params.id;
  const comment = new Comment({
    body: req.body.comment,
    post: id
  })
  comment.save()
    .then(function (comment) {
      return Post.findByIdAndUpdate(id, { $push: { comments: comment._id } });
    })
    .then(function () {
      res.redirect(`/posts/${id}`)
    })
    .catch(function (err) {
      console.log(err)
    })
})


app.delete('/posts/:id', function (req, res) {
  const id = req.params.id;
  const userId = req.user; // assuming the user ID is stored in req.user._id after login

  Post.find(userId)
    .then(function (post) {
      if (!post) {
        return res.status(404).send('Post not found');
      }
      return Post.findByIdAndDelete(id);
    })
    .then(function () {
      res.redirect('/main');
    })
    .catch(function (err) {
      console.log(err);
      res.redirect('/main');
    });
});

// app.delete('/posts/:id', function (req, res) {
//   const id = req.params.id
//   Post.findByIdAndDelete(id)
//     .then(function () {
//       res.redirect('/main')
//     })
//     .catch(function (err) {
//       console.log(err)
//       res.redirect('/main')
//     })
// });

app.listen(3000, function () {
  console.log("server is running at port 3000");
});