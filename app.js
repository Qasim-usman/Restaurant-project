const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const Menu = require('./models/menu'); // Assuming you have a Menu model
const app = express();
const flash = require('connect-flash');
const methodOverride = require("method-override");
const Order = require('./models/order'); // Assuming you have an Order model
const Cart = require('./models/cart'); // Assuming you have a Cart model
// app.use ke sath
const PORT = process.env.PORT || 3000;
app.use(methodOverride("_method"));
app.use(flash());
// Connect MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/restaurant', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session
app.use(session({
    secret: 'mysecretkey',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport local strategy for normal users
const User = require('./models/user');
const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(User.authenticate()));

app.use(async (req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");

  if (req.user) {
    try {
      const cart = await Cart.findOne({ user: req.user._id });
      res.locals.cartCount = cart
        ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
        : 0;
    } catch (err) {
      console.error("Error fetching cart count:", err);
      res.locals.cartCount = 0;
    }
  } else {
    res.locals.cartCount = 0;
  }

  next();
});
// Routes
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');
const restaurantRoutes = require('./routes/restautrant');
const cartRoutes = require('./routes/cart');
app.use("/", cartRoutes);   // 👈 ye zaroor hona chahiye
const orderRoutes = require('./routes/order');
app.use("/", orderRoutes);   // 👈 ye zaroor hona chahiye
app.use('/', restaurantRoutes);
app.use('/', userRoutes);
app.use('/', adminRoutes);

// Middleware to make user available in all views

 
// Dashboard route
app.get('/dashboard', async (req, res) => {
  if (req.isAuthenticated()) {
    if (req.user.isAdmin) {
      try {
        const menus = await Menu.find();
        const orders = await Order.find().populate('user').populate('items.productId');
        const users = await User.find();
        const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);

        res.render('pages/dashboard', { menus, orders, users ,totalRevenue});
      } catch (err) {
        console.log(err);
        res.send('Error fetching dashboard data');
      }
    } else {
      res.send('Welcome User Dashboard');
    }
  } else {
    res.redirect('/admin');
  }
});



// Home route
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.listen(PORT, () => {
    console.log('Server running on http://localhost:3000');
});
