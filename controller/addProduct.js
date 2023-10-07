const catchAsync = require("../utils/catchAsync");
const Product = require("../model/productModel");
const multer = require("multer");
const csv = require("csv-parser");
const fs = require("fs");
const util = require("../utils/message");

// multer diskStorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./upload");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

exports.upload = multer({ storage: storage });

// upload product images
exports.uploadImage = catchAsync(async (req, res, next) => {
  const file = req.files;
  const { id } = req.query;

  if (!file) {
    message = "No file uploaded.";
    return util.failureResponse(message, res);
  }
  const images = Promise.all(
    file.map(async (item) => {
      return {
        filename: item?.filename,
        path: item?.path,
      };
    })
  );
  await Product.findByIdAndUpdate({ _id: id }, { $addToSet: { images: await images } }, { upsert: true, new: true });

  res.message = "File uploaded successfully.";
  return util.successResponse([], res);
});

// Insert CSV file data into MongoDB
async function insertCSVData(user, filePath) {
  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", async (data) => {
        const prodObj = {
          name: data?.name,
          sku: data?.sku,
          desc: data?.desc,
          userId: user?._id,
          images: { path: data.image },
        };
        await Product.create(prodObj);
      })
      .on("end", () => {});
  } catch (error) {
    console.error("Error insertCSVData", error);
  }
}

// upload CSV file data
exports.uploadCsvData = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (!req.file) {
    const message = "No file uploaded.";
    return util.failureResponse(message, res);
  }
  await insertCSVData(user, req.file.path);
  res.message = "Data inserted successfully.";
  return util.successResponse([], res);
});

// add product
exports.addProduct = catchAsync(async (req, res, next) => {
  const { name, desc, sku } = req.body;
  const user = req.user;

  const data = await Product.findOne({ sku: sku });
  if (data) {
    res.message = "Product already exists.";
    return util.documentExits(data, res);
  }
  const product = await Product.create({
    name: name,
    desc: desc,
    userId: user._id,
    sku: sku,
  });

  res.message = "Product create successfully";
  return util.successResponse(product, res);
});

// if user not create this product so user get unauthorized message.
exports.getProduct = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const user = req.user;
  const getProduct = await Product.findOne({ _id: id, userId: user._id });

  if (!getProduct) {
    const message = "You are not authorized.";
    return util.unAuthorizedRequest(message, res);
  }
  res.message = "Product get Successfully.";
  return util.successResponse(getProduct, res);
});

// get product using pegination
exports.getAllProduct = catchAsync(async (req, res, next) => {
  const getProducts = await Product.paginate(req.body.query, req.body.options);

  if (!getProducts?.data?.length) {
    res.message = "Product not found.";
    return util.recordNotFound(res);
  }
  res.message = "Product get Successfully.";
  return util.successResponse(getProducts.data, res);
});

// update product only authorized user.
exports.updateProduct = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const user = req.user;

  const prod = await Product.findOne({ _id: id, userId: user._id });

  if (!prod) {
    const message = "You are not authorized.";
    return util.unAuthorizedRequest(message, res);
  }
  await Product.findByIdAndUpdate({ _id: id }, { ...req.body }, { upsert: true, new: true });

  res.message = "Product Update Successfully.";
  return util.successResponse([], res);
});

// delete product only authorized user.
exports.deleteProduct = catchAsync(async (req, res, next) => {
  const { id } = req.query;
  const user = req.user;

  const prod = await Product.findOne({ _id: id, userId: user._id });

  if (!prod) {
    const message = "You are not authorized.";
    return util.unAuthorizedRequest(message, res);
  }
  await Product.deleteOne({ _id: id, userId: user._id });
  res.message = "Product delete Successfully.";
  return util.successResponse([], res);
});
