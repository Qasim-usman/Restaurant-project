const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const Order = require("../models/order");
const Menu = require("../models/menu");
const wrapAsync = require('../utils/wrapAsync');

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (!req.user) {
    return res.redirect("/login"); // or send 401
  }
  next();
}

// ---------------------- CHECKOUT PAGE ----------------------
router.get("/checkout", isAuthenticated, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.productId");

    // Agar cart empty hai ya items nahi hain
    if (!cart || !cart.items || cart.items.length === 0) {
      // Optionally flash message
      req.flash("error", "Your cart is empty! Add some items before checkout.");
      return res.redirect("/cart");
    }

    // Agar cart me items hain to checkout render karo
    res.render("pages/checkout", { cart });
    
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
});


// ---------------------- PLACE ORDER ----------------------
router.post("/checkout", isAuthenticated,wrapAsync( async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.productId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).send("Your cart is empty!");
    }

    const { fullName, address, city, postalCode, country, payment } = req.body;

    // Basic validation
    if (!fullName || !address || !city || !postalCode || !country || !payment) {
      return res.status(400).send("All fields are required!");
    }

    const subtotal = cart.items.reduce((acc, item) => acc + item.productId.price * item.quantity, 0);
    const tax = 50;
    const delivery = 200;
    const total = subtotal + tax + delivery;

    const order = new Order({
      user: userId,
      items: cart.items,
      shippingDetails: { fullName, address, city, postalCode, country },
      paymentMethod: payment,
      subtotal,
      delivery,
      tax,
      total
    });

    await order.save();

    // Empty cart
    cart.items = [];
    await cart.save();
 req.flash("success", "Order placed successfully!");
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error placing order!");
  }
}));

// ---------------------- DELETE ORDER ----------------------
router.delete("/orders/:id", isAuthenticated, async (req, res) => {
  try {
    const orderId = req.params.id;

    const deletedOrder = await Order.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).send("Order not found");
    }

    // Optional: You could also check if the order belongs to the user
    // if (deletedOrder.user.toString() !== req.user._id.toString()) {
    //   return res.status(403).send("Not authorized to delete this order");
    // }

    res.redirect("/dashboard");
     req.flash("success", "Order deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting order");
        req.flash("error", "Error deleting order");
  }
});


// ---------------------- DELETE MENU ----------------------
router.delete("/menus/:id", isAuthenticated, wrapAsync(async (req, res) => {
  try {
    const menuId = req.params.id;

    const deletedMenu = await Menu.findByIdAndDelete(menuId);
    if (!deletedMenu) {
      return res.status(404).send("Menu not found");
    }

    res.redirect("/dashboard");
     req.flash("success", " Menu deleted successfully");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting menu");
  }
}));

// ---------------------- ADD MENU PAGE ----------------------
router.get("/menus/add",  (req, res) => {
  res.render("pages/add-menu");
});

// ---------------------- ADD MENU POST ----------------------
router.post("/menus/add", wrapAsync( async (req, res) => {
  try {
    const { name, price, description, image } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).send("Name and price are required");
    }

    const newMenu = new Menu({ name, price, description, image });
    await newMenu.save();
 req.flash("success", "Menu added successfully");
    res.redirect("/dashboard");
  } catch (err) {
    console.error("Error adding menu:", err);
    res.status(500).send("Error adding menu");
  }
}));

module.exports = router;
