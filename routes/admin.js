require('dotenv').config();
const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
// ======================
// Admin hardcoded login
// ======================
passport.use('admin-local', new LocalStrategy(
  (username, password, done) => {
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD ) {
      const adminUser = { _id: 'admin-id', username: 'Qasim Usman', isAdmin: true };
      return done(null, adminUser);
    } else {
      return done(null, false, { message: 'Invalid credentials' });
    }
  }
));

// ======================
// Serialize / Deserialize
// ======================
passport.serializeUser((user, done) => {
  if (user.isAdmin) {
    done(null, { admin: true, id: user._id }); // admin ke liye flag store
  } else {
    done(null, { admin: false, id: user._id }); // normal user id
  }
});

passport.deserializeUser(async (obj, done) => {
  try {
    if (obj.admin) {
      // agar admin hai to sidha object return
      return done(null, { _id: obj.id, username: 'Admin', isAdmin: true });
    } else {
      // normal user ke liye DB se nikal
      const user = await User.findById(obj.id);
      return done(null, user);
    }
  } catch (err) {
    return done(err);
  }
});

// ======================
// Admin Routes
// ======================
router.get('/admin', (req, res) => {
  res.render('pages/admin', { error: null });
});

router.post('/admin', (req, res, next) => {
  passport.authenticate('admin-local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.render('pages/admin', { error: info.message });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.redirect('/dashboard');
    });
  })(req, res, next);
});

router.get('/admin/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

module.exports = router;
