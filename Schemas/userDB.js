const mongoose = require("mongoose");

const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
    },

    post: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  },
  { timestamps: true }
);
userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

module.exports = User;
