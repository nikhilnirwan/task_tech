const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const { myCustomLabels } = require("../helpers/common");
const Schema = mongoose.Schema;

mongoosePaginate.paginate.options = {
  customLabels: myCustomLabels,
};
const productModel = new Schema({
  name: {
    type: String,
    required: true,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  desc: {
    type: String,
    required: true,
  },
  images: [
    {
      filename: String,
      path: String,
    },
  ],
  userId: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
});

productModel.plugin(mongoosePaginate);

const Product = mongoose.model("Product", productModel);
module.exports = Product;
