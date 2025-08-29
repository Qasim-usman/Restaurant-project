const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const { isLoggedIn } = require('../middlewares');

// ✅ Helper function: agar admin hai to sidha home pe redirect
function blockAdminCart(req, res) {
  if (req.user && req.user.isAdmin) {
    req.flash("error", "Admin cannot use cart.");
    return res.redirect("/");
  }
}

// =============================
// Add to cart
// =============================
router.post("/add-to-cart/:id", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  const productId = req.params.id;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ productId, quantity: 1 }]
    });
  } else {
    const itemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }
  }

  await cart.save();
  req.flash("success", "Item added to cart successfully!");
  res.redirect("/");
});

// =============================
// Show cart
// =============================
router.get("/cart", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  const userId = req.user._id;
  const cart = await Cart.findOne({ user: userId }).populate("items.productId");

  res.render("pages/cart", { cart: cart ? cart.items : [] });
});

// =============================
// Increase quantity
// =============================
router.post("/cart/increase/:id", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  try {
    const productId = req.params.id;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const checkItem = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (checkItem > -1) {
      cart.items[checkItem].quantity += 1;
    } else {
      cart.items.push({ productId, quantity: 1 });
    }

    await cart.save();
    res.redirect("/cart");

  } catch (err) {
    console.error("Increase Cart Error:", err);
    res.status(500).send("Something went wrong!");
  }
});

// =============================
// Decrease quantity
// =============================
router.post("/cart/decrease/:id", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  const productId = req.params.id;
  const userId = req.user._id;

  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    cart = new Cart({ user: userId, items: [] });
  } else {
    const checkItem = cart.items.findIndex(
      item => item.productId.toString() === productId
    );
    if (checkItem > -1) {
      if (cart.items[checkItem].quantity > 1) {
        cart.items[checkItem].quantity -= 1;
      } else {
        cart.items.splice(checkItem, 1);
      }
    } else {
      return res.status(404).send("Item not found in cart");
    }
  }

  await cart.save();
  res.redirect("/cart");
});

// =============================
// Remove item
// =============================
router.delete("/cart/remove/:id", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  try {
    const itemId = req.params.id;
    const userId = req.user._id;

    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.redirect("/cart");

    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
    req.flash("success", "Item removed from cart successfully!");
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    req.flash("error", "Error removing item from cart");
    res.redirect("/cart");
  }
});

// =============================
// Checkout
// =============================
router.get("/checkout", isLoggedIn, async (req, res) => {
  if (req.user.isAdmin) return blockAdminCart(req, res);

  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.productId");
    res.render("pages/checkout", { cart: cart || { items: [] } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
});

module.exports = router;
