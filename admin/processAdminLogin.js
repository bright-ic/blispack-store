const adminUserModel = require("../models/admin-user");
const {comparePassword} = require("../utilities/utils")

const ADMIN = {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
};

const signIn = async (email, password) => {
    if(email && password) {
        if (ADMIN.password === password && ADMIN.email === email) {
            return ADMIN;
        } else {
            try {
                const adminUser = await adminUserModel.findOne({email: email});
                if(adminUser && adminUser.encryptedPassword) {
                    if(comparePassword(password, adminUser.encryptedPassword)) {
                        const rt_admin_user = adminUser.toJSON();
                        delete rt_admin_user.encryptedPassword;
                        return rt_admin_user;
                    }
                }
            } catch(e) {}
        }
    }
    return null;
}

module.exports = signIn;