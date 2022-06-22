const _ = require('lodash');
const BaseService = require("../services/base-service");
const StripeService = require("./stripe-service");
const { empty, isObject } = require('../utilities/utils');
const {supported_payment_gateways} = require('../utilities/constants')

class PaymentProcessorService extends BaseService {

    constructor(payment_gateway = 'stripe') {
        super();
        this.gateway = _.isString(payment_gateway) && !empty(payment_gateway) ? payment_gateway : 'stripe';
    }

    async pay(payment_payload) {
        if(!_.includes(PaymentProcessorService.getSupportedPaymentGateways(), this.gateway)) {
            BaseService.sendFailedResponse({gateway: 'Unsupported payment gateway "'+this.gateway+'"'})
        }
        let charge;
        switch(this.gateway) {
            case supported_payment_gateways.stripe.name:
                const stripeService = new StripeService();
                charge = await stripeService.charge(payment_payload);
        }


        if(!charge || !charge.success) {
            return BaseService.sendFailedResponse(charge && charge.data ? charge.data : "Failed to complete transaction due to an unexpected error.");
        }
        return BaseService.sendSuccessResponse(charge.data);
    }

    static getSupportedPaymentGateways() {
        let supported_gateways = [];
        if(!empty(supported_payment_gateways) && isObject(supported_payment_gateways)) {
            _.each(supported_gateways, (gateway) => {
                if(gateway && _.has(gateway, 'name') && !empty(gateway.name)) {
                    supported_gateways.push(gateway.name);
                }
            })
        }
        return supported_gateways;
    }
}

module.exports = PaymentProcessorService;