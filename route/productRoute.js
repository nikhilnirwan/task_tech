const express = require("express");
const userAuthController = require("../controller/userAuthController");
const addProductCon = require("../controller/addProduct");
const router = express.Router();

// protect route
router.use(userAuthController.protect);

router.post("/addProduct", addProductCon.addProduct);
router.get("/getProduct", addProductCon.getProduct);
router.get("/getAllProd", addProductCon.getAllProduct);
router.put("/updateProduct", addProductCon.updateProduct);
router.delete("/deleteProduct", addProductCon.deleteProduct);
router.post("/upload", addProductCon.upload.array("images", 4), addProductCon.uploadImage);
router.post("/uploadCsv", addProductCon.upload.single("csvFile"), addProductCon.uploadCsvData);

module.exports = router;
