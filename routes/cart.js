const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const { isLoggedIn } = require('../middlewares'); // middleware for login check
const cart = require('../models/cart');

// Add to cart
// Add to cart
router.post("/add-to-cart/:id", isLoggedIn, async (req, res) => {
    if(req.user.isAdmin) return res.redirect("/"); // Admin ke liye cart disable

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

// Show cart
router.get("/cart", isLoggedIn, async (req, res) => {
    if(req.user.isAdmin) return res.redirect("/"); // Admin ke liye cart disable

    const userId = req.user._id;
    const cart = await Cart.findOne({ user: userId }).populate("items.productId");

    res.render("pages/cart", { cart: cart ? cart.items : [] });
});

router.post("/cart/increase/:id", async (req, res) => {
  try {
    const productId = req.params.id;   // 👈 ab sahi hoga
    const userId = req.user._id;

    // User ka cart find karo
    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check karo item pehle se cart me hai ya nahi
    const checkItem = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (checkItem > -1) {
      // Agar hai to quantity badhao
      cart.items[checkItem].quantity += 1;
    } else {
      // Agar nahi hai to naya item push karo
      cart.items.push({ productId, quantity: 1 });
    }

    // Save karo cart
    await cart.save();
    res.redirect("/cart");

  } catch (err) {
    console.error("Increase Cart Error:", err);
    res.status(500).send("Something went wrong!");
  }
});
router.post("/cart/decrease/:id",async(req,res)=>{
    const productId = req.params.id;
    const userId = req.user._id;
    let cart = await Cart.findOne({user:userId})
    if(!cart){
        cart=new Cart({
            user:userId,
            items:[]
        })
    } else{
        const ckeckItem = cart.items.findIndex(
            item => item.productId.toString() === productId
        );
        if(ckeckItem > -1){
            if(cart.items[ckeckItem].quantity > 1){
                cart.items[ckeckItem].quantity -= 1;
            } else {
                cart.items.splice(ckeckItem, 1); // Agar quantity 1 se kam ho jaye to item ko remove karo
            }
        } else {
            return res.status(404).send("Item not found in cart");
        } 
    }
    await cart.save();
    res.redirect("/cart");
})
// DELETE route for removing an item from cart
router.delete("/cart/remove/:id",isLoggedIn, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user._id; // maan lo authentication hai

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.redirect("/cart");
    }

    // filter out the item
    cart.items = cart.items.filter(item => item._id.toString() !== itemId);

    await cart.save();
      req.flash("success", "Item removed from cart successfully!");
    res.redirect("/cart"); // redirect back to cart
  } catch (err) {
    console.error(err);
    req.flash("error", "Error removing item from cart");
    res.redirect("/cart");
  }
});
router.get("/checkout", isLoggedIn, async (req, res) => {
  try {
    // Cart ko user ke liye fetch karo aur product details populate karo
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.productId");

    // Agar cart exist karta hai to poora object bhejo, nahi to empty items array
    res.render("pages/checkout", { cart: cart || { items: [] } });
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong!");
  }
});


module.exports = router;
