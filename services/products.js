const _ = require('lodash');
const BaseService = require("../services/base-service");
const Product = require("../models/product");
const ProductCategory = require("../models/category");
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
            random = random < 0 ? 0 : random;
            products = await Product.find()
              .sort("-createdAt")
              .skip(random)
              .limit(limit)
              .populate("category");
        } catch(e) { }
        return BaseService.sendSuccessResponse(products);
    }

    static async getTrendingProductsAndCategory(limit=6) {
        let products = {};
        let categories = [];
        try {
            limit == _.isInteger(limit) && limit > 0 ? limit : 6;
            const count = await ProductCategory.countDocuments({});
            let random = Math.floor(Math.random() * count);
            if(count < (random + limit)) {
                random = count - limit;
            }
            
            random = random < 0 ? 0 : random;
            cat = ProductCategory.find().skip(random).limit(limit).populate("category");
            if(!empty(cat) && _.isArray(cat)) {
                for(let i=0; i < _.size(cat); i++) {
                    let category = cat[i];
                    if(!empty(category) && category._id) {
                        const product = await Product.find({category: category._id}).sort("-createdAt").limit(5);
                        products[_.toString(category._id)] = !empty(product) ? product : [];
                        category.id = _.toString(category._id);
                        categories.push(category);
                    }
                }
            }
        } catch(e) { }
        return BaseService.sendSuccessResponse({products, categories});
    }
}

module.exports = ProductService;