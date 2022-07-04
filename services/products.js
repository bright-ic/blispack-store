const _ = require('lodash');
const BaseService = require("../services/base-service");
const Product = require("../models/product");
const { empty, isObject, uniqid } = require('../utilities/utils');
const {error_messages} = require("../utilities/constants");

class ProductService extends BaseService {

    static async getRandomProducts(limit=10) {
        let products = []
        try {
            limit == _.isInteger(limit) && limit > 0 ? limit : 10;
            const count = await Product.countDocuments({});
            let random = Math.floor(Math.random() * count);
            if(count < (random + limit)) {
                random = count - limit;
            }
            random = random < 10 ? 0 : random;
            products = await Product.find()
              .sort("-createdAt")
              .skip(random)
              .limit(limit)
              .populate("category");
        } catch(e) { }
        return BaseService.sendSuccessResponse(products);
    }
}

module.exports = ProductService;