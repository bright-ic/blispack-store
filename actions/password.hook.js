const AdminBro = require('admin-bro');
const {encryptPassword, comparePassword} = require("../utilities/utils")

/** @type {AdminBro.After<AdminBro.ActionResponse>} */
const after = async (response) => {
    if (response.record && response.record.errors && response.record.errors.encryptedPassword) {
      response.record.errors.password = response.record.errors.encryptedPassword;
    }
    return response;
};
  
  /** @type {AdminBro.Before} */
const before = async (request) => {
    if (request.method === 'post') {
      const { password, ...otherParams } = request.payload;
  
      if (password) {
        const encryptedPassword = encryptPassword(password);
  
        return {
          ...request,
          payload: {
            ...otherParams,
            encryptedPassword,
          },
        };
      }
    }
    return request;
};
  
module.exports = { after, before };