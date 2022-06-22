const mongoose = require("mongoose");
// const bcrypt = require("bcrypt-nodejs");
const {encryptPassword, comparePassword} = require("../utilities/utils")
const Schema = mongoose.Schema;

const userSchema = Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  can_purchase: {
    type: String,
    require: false,
    default: 'No',
  },
});

// encrypt the password before storing
userSchema.methods.encryptPassword = (password) => {
  return encryptPassword(password);
};

userSchema.methods.validPassword = function (candidatePassword) {
  return comparePassword(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const user = this;
  return user.toObject();
};

module.exports = mongoose.model("User", userSchema);
