const _ = require("lodash");
const BaseController = require("./base");
const { empty } = require("../utilities/utils");


class PagesController extends BaseController {

    async privacy_policyAction(req, res) {
        try {
            res.render("pages/privacy-policy", this.setTemplateParameters(req, {
                pageName: "privacy-policy",
                selected_page: "privacy-policy",
            }))
        } catch(e) {
            res.redirect("/")
        }
    }

}

module.exports = PagesController;