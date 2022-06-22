const express = require("express");
const router = express.Router();
const CheckoutController = require("../controllers/checkout")
const middleware = require("../middleware/index");


router.get("/checkout", [middleware.isLoggedIn], async (req, res) => {
    const checkoutController = new CheckoutController(req, res);
    return await checkoutController.indexAction(req, res);
});
router.post("/checkout", [middleware.isLoggedIn], async (req, res) => {
    const checkoutController = new CheckoutController(req, res);
    return await checkoutController.indexAction(req, res);
});

module.exports = router;