const _ = require("lodash");
const {empty, isObject} = require("../utilities/utils");
const date = require("../utilities/date")

class BaseController {
    user = {}


    /**
     * set datatable search options
     * @var array
     */
     data_table_options = {
        'database': '',
        'collection': '',
        'fields': [],
        'list_fields': [],
        'search_fields': {},
        'criteria': {},
	    'column_names': false
    };

    constructor(req=null, res = null) {
        this.beforeExecuteRoute(req, res);
        this.initialize(req);
        if(req) {
            this.user = this.getSessionUser(req);
        }
        this.database = "";
    }

    initialize() {

    }

    beforeExecuteRoute(req, res) {
        return true
    }

    afterExecuteRoute(req, res) {
        return true
    }

    /**
     * Returns the current user in session
     * @return array
     */
    getSessionUser(req) {
        if(req && req.session && req.session.user) {
            return req.session.user;
        }
        return null;
    }
 

    setUserSession(req, session_data) {
		if (req && req.session && session_data) {
			req.session.user = session_data;
            req.session.session_time = new Date().getTime();
			req.session.save();
		}
	}


    /**
	 * set template data, merge local data with global data
	 * Note: global variable names should start with "_" to avoid duplicate names
	 * @param req
	 * @param localData
	 * @return {{}}
	 */
	setTemplateParameters(req, localData) {
        if (typeof localData === 'undefined') {
            localData = {};
        }
		try {
    
            if(req && req.session && req.session.user) {
                localData.user = req.session.user;
            }
    
            if(!_.has(localData, 'active_route')) {
                localData.active_route = req.path;
            }
            localData.STRIPE_PUBLIC_KEY = process.env.STRIPE_PUBLIC_KEY || "";
    
            localData._ga_tag = process.env.GA_TAG || '';
    
        } catch(e) {}
        return this.render(req, localData);;
	}

    render(req, _obj) {
		const obj = isObject(_obj) ? _obj : {}
		try {
            // Handles flash messages
            // Adds flash messages to object variables
            if (req && _.has(req, 'session') && req.session.flash) {
                let msgObj
                while (msgObj = req.session.flash.shift()) {
                    if (!_.has(obj, '_flash')) {
                        obj._flash = {};
                    }
                    obj._flash[msgObj.type] = msgObj.message
                }
            }

            obj['_routes'] = ALL_ROUTES
            obj['_server_date'] = new Date();
        } catch(e) {}
		return obj
	}

    /**
     * standard fail response object
     * @param res
     * @param errors
     */
    static sendFailResponse(res, data) {
        res.status(400).send({success: false, data});
    }

    /**
     * standard success response object
     * @param res
     * @param data
     */
    static sendSuccessResponse(res, data) {
        res.status(201).send({success: true, data});
    }

    async logoutAction(req, res) {
        try {
            if(req && req.session) {
                try {
                    await this.beforeLogout(req);
                } catch(e) {}
                req.session.destroy();
            }

            this.afterLogout(req).then().catch();
            return res.redirect('/');
        } catch(e) {}
    }

    async beforeLogout(req) {

    }

    async afterLogout(req) {

    }

    static getMongoObjectId(id=null) {
        return !empty(id) && _.isString(id) ? dbo.id(id) : dbo.id();
    }


    static getTime(mongo_date) {
        let secs = "";
        try {   
            mongo_date = new Date(mongo_date).getTime();
            secs = mongo_date / 1000;
        } catch(e) {}
        return secs;
    }

    static isValidMongoId(object) {
        return true;
    }

    static getFormattedDate(mongo_date,format="Y-m-d HH:mm:ss") {
        const secs = BaseController.getTime(mongo_date);
        return date(format, secs);
    }

    static getRegex(value,flag="") {
        try {
            return new RegExp(`${value}`, flag);
        } catch(e) {}
        return value;
    }

}

module.exports = BaseController;