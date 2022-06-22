const _ = require("lodash");
const BaseController = require("./base");
const Cart = require("../models/cart");
const CheckoutService = require('../services/checkout');


class CheckoutController extends BaseController {

    async indexAction(req, res) {
        let errorMsg = req.flash("error")[0];
        try {
            if (!req.session.cart) {
                return res.redirect("/shopping-cart");
            }

            if(_.toUpper(req.method) === "POST") {
                const checkout = new CheckoutService();
                const result = await checkout.chargeCustomer(req, req.user);
                if(!result.success) {
                    errorMsg = result.data ? result.data : 'Sorry could not process your payment due to something that went wrong'
                } else {
                    req.flash("success", "Your order has been placed successfully");
                    req.session.cart = null;
                    res.redirect("/user/profile");
                    return;
                }

            }
            //load the cart with the session's cart's id from the db
            let cart = await Cart.findById(req.session.cart._id);

            res.render("shop/checkout", this.setTemplateParameters(req, {
                total: cart ? cart.totalCost : 0,
                csrfToken: req.csrfToken(),
                errorMsg,
                pageName: "Checkout",
                selected_page: 'checkout',
            }))
        } catch(e) {
            console.log(e)
            res.redirect("/")
        }
    }
}

module.exports = CheckoutController;