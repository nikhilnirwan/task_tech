const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, "..", "config.env") });

const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const AppErr = require("../utils/AppErr");
const encryptPassword = require("../helpers/encryptPassword");
const User = require("../model/userModel");
const util = require("../utils/message");
const { sendMail } = require("../helpers/sendMail");

// create jwt token
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// send responce with jwt
const createSendToken = (user, res) => {
  const payload = `${user}--${user.id}`;

  const token = signToken(payload);

  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; // hide password field from the response of document

  user.token = token;

  return token;
};

// SIGNUP
exports.signup = catchAsync(async (req, res, next) => {
  const { fistName, lastName, DOB, email, password, country } = req.body;

  const userDetail = await User.findOne({ email: email });
  if (userDetail) {
    res.message = "Email already exists.";
    return util.documentExits([], res);
  }

  const hashedPassword = await encryptPassword.hashPassword(password);
  const doc = await User.create({
    fistName: fistName,
    lastName: lastName,
    DOB: DOB,
    password: hashedPassword,
    email: email,
    country: country,
  });

  doc.password = undefined;
  const token = createSendToken(doc, res);

  // email send details
  const emailDetails = {
    fistName: fistName,
    lastName: lastName,
    email: email,
    password: password,
  };

  // if user send register email so set config.env file EMAIL_SEND=true
  if (process.env.EMAIL_SEND) {
    sendMail(emailDetails);
  }

  const user = {
    ...doc._doc,
    token: token,
  };
  res.message = "User successfully register.";
  return util.successResponse(user, res);
});

// LOGIN with id and password
exports.loginWithPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  let doc = await User.findOne({ email: email }).select("+password");
  if (!doc) {
    res.message = "User not found.";
    return util.recordNotFound(res);
  }

  if (!(await encryptPassword.unHashPassword(password, doc.password))) {
    res.message = "Password is incorrect.";
    return util.wrongPassword(res);
  }
  const token = createSendToken(doc, res);
  doc.token = token;
  const user = {
    ...doc._doc,
    token: token,
  };
  res.message = "User successfully login.";
  return util.loginSuccess(user, res);
});

//PROTECT route to cheke user is login or not
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (req?.headers?.authorization && req?.headers?.authorization?.startsWith("Bearer")) {
    token = req?.headers?.authorization?.split(" ")[1];
  } else if (req?.cookies?.jwt) {
    token = req?.cookies?.jwt;
    const cookieToken = req?.cookies?.jwt;
  }
  if (!token) {
    res.message = "You are not logged  in!!! Please log in to get access.";
    return util.badRequest([], res);
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const id = decoded?.id?.split("--")[1];
  if (!id) return next(new AppErr("JWT Malformed"), 401);
  const currentUser = await User.findById(id);

  if (!currentUser) {
    res.message = "The user belonging to this token no longer exists.";
    return util.badRequest([], res);
  }

  req.user = currentUser;
  req.identity = id;
  next();
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email });
  const hashedPassword = await encryptPassword.hashPassword(password);
  user.password = hashedPassword;
  user.passwordChangedAt = Date.now() - 1 * 60 * 100;
  await user.save();

  const token = createSendToken(user, res);
  const userDetail = {
    ...user._doc,
    token: token,
  };

  res.message = "Password reset successfully.";
  return util.successResponse(userDetail, res);
});

// logout
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie("jwt", "loggedOut", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.message = "User successfully logged out.";
  return util.logoutSuccessfull([], res);
});

// get user using regex
exports.getUserProfile = catchAsync(async (req, res, next) => {
  const user = req.user;
  const data = await User.findOne({ _id: user._id });

  res.message = "User successfully get profile.";
  return util.successResponse(data, res);
});

// get user using regex search query
exports.getUserProfileRegex = catchAsync(async (req, res, next) => {
  const search = req.body.search;
  const data = await User.find(search);
  res.message = "Data fetch successfully.";
  return util.successResponse(data, res);
});

// get all user
exports.getAllUser = catchAsync(async (req, res, next) => {
  const data = await User.paginate(req.body.query, req.body.options);
  res.message = "Data fetch successfully.";
  return util.successResponse(data.data, res);
});

// update user profile
exports.updateUser = catchAsync(async (req, res, next) => {
  const user = req.user;
  if (req.body?.password) {
    req.body.password = await encryptPassword.hashPassword(req.body.password);
  }
  const updateDetail = await User.findByIdAndUpdate({ _id: user._id }, { ...req.body }, { upsert: true, new: true });
  res.message = "User details update Successfully.";
  return util.successResponse(updateDetail, res);
});

// delete user
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = req.user;

  await User.deleteOne({ _id: user._id });
  res.message = "User delete successfully.";
  return util.successResponse([], res);
});
