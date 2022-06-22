const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {encryptPassword, comparePassword} = require("../utilities/utils")

const adminUserSchema = Schema({
  full_name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  encryptedPassword: {
    type: String,
    require: true,
  },
});

// encrypt the password before storing
adminUserSchema.methods.encryptPassword = (password) => {
  return encryptPassword(password);
};

adminUserSchema.methods.validPassword = function (candidatePassword) {
  return comparePassword(candidatePassword, this.encryptedPassword);
};

adminUserSchema.methods.toJSON = function () {
  const admin_user = this;
  return admin_user.toObject();
};

module.exports = mongoose.model("admin_user", adminUserSchema);
