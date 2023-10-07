const responseStatusCode = require("./responseCode");
const { RESPONSE_CODE } = require("./responseCodeConstant");

exports.unAuthenticated = (res) => {
  return res.status(responseStatusCode.unAuthorized).json({
    code: RESPONSE_CODE.UNAUTHENTICATED,
    message: res.message,
    data: {},
  });
};

exports.successResponse = (data, res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: data,
  });
};

exports.emailSendSuccessfully = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: {},
  });
};

exports.sendEmailFailed = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: {},
  });
};

exports.emailVerifySuccess = (res) => {
  return res.status(responseStatusCode.success).json({
    CODE: RESPONSE_CODE.DEFAULT,
    MESSAGE: res.message,
    data: {},
  });
};

exports.changePasswordResponse = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: {},
  });
};

exports.wrongPassword = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: {},
  });
};

exports.updateProfileResponse = (data, res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: data,
  });
};

exports.failureResponse = (data, res) => {
  let i = 0;
  if (data.name === "ValidationError") {
    Object.keys(data.errors).forEach((key) => {
      if (i !== 1) {
        data.message = data.errors[key].message;
      }
      i++;
    });
  }
  res.message = data.message;
  return res.status(responseStatusCode.validationError).json({
    code: RESPONSE_CODE.ERROR,
    message: data.message ? data.message : data,
  });
};
exports.badRequest = (data, res) => {
  return res.status(responseStatusCode.validationError).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: data,
  });
};
exports.recordNotFound = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: {},
  });
};

exports.notFound = (err, res) => {
  return res.status(responseStatusCode.validationError).json({
    code: RESPONSE_CODE.DEFAULT,
    message: err,
    data: {},
  });
};

exports.unAuthorizedRequest = (message, res) => {
  return res.status(responseStatusCode.unAuthorizedRequest).json({
    code: RESPONSE_CODE.ERROR,
    message: message,
    data: {},
  });
};
exports.loginSuccess = async (result, res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.LOGIN,
    message: res.message,
    data: result,
  });
};

exports.passwordNotSet = (res) => {
  return res.status(responseStatusCode.unAuthorizedRequest).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: {},
  });
};

exports.loginFailed = (error, res) => {
  res.message = error.message;
  return res.status(responseStatusCode.validationError).json({
    code: RESPONSE_CODE.ERROR,
    message: error.message,
    data: {},
  });
};

exports.userNotFound = (res) => {
  return res.status(responseStatusCode.validationError).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: {},
  });
};

exports.logoutSuccessfull = (result, res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: result,
  });
};

exports.changePasswordFailResponse = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.ERROR,
    message: res.message,
    data: {},
  });
};

exports.documentExits = (data, res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.DEFAULT,
    message: res.message,
    data: data ?? [],
  });
};

exports.accountNotVerified = (res) => {
  return res.status(responseStatusCode.success).json({
    code: RESPONSE_CODE.NOT_VERIFIED,
    message: res.message,
  });
};
