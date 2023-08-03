require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("./model");
const Client = require("../clientUser/model");
const constants = require("../../utilities/constants");
const { customResponse, customPagination } = require("../../utilities/helper");
const { deleteCache, hashSet, hashGetAll } = require("../../utilities/cache");
const otpModel = require("../users/otpmodel");
const { sendEmail } = require("../../utilities/email");

// To register/add user
//For registration

const registerUser = async (req, res) => {
  try {
      const userData = await userModel.findOne({ email: req.body?.email});
      if(userData) {
        throw {
          message: constants.USER_EXIST_WITH_EMAIL,
          code: constants.HTTP_401_CODE,
        };
      }
      const data = await new userModel({
        ...req?.body,
      })

      await data.save();
      code = constants.HTTP_201_CODE;
      message = constants.USER_REGISTER_SUCCESS_MSG;

      success = true;
      const resData = customResponse({ code, message, data, success });
      return res.send(resData);
  } catch (error) {
    console.log(error)
    code = error?.code ? error.code : constants.HTTP_400_CODE;
    message = error?.message ? error.message : constants.SOMETHING_WRONG_MSG;
    const resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.send(resData);

  }
}

// login
const login = async (req, res) => {
  /* 	
      #swagger.tags = ['User']
  */
  let code, message, data;
  let success = false;
  try {
    const phoneNumber = req?.body?.phoneNumber;
    const email = req?.body?.email;
    const password = req?.body?.password;
    const whatsappNumber = req?.body?.whatsappNumber
    const deviceToken = req?.body?.deviceToken;
    const userDoc = await userModel.findOne({
      $or: [{ phoneNumber: phoneNumber }, { whatsappNumber: whatsappNumber }, { email: email }],
    });
    if (!userDoc) {
      code = constants.HTTP_401_CODE;
      message = "Invalid Credentials";
      success = false;
      const resData = customResponse({
        code,
        message,
        success,
      });
      return res.send(resData);
    }
    const isMatch = await bcrypt.compare(password, userDoc.password);
    const accessToken = await userDoc.generateAuthAccessToken();
    const refreshToken = await userDoc.generateAuthrefreshToken();
    const webDeviceToken = await userDoc.generateWebToken(deviceToken);
    data = {
      phoneNumber: req.body.phoneNumber,
      tokens: { accessToken: accessToken, refreshToken: refreshToken },
    };
    if (isMatch) {
      code = constants.HTTP_201_CODE;
      message = constants.LOGIN_SUCCESS;
      data = userDoc;
      const cachedData = {
        Name: userDoc.Name,
        phoneNumber: userDoc.phoneNumber,
        email: userDoc.email,
        whatsappNumber: userDoc.whatsappNumber,
        roles: userDoc.roles
      };
      // setting hash cache
      hashSet(userDoc._id.toString(), cachedData);
      const resData = customResponse({ code, message, data });
      return res.status(code).send(resData);
    } else {
      code = constants.HTTP_400_CODE;
      message = "Invalid Credentials";
      const resData = customResponse({
        code,
        message,
      });
      return res.send(resData);
    }
  } catch (error) {
    console.log("error in post login endpoint", error);
    code = constants.HTTP_400_CODE;
    message = constants.SOMETHING_WRONG_MSG;
    const resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.status(code).send(resData);
  }
};

const getAllUsers = async (req, res) => {
  /* 	
      #swagger.tags = ['User']
  */
  let code, message, data, page, limit;
  let {role, address} = req.query;
  try {
    query = {};

    if (role) {
      const isPresent = constants.roles.includes(role);
      if(!isPresent) {
        throw {
          message: constants.ROLE_NOT_EXISTS,
          code: constants.HTTP_400_CODE,
        };
      }
      query.roles = { $in: role };
    }

    if (address) {
      query.$or = [
        { contactAdd: address },
        { permanentAdd: address },
      ];
    }

    const users = await userModel.find(query);
    page = req.query.page ? req.query.page : 1;
    limit = req.query.limit ? req.query.limit : 15;
    code = constants.HTTP_200_CODE;
    message = constants.STATUS_SUCCESS;
    data = customPagination({ data: users, page, limit });

    const resData = customResponse({ code, message, data });
    return res.status(code).send(resData);
  } catch (error) {
    console.log("error in get all users endpoint", error);
    code = constants.HTTP_400_CODE;
    message = constants.STATUS_FAILURE;
    const resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.status(code).send(resData);
  }
};

const logout = async (req, res) => {
  /* 	
      #swagger.tags = ['User']
  */
  try {
    let code, message;
    // Deleting the cache before loggin out the user
    await deleteCache(req.decodedUser.user_id.toString());
    await userModel
      .findOneAndUpdate(
        {
          $or: [{
            email: req.decodedUser.email,
          }, { whatsappNumber: req.decodedUser.whatsappNumber }, { phoneNumber: req?.decoded?.phoneNumber }]
        }
        ,
        { tokens: {}, webNotificationToken: [] },
        { new: true }
      )
      .then(() => {
        code = constants.HTTP_200_CODE;
        message = constants.USER_LOGOUT_MSG;
        const resData = customResponse({ code, message });
        return res.status(code).send(resData);
      });
  } catch (error) {
    console.log("error in logout endpoint", error);
    code = constants.HTTP_400_CODE;
    message = error.message;
    const resData = customResponse({ code, message, error: error.errors });
    res.status(code).send(resData);
  }
};

const otpGenerate = async (req, res) => {
  let code, message;
  const { email } = req.body;
  try {
    let findUser = await userModel.findOne({ email });

    if (!findUser) {
      findUser = await Client.findOne({ email });
      if(!findUser) {
        throw {
          message: constants.USER_NOT_FOUND,
          code: constants.HTTP_404_CODE,
        };
      }
    }

    // Delete existing OTP data for the email if it exists
    const existingOTP = await otpModel.findOne({
      email: findUser?.email,
    });

    if (existingOTP) {
      await otpModel.deleteOne({ email: findUser?.email });
    }

    const otpCode = generateNumericOTP(6);
    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(otpCode, salt);
    const otpData = await new otpModel({
      email: findUser?.email,
      otp: hashedOtp,
      expiresIn: new Date().getTime() + 300 * 1000, // expires in 5 min
    }).save();

    const mailOptions = {
      from: process.env.EMAIL_USER, // Sender address
      to: findUser?.email, // List of recipients
      subject: `OTP for login`, // Subject line
      text: `Your otp for ${process.env.APP_NAME} Account login is ${otpCode}`, // Plain text body
    };
    emailRes = await sendEmail(mailOptions);  
    console.log(mailOptions);

    if (!emailRes) {
      throw {
        message: constants.emailStatus,
        code: constants.HTTP_404_CODE,
      };
    }

    code = constants.HTTP_201_CODE;
    message = constants.MESSAGE_OTP.CREATE;
    resData = customResponse({ code, message, data: otpData });
    return res.status(code).send(resData);
  } catch (error) {
    console.log("error in post otpGenerate endpoint", error);
    code = error?.code ? error.code : constants.HTTP_500_CODE;
    message = error?.message ? error.message : constants.SERVER_ERR;
    resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.status(code).send(resData);
  }
};

const newlogin = async (req, res) => {
  /* 	
      #swagger.tags = ['User']
  */
  let code, message, data;
  let success = false;
  try {
    const email = req?.body?.email;
    const otp = req?.body?.otp;
    const deviceToken = req?.body?.deviceToken;
    const userDoc = await userModel.findOne({ email });

    if (!userDoc) {
      code = constants.HTTP_401_CODE;
      message = "Invalid Credentials";
      success = false;
      const resData = customResponse({
        code,
        message,
        success,
      });
      return res.send(resData);
    }

    const otpData = await otpModel.findOne({ email: email });
    let isMatch = false;
    if(otpData) {
      isMatch = await bcrypt.compare(otp, otpData?.otp);
    }
  
    if (!otpData || !isMatch) {
      throw {
        message: constants.MESSAGE_OTP.INVALID_OTP,
        code: constants.HTTP_403_CODE,
      };
    }

    let currtime = new Date().getTime();
    let diff = otpData?.expiresIn - currtime;

    if (diff < 0) {
      throw {
        message: constants.MESSAGE_OTP.OTP_EXPIRED,
        code: constants.HTTP_403_CODE,
      };
    }

    const accessToken = await userDoc.generateAuthAccessToken();
    const refreshToken = await userDoc.generateAuthrefreshToken();
    const webDeviceToken = await userDoc.generateWebToken(deviceToken);
    data = {
      phoneNumber: req.body.phoneNumber,
      tokens: { accessToken: accessToken, refreshToken: refreshToken },
    };
    if (isMatch) {
      code = constants.HTTP_201_CODE;
      message = constants.LOGIN_SUCCESS;
      data = userDoc;
      const cachedData = {
        Name: userDoc.Name,
        phoneNumber: userDoc.phoneNumber,
        email: userDoc.email,
        whatsappNumber: userDoc.whatsappNumber,
        roles: userDoc.roles
      };
      await otpModel.findOneAndDelete({
        email: email,
      });
      // setting hash cache
      hashSet(userDoc._id.toString(), cachedData);
      const resData = customResponse({ code, message, data });
      return res.status(code).send(resData);
    } else {
      code = constants.HTTP_400_CODE;
      message = "Invalid Credentials";
      const resData = customResponse({
        code,
        message,
      });
      return res.send(resData);
    }
  } catch (error) {
    console.log("error in post login endpoint", error);
    code = error?.code ? error.code : constants.HTTP_500_CODE;
    message = error?.message ? error.message : constants.SERVER_ERR;
    resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.status(code).send(resData);
  }
};

function generateNumericOTP(length) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = {
  logout,
  registerUser,
  getAllUsers,
  otpGenerate,
  newlogin
};
