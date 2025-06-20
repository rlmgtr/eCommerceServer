const express = require('express');
const router = express.Router();
const isLoggedin = require('../../middleware/isLoggedin');
const isVerified = require('../../middleware/isVerified');
const CustBasket = require('../../models/basketModel');
const Product = require('../../models/productModel');

router.put('/', isLoggedin, isVerified, async (req, res) => {
  const { productId, newOrderQuantity } = req.body;

  // Check for valid input
  if (!productId || typeof newOrderQuantity !== 'number' || newOrderQuantity <= 0) {
    return res.status(400).json({ message: "Invalid order update." });
  }

  
  const basket = await CustBasket.findOne({ userId: req.user._id });

  if (!basket) {
    return res.status(404).json({ message: "Basket not found" });
  }

  // Find the item in the basket
  const item = basket.basket.find(item => item.productId === productId);

  if (!item) {
    return res.status(404).json({ message: "Item not found in the basket" });
  }

  // Update quantity and total order price
  item.orderQuantity = newOrderQuantity;
  item.totalOrderPrice = item.orderPrice * newOrderQuantity;

  // Fix: Use totalPrice (not totalOrderPrice) and proper reduce logic
  basket.totalPrice = basket.basket.reduce(
    (total, item) => total + item.totalOrderPrice,
    basket.deliveryCharge
  );

  await basket.save();

  res.status(200).json({
    message: "Your orders have been updated successfully",
    basket
  });
});

module.exports = router;
