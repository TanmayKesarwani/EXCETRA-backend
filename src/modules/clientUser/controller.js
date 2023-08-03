require("dotenv").config();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../../utilities/db");
const clientUser = require("./model");
const Apartment = require("../apartments/models");
const constants = require("../../utilities/constants");
const otpModel = require("../users/otpmodel");
const mongoose = require("mongoose");
const { customResponse, customPagination} = require("../../utilities/helper");
const { deleteCache, hashSet, hashGetAll } = require("../../utilities/cache");

const registerClient = async (req, res) => {
  const session = await db.startSession();
  session.startTransaction();

  try {
    let apartmentId;
    const { name, phoneNumber, whatsappNumber, email, address } = req.body;

    const clientData = await clientUser.findOne({ email: email });

    if (clientData) {
      throw {
        message: constants.MESSAGE_CLIENT.CLIENT_EMAIL_ALREADY_EXIST,
        code: constants.HTTP_401_CODE,
      };
    }

    if (req.body.apartment) {
      if (typeof req.body.apartment === 'object') {
        const apartmentData = req.body.apartment;
        const apartment = new Apartment(apartmentData); // Use the session for the apartment
        await apartment.save({ session });
        if (!apartment) {
          throw {
            message: constants.SOMETHING_WRONG_MSG,
            code: constants.HTTP_400_CODE,
          };
        }
        apartmentId = apartment._id;
      } else if (typeof req.body.apartment === 'string') {
        apartmentId = req.body.apartment;
      }
    }

    if (!apartmentId) {
      throw {
        message: constants.MESSAGE_CLIENT.CLIENT_APPARTEMENT_NOT_FOUND,
        code: constants.HTTP_400_CODE,
      };
    }

    const client = new clientUser(
      {
        name,
        phoneNumber,
        whatsappNumber,
        email,
        address,
        apartment: apartmentId,
      },
    );

    await client.save({ session });

    await session.commitTransaction();
    session.endSession();

    const code = constants.HTTP_201_CODE;
    const message = constants.USER_REGISTER_SUCCESS_MSG;
    const data = { client };
    const success = true;
    const resData = customResponse({ code, message, data, success });
    return res.send(resData);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error in post client register endpoint", error);
    const code = error?.code ? error.code : constants.HTTP_400_CODE;
    const message = error?.message ? error.message : constants.SOMETHING_WRONG_MSG;
    const resData = customResponse({
      code,
      message,
      err: error.message,
    });
    return res.send(resData);
  }
};

const clientLogin = async (req, res) => {
  /* 	
      #swagger.tags = ['User']
  */
  let code, message, data;
  let success = false;
  try {
    const email = req?.body?.email;
    const otp = req?.body?.otp;
    const deviceToken = req?.body?.deviceToken;
    const client = await clientUser.findOne({email: email});

    if (!client) {
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

    const accessToken = await client.generateAuthAccessToken();
    const refreshToken = await client.generateAuthrefreshToken();
    const webDeviceToken = await client.generateWebToken(deviceToken);
    data = {
      phoneNumber: req.body.phoneNumber,
      tokens: { accessToken: accessToken, refreshToken: refreshToken },
    };
    if (isMatch) {
      code = constants.HTTP_201_CODE;
      message = constants.LOGIN_SUCCESS;
      data = client;
      const cachedData = {
        Name: client.Name,
        phoneNumber: client.phoneNumber,
        email: client.email,
        whatsappNumber: client.whatsappNumber,
        roles: client.roles
      };
      await otpModel.findOneAndDelete({
        email: email,
      });
      // setting hash cache
      hashSet(client._id.toString(), cachedData);
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
    console.log("error in post client login endpoint", error);
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

const clientLogout = async (req, res) => {
    /* 	
        #swagger.tags = ['User']
    */
    try {
        let code, message;
        // Deleting the cache before loggin out the user
        await deleteCache(req.decodedUser.user_id.toString());
        await clientUser
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

const getALLClient = async (req, res) => {
    let code, message, data, page, limit;
    try {
        const users = await clientUser.find({})
        page = req.query.page ? req.query.page : 1;
        limit = req.query.limit ? req.query.limit : 15;
        code = constants.HTTP_200_CODE;
        message = constants.STATUS_SUCCESS;
        data = customPagination({ data: users, page, limit });

        const resData = customResponse({ code, message, data });
        return res.status(code).send(resData);

    } catch (error) {
        console.log("error in get all Clientusers endpoint", error);
        code = constants.HTTP_400_CODE;
        message = constants.STATUS_FAILURE;
        const resData = customResponse({
            code,
            message,
            err: error.message,
        });
        return res.status(code).send(resData);

    }
}

const getClient = async (req, res) => {
    const _id = req.params.id;
    let code, message;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    try {
        if (!isValid) {
            throw {
                message: constants.INVALID_OBJECTID,
                code: constants.HTTP_422_CODE,
            };
        }
        const client = await clientUser.findById(_id);
        if (!client) {
            throw {
                message: constants.MESSAGE_CLIENT.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }
        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_CLIENT.FETCH;
        const resData = customResponse({
            code,
            message,
            data: client,
        });
        return res.status(code).send(resData);
    } catch (error) {
        console.error("Error in get client endpoint", error);
        code = error?.code ? error.code : constants.HTTP_500_CODE;
        message = error?.message ? error.message : constants.SOMETHING_WRONG_MSG;
        const resData = customResponse({
            code,
            message,
            err: error.message,
        });
        return res.send(resData);
    }
}

const assignClientManager = async (req, res) => {
    try {
        if (req?.decodedUser?.roles.includes("Super_Admin") || req?.decodedUser?.roles.includes("Operations_Manager")) {
            const data = await apartmentModel.findOneAndUpdate(
                { _id: req.params.id },
                [{ areaManager: req?.body?.areaManager }, { approved: true }],
                { new: true }
            ).save()
            code = 200;
            message = "data updated successfully";
            const resData = customResponse({
                code,
                data: updateDetails,
                message,
            });
            return res.send(resData);
        }
        else {
            code = 401;
            message = constants.NOT_AUUTH_FOR_ROUTE_MSG;
            const resData = customResponse({
                code,
                data: null,
                message,
            });
            return res.send(resData);
        }
    } catch (error) {
        console.log("error in put approveApartment endpoint", error);
        code = 500;
        message = "Internal server error";
        const resData = customResponse({
            code,
            message,
            err: error,
        });
        return res.send(resData);
    }
}

module.exports = { registerClient, clientLogin, clientLogout, getALLClient, getClient }