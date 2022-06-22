const AdminBro = require("admin-bro");
const User = require("../../models/user");

const UserResource = {
    resource: User,
    options: {
      parent: {
        name: "User Content",
        icon: "User",
      },
      properties: {
        _id: {
          isVisible: { list: false, filter: true, show: true, edit: false },
        },
        username: {
          isTitle: true,
        },
        password: {
            isVisible: false
        },
        can_purchase: {
            components: {
                edit: AdminBro.bundle('../../components/radio.component.jsx')
            }
        }
      },
    },
}

module.exports = UserResource;