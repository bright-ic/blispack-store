const _ = require('lodash');
const BaseService = require("../services/base-service");
const PaymentProcessor = require("./paymentProcessor");
const Cart = require("../models/cart");
const Order = require("../models/order");
const { empty, isObject, uniqid } = require('../utilities/utils');
const {error_messages} = require("../utilities/constants");

class checkoutService extends BaseService {

    async chargeCustomer(req, user={}) {
        try {
            const post_data = req.body;
            if(empty(post_data) || !isObject(post_data)) {
                return BaseService.sendFailedResponse('Invalid request data')
            }
            if(empty(post_data.stripeToken)) {
                return BaseService.sendFailedResponse('No payment data was sent')
            }
            // const cart = await Cart.findById(req.session.cart._id);
            const {total_charge, total_qty, product_ids, cart} = await checkoutService.getTotalCharge(req.session.cart._id);
            if(empty(total_charge) || total_charge < 1 && !_.isFinite(total_charge)) {
                return BaseService.sendFailedResponse("Charge amount must be a number greater than zero (0)");
            }
            const payment_record = {product_ids};
            payment_record.cart = {
                totalQty: total_qty? total_qty : (cart && cart.totalQty ? cart.totalQty : 1),
                totalCost: total_charge,
                items: cart && cart.items ? cart.items : [],
            }
            payment_record.user = user;
            payment_record.address = post_data.address ? post_data.address : '';
            payment_record.paymentId = '';
            payment_record.status = 'INIT-CHARGE';
            payment_record.reference = uniqid('REF');
            const order = new Order(payment_record);

            const cart_id = req.session.cart._id;
            const order_id = "";
            const description = "Payment for product"+(user && user.email?" by "+user.email:"");
            const payment_payload = {
                amount: total_charge,
                currency: "usd",
                source: post_data.stripeToken,
                description: description,
                metadata: {
                    user_id: user && user._id ? _.toString(user._id) : '',
                    reference: payment_record.reference,
                    transaction_type: 'product purchase',
                    product_ids: _.isArray(product_ids) ? product_ids.join(',') : ''
                }
            };
            const paymentProcessor = new PaymentProcessor();
            const payment_response = await paymentProcessor.pay(payment_payload);
            console.log(payment_response)
            if(!payment_response || !payment_response.success) {
                return BaseService.sendFailedResponse(payment_response && payment_response.data ? payment_response.data : "Failed to complete transaction due to an unexpected error.");
            }
            const transaction_result = payment_response.data;
            let transaction_id = '';
            if(_.has(transaction_result, 'id') && _.has(transaction_result, 'paid') && transaction_result.paid) {
                transaction_id = transaction_result.id;
                order.status = transaction_result.status ? _.toUpper(transaction_result.status) : 'PENDING';
                order.receipt_url = transaction_result.receipt_url ? transaction_result.receipt_url : '';
                order.paid = transaction_result.paid;
                order.description = transaction_result.description ? transaction_result.description : '';
                order.currency= transaction_result.currency ? transaction_result.currency : '';
                order.customer_id = transaction_result.customer ? transaction_result.customer : '';
                order.transaction_id = transaction_result.id;
                order.issuer = "stripe";
                order.paymentId = transaction_id;
            }
            if(transaction_id === "" || !transaction_id) {
                return BaseService.sendFailedResponse('An error occurred processing your payment. Please check your billing information and try again later.');
            }
            let success = false;
            try {
                await order.save();
                success = true;
            } catch(e) {
                console.log(e);
            }
            try {
                const cart_doc = await Cart.findById({_id: cart_id});
                await Cart.deleteOne({_id: cart_doc._id});
            } catch(e) {
                console.log(e);
            }

            if(!success) {
                return BaseService.sendFailedResponse( 'Something went wrong while trying to process your payment. If you were charged, please contact us for assistance.')
            }
            return BaseService.sendSuccessResponse(order);
        } catch(e) {
            console.log(e)
            return BaseService.sendFailedResponse(error_messages.server_error._server_error);
        }
    }

    static async getTotalCharge(cart_id) {
        const return_data = {};
        const cart = await Cart.findById(cart_id);
        if(cart && cart._id) {
            return_data.total_charge = 0;
            return_data.total_qty = 0;
            return_data.product_ids = [];
            return_data.cart = cart;
            if(cart.items && _.isArray(cart.items) && !empty(cart.items)) {
                _.each(cart.items, (product, idx) => {
                    if(isObject(product) && product.price) {
                        return_data.total_charge += parseFloat(product.price);
                        if(product.qty) {
                            return_data.total_qty += parseInt(product.qty, 10);
                        }
                        if(product.productId) {
                            return_data.product_ids.push(_.toString(product.productId))
                        }
                    }
                })
            }
        }
        return return_data;
    }
}

module.exports = checkoutService;