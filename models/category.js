const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const categorySchema = Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    slug: "title",
  },
});

categorySchema.methods.toJSON = function () {
  const category = this;
  return category.toObject();
};

module.exports = mongoose.model("Category", categorySchema);
