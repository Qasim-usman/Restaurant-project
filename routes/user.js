const express = require('express');
const router = express.Router();
const User = require('../models/user');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync');

// User signup
router.get("/signup", (req, res) => {
    res.render("pages/signup");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
  const { username, email, password } = req.body;
  const newUser = new User({ username, email });
  const registeredUser = await User.register(newUser, password);
  req.login(registeredUser, (err) => {
    if (err) return next(err);
    
    res.redirect('/');
  });
}));

// User login
router.get("/login", (req, res) => {
    res.render("pages/login");
});

router.post("/login", (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.redirect('/login');
    req.logIn(user, (err) => {
      if (err) return next(err);
      res.redirect('/');
    });
  })(req, res, next);
});


router.get("/logout",(req, res, next) => {
    req.logout(err => {
        if(err) return next(err);
        res.redirect('/');
    });
});

module.exports = router;
