const adminUserModel = require("../../models/admin-user");
const {
    after: passwordAfterHook,
    before: passwordBeforeHook,
  } = require('../../actions/password.hook');

const adminUserResource = {
  resource: adminUserModel,
  options: {
    parent: {
        name: "Admin Content",
        icon: "InventoryManagement",
    },
    properties: {
      _id: {
        isVisible: { list: false, filter: true, show: true, edit: false },
      },
      encryptedPassword: {
        isVisible: false,
      },
      password: {
        type: "password"
      }
    },
    actions: {
        new: {
            after: async (response, request, context) => {
              return passwordAfterHook(response, request, context);
            },
            before: async (request, context) => {
              return passwordBeforeHook(request, context);
            },
        },
        edit: {
            after: async (response, request, context) => {
              return passwordAfterHook(response, request, context);
            },
            before: async (request, context) => {
              return passwordBeforeHook(request, context);
            },
        },
        show: {
            isVisible: false,
        },
    }
  },
}

module.exports = adminUserResource;