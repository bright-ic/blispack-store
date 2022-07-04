const _ = require('lodash');
const { empty, isObject } = require('../utilities/utils');

/**
 * set up base functionality for services
 * Class Base
 * @package Services
 */
class BaseService {
    static collection_name = '';
    static database_name = '';
    model = null;

    constructor(model=null) {
        this.model = model;
    }

    async query(query) {
        try {
            if(this.model) {
                if(_.isUndefined(query)) {
                    return BaseService.sendFailedResponse({id: "Invalid request data"})
                }
                if(_.has(query, "_id") && !empty(query._id) && _.isString(query._id)) {
                    query._id = BaseModel.getMongoObjectId(query._id)
                }
                if(_.has(query, "id") && !empty(query.id) && _.isString(query.id)) {
                    query._id = BaseModel.getMongoObjectId(query.id)
                }
                const return_data = await this.model.findOne(query);
                return BaseService.sendSuccessResponse(return_data);
            }
            return BaseService.sendFailedResponse('No or invalid model');
        } catch(e) {
            return BaseService.sendFailedResponse({_server_error: 'Internal server error occured'});
        }
    }

    /**
     * uniform expectation of failed response data
     * @param data
     * @return mixed
     */
    static sendFailedResponse(data) {
        const returnData = { success: false, data };
        return returnData;
    }

    /**
     * uniform expectation of successful response data
     * @param data
     * @return mixed
     */
    static sendSuccessResponse(data) {
        const returnData = { success: true, data };
        return returnData;
    }

    /**
     * convert string to object id
     * @param id
     * @return {*}
     */
    static getMongoObjectId(id = null) {
        // return BaseModel.getMongoObjectId(id);
    }

    /**
     * convert string to date object
     * @todo complete function
     * @param date
     * @return {*}
     */
    static getMongoDate(date = null) {
        return !empty(date) && _.isString(date) ? new Date(date) : new Date();
    }

    /**
     * check if object id is valid mongo id
     * @param id
     * @return {boolean|*}
     */
    static isValidMongoId(id) {
        try {
            // BaseModel.isValidMongoId(id)
            return true;
        } catch (e) {
            return false;
        }
    }

    static getTime(mongo_date) {
        let secs = "";
        try {   
            mongo_date = new Date(mongo_date).getTime();
            secs = mongo_date / 1000;
        } catch(e) {}
        return secs;
    }

    /**
     * Function to format date
     * @param mongo_date
     * @param format
     * @return {*}
     */
    static getFormattedDate(mongo_date, format = "Y-m-d H:i:s") {
        const secs = BaseService.getTime(mongo_date);
        return date(format, secs);
    }


    /**
     * 
     * @param {*} data 
     * @returns 
     */
    static sanitizeRequestData(data) {
        if (!empty(data)) {
            _.forEach(data, (d, key) => {
                data[key] = BaseService.recursivelySanitize(d);
            })
        }
        return data;
    }

    /**
     * 
     * @param {*} data 
     * @returns 
     */
    static recursivelySanitize(data) {
        if (isObject(data)) {
            _.forEach(data, (d, key) => {
                if (_.isString(d) && _.includes(d, "%") !== false) {
                    data[key] = decodeURI(d);
                }
                if (isObject(d)) {
                    data[key] = BaseService.recursivelySanitize(d);
                }
            });
        } else if (_.isString(data)) {
            data = data.trim();
        }
        return data;
    }

    server_error = {_server_error: "An internal server error occurred"}
    
}

module.exports = BaseService;
