const BaseService = require("./base-service")
const _ = require('lodash');
const Stripe = require('stripe');
const {error_messages} = require("../utilities/constants");

class StripeService extends BaseService {

    constructor() {
        super();
        this.stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY);
    }

    getStripeInstance() {
        if (this.stripe) {
            return this.stripe;
        }
        return new Stripe(process.env.STRIPE_PRIVATE_KEY);
    }

    /**
     * get customer record saved previously on stripe
     * @param {*} customer_id 
     * @returns 
     */
    async getCustomer(customer_id) {
        try {
            if(!customer_id || !_.isString(customer_id))  return 'Invalid customer id';

            const stripe = this.getStripeInstance();
            const session = await stripe.customers.retrieve(customer_id).catch();
            return _.has(session, 'id') ? session : null;
        } catch(e) {
            return StripeService.humanizeStripeError(e, error_messages.server_error._server_error);
        }
    }

    /**
     * get subscription record saved previously on stripe
     * @param {*} subscription_id string
     * @returns
     */
    async getSubscription(subscription_id) {
        try {
            if (!subscription_id || !_.isString(subscription_id)) {
                return 'Invalid subscription id';
            }

            const stripe = this.getStripeInstance();
            const session = await stripe.subscriptions.retrieve(subscription_id).catch();
            return _.has(session, 'id') ? session : null;
        } catch(e) {
            return StripeService.humanizeStripeError(e, error_messages.server_error._server_error);
        }
    }

    /**
     * Retrieves a customers previously saved payment method
     * @param {*} customer_id 
     * @returns 
     */
    async getCustomerPaymentMethodId(customer_id) {
        if(!customer_id || !_.isString(customer_id))  return null;
        const customer = await this.getCustomer(customer_id);
        if(customer && _.has(customer, "id") && _.has(customer, 'invoice_settings') && _.has(customer.invoice_settings, 'default_payment_method')) {
            return customer.invoice_settings.default_payment_method;
        }
        return null;
    }

    /**
     * Method that tries to charge customer using his saved card on file
     * ! Only use this method if the users card was saved using stripe.charges.create use this method instead chargeCustomerFromCardSavedOn
     * * Use this chargeCustomerFromCardSavedOnFile instead because of the way users card is added to file on the app.
     * @param {*} customer_id 
     * @param {*} payment_payload 
     * @returns 
     */
    async chargeCustomerFromCardSavedOnFileViaCharge(customer_id, payment_payload) {
        try {
            if(!customer_id || !_.isString(customer_id)) {
                return BaseService.sendFailedResponse('Invalid customer id');
            }
            if(!payment_payload || !_.isObject(payment_payload) || _.isArray(payment_payload)) {
                return BaseService.sendFailedResponse("Invalid payment payload supplied. payment payload must be a key/pair object.");
            }
            if(!payment_payload || !_.has(payment_payload, "amount") || !_.isFinite(payment_payload.amount) || parseFloat(payment_payload.amount) <= 0) {
                return BaseService.sendFailedResponse("Missing required/invalid field \"amount\" in payment payload. Amount must be a number greater than 0 (zero)");
            }
            // check if customer record exists
            const customer = await this.getCustomer(customer_id);
            if(!customer || !_.has(customer, "id")) { // customer record does not exist
                return BaseService.sendFailedResponse("Customer record with the supplied id does not exist.")
            }
            // check for saved card on file
            if(!_.has(customer, 'invoice_settings') || !_.has(customer.invoice_settings, 'default_payment_method')) { // no card was found
                return BaseService.sendFailedResponse("No card was found in customer record");
            }

            // go ahead and charge customer
            payment_payload.customer = customer_id;

            return await this.charge(payment_payload);
        } catch(e) {
            return BaseService.sendFailedResponse(StripeService.humanizeStripeError(e, error_messages.server_error._server_error));
        }
    }

    /**
     * Method that tries to charge customer using the saved card on file for selected account
     * * this is the main method to use for charging users with the card saved on file
     * @param {*} customer_id 
     * @param {*} payment_payload 
     * @returns 
     */
     async chargeCustomerFromCardSavedOnFile(customer_id, payment_payload) {
        try {
            if(!customer_id || !_.isString(customer_id)) {
                return BaseService.sendFailedResponse('Invalid customer id');
            }
            if(!payment_payload || !_.isObject(payment_payload) || _.isArray(payment_payload)) {
                return BaseService.sendFailedResponse("Invalid payment payload supplied. payment payload must be a key/pair object.");
            }
            if(!payment_payload || !_.has(payment_payload, "amount") || !_.isFinite(payment_payload.amount) || parseFloat(payment_payload.amount) <= 0) {
                return BaseService.sendFailedResponse("Missing required/invalid field \"amount\" in payment payload. Amount must be a number greater than 0 (zero)");
            }
            // check if customer record exists
            const customer = await this.getCustomer(customer_id);
            if(!customer || !_.has(customer, "id")) { // customer record does not exist
                return BaseService.sendFailedResponse("Customer record with the supplied id does not exist.")
            }
            // check for saved card on file
            if((!_.has(customer, 'invoice_settings') || !_.has(customer.invoice_settings, 'default_payment_method') || !customer.invoice_settings.default_payment_method) && (!_.has(payment_payload, "payment_method") || !payment_payload.payment_method)) { // no card was found
                return BaseService.sendFailedResponse("No card was found in customer record");
            }

            // go ahead and charge customer
            payment_payload.customer = customer_id;
            payment_payload.confirm = true; // try to auto confirm payment intent (ie auto charge user)
            payment_payload.confirmation_method = 'automatic'; // needs to be 'automatic' so that we can auto confirm/charge payment
            if(!_.has(payment_payload, "payment_method") || !payment_payload.payment_method) {
                payment_payload.payment_method = customer.invoice_settings.default_payment_method;
            }

            // since we are charging users via the payment method attached to the customer's record on stripe
            // We have to do that by creating a payment intent and as well confirm (in case it was not auto confirmed) the payment intent.
            const paymentIntent = await this.createPaymentIntent(payment_payload);
            if(!paymentIntent.success) {
                return BaseService.sendFailedResponse(paymentIntent.data);
            }
            if(paymentIntent.data && paymentIntent.data.payment_method && paymentIntent.data.status) {
                let intent = paymentIntent.data;
                let charge;
                // check and try to confirm the payment intent if it was not auto confirmed and next action is confirmation
                if(intent && intent.status === 'requires_confirmation' && _.has(intent, "id") && intent.id) {
                    const stripe = this.getStripeInstance();
                    // To create a PaymentIntent for confirmation
                    const paymentIntentConfirmation = await stripe.paymentIntents.confirm(intent.id, {payment_method: payment_payload.payment_method});
                    if(paymentIntentConfirmation && paymentIntentConfirmation.id) {
                        if(paymentIntentConfirmation.charges && _.has(paymentIntentConfirmation.charges, "data")) {
                            charge = _.isArray(paymentIntentConfirmation.charges.data) ? paymentIntentConfirmation.charges.data[0] : paymentIntentConfirmation.charges.data
                        }
                    }
                } else if(intent && intent.status === "succeeded" && intent.charges && _.has(intent.charges, "data")) {
                    charge = _.isArray(intent.charges.data) ? intent.charges.data[0] : intent.charges.data;
                }

                if(charge && _.has(charge, "id") && charge.paid) {
                    return BaseService.sendSuccessResponse(charge);
                }
            }
            return BaseService.sendFailedResponse("Sorry!, We could not charge you from saved card due to something that went wrong. Try paying using a new card detail.")
        } catch(e) {
            return BaseService.sendFailedResponse(StripeService.humanizeStripeError(e, error_messages.server_error._server_error));
        }
    }

    /**
     * Wrapper around strip payment intent creation
     * * Method wrapped round - stripe.paymentIntents.create
     * @param {*} payment_intent_payload 
     * @returns 
     */
    async createPaymentIntent(payment_intent_payload) {
        try {
            if(!payment_intent_payload || !_.isObject(payment_intent_payload) || _.isArray(payment_intent_payload)) {
                return BaseService.sendFailedResponse("Invalid payment intent payload supplied. Payment intent payload must be a key/pair object.");
            }
            if(!_.has(payment_intent_payload, "amount") || !_.isFinite(payment_intent_payload.amount) || parseFloat(payment_intent_payload.amount) <= 0) {
                return BaseService.sendFailedResponse("Missing required/or invalid field \"amount\" in payment intent payload. Amount must be a number greater than 0 (zero)");
            }

            payment_intent_payload.payment_method_types = _.has(payment_intent_payload, "payment_method_types") ? payment_intent_payload.payment_method_types : ['card'];
            payment_intent_payload.currency = _.has(payment_intent_payload, "currency") && _.isString(payment_intent_payload.currency) ? payment_intent_payload.currency : 'usd';
            payment_intent_payload.amount = parseFloat(payment_intent_payload.amount);

            const stripe = this.getStripeInstance();

            const paymentIntent = await stripe.paymentIntents.create(payment_intent_payload);
            return BaseService.sendSuccessResponse(paymentIntent);

        } catch(e) {
            return BaseService.sendFailedResponse(StripeService.humanizeStripeError(e, error_messages.server_error._server_error));
        }
    }

    /**
     * Wrapper around stripe charges create api call
     * * Method wrapped round - stripe.charges.create
     * @param {*} payment_payload 
     * @returns 
     */
    async charge(payment_payload) {
        try {
            if(!payment_payload || !_.has(payment_payload, "amount") || !_.isFinite(payment_payload.amount) || parseFloat(payment_payload.amount) <= 0) {
                return BaseService.sendFailedResponse("Missing required/invalid field \"amount\" in payment payload. Amount must be a number greater than 0 (zero)");
            }
            if((!_.has(payment_payload, "source") && !payment_payload.source) && (!_.has(payment_payload, "customer") && !payment_payload.customer)) {
                return BaseService.sendFailedResponse("Missing required key \"source\" or \"customer\".")
            }

            payment_payload.currency = _.has(payment_payload, "currency") && _.isString(payment_payload.currency) ? payment_payload.currency : 'usd';
            payment_payload.amount = parseFloat(payment_payload.amount);

            const stripe = this.getStripeInstance();
            const charge = await stripe.charges.create(payment_payload);
            return BaseService.sendSuccessResponse(charge);

        } catch(e) {
            return BaseService.sendFailedResponse(StripeService.humanizeStripeError(e, error_messages.server_error._server_error));
        }
    }

    /**
     * 
     * @param {*} error 
     */
    static humanizeStripeError (error, message_if_not_stripe_error='') {
        try {
            if(!_.isObject(error) || !_.has(error, "type") || error.type.toString().toLowerCase().indexOf("stripe") === -1) {
                return message_if_not_stripe_error;
            }
            if(!_.has(error, "raw") || !_.isObject(error.raw)) {
                return message_if_not_stripe_error;
            }
            const stripe_error = error.raw;
            const custom_stripe_error_messages = StripeService.getStripeCustomCodeErrorMessages();
            if(!_.isEmpty(stripe_error) && !_.isEmpty(custom_stripe_error_messages) && _.isObject(custom_stripe_error_messages)) {
                if(_.has(stripe_error, "decline_code") && custom_stripe_error_messages[stripe_error.decline_code]) {
                    return custom_stripe_error_messages[stripe_error.decline_code];
                } else if(_.has(stripe_error, "code") && custom_stripe_error_messages[stripe_error.code]) {
                    return custom_stripe_error_messages[stripe_error.code];
                } else if(custom_stripe_error_messages.default) {
                   return custom_stripe_error_messages.default;
                }
            }
        } catch(e) {}
        return "Sorry, an unexpected error occurred while trying to communicate with our payment processor."
    }

    /**
     * Get custom defined error messages for strip error codes
     * @returns 
     */
    static getStripeCustomCodeErrorMessages() {
        return ({
            insufficient_funds: "Your card has insufficient funds.",
            card_declined: 'Your card was declined.',
            expired_card: 'Your card has expired.',
            incorrect_cvc: "Your card's security code is incorrect.",
            processing_error: 'An error occurred while processing your card. Try again in a little bit.',
            incorrect_number: "Your card number is incorrect/invalid.",
            missing: 'Sorry! There is no active card saved on file on this account.',
            default: "Sorry, an unexpected error occurred while trying to communicate with our payment processor."
        });
    }
}

module.exports = StripeService