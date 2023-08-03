const jwt = require("jsonwebtoken");
const userModel = require("../modules/users/model");
const clientModel = require("../modules/clientUser/model")
const constant = require("../utilities/constants");
const { customResponse } = require("../utilities/helper");
const constants = require("../utilities/constants");

const verifyToken = async (req, res, next) => {
  let code, message;
  const authorizationHeaader = req.headers.authorization;
  let result;
  if (authorizationHeaader) {
    const secret = process.env.JWT_SECRET;
    const token = req.headers.authorization.split(" ")[1]; // Bearer <token>
    const options = {
      expiresIn: process.env.EXPIRESIN,
      issuer: process.env.ISSUER,
    };

    try {
      jwt.verify(token, secret, async function (err, decoded) {
        if (err) {
          code = 500;
          message = err.message;
          console.log(message);
          if (err.message === "invalid token") {
            code = 401;
          } else if (err.message === "jwt expired") {
            code = 444;
          }
          const resData = customResponse({
            code,
            message,
            err,
          });
          return res.status(code).send(resData);
        }

        const user = await userModel.findOne({ "tokens.accessToken": token });

        if (!user) {
          const clientUser = await clientModel.findOne({ "tokens.accessToken": token });
          if (!clientUser) {
            code = 401;
            message = constant.TOKEN_INVALID_MSG;
            const resData = customResponse({
              code,
              message,
            });
            return res.status(code).send(resData);
          }
        }
        result = jwt.verify(token, process.env.JWT_SECRET, options);
        req.decodedUser = result;
        next();
      });
    } catch (error) {
      console.log("error in isAuthorization", error);
      code = 401;
      message = constant.TOKEN_INVALID_MSG;
      const resData = customResponse({
        code,
        message,
        err: error,
      });
      return res.status(code).send(resData);
    }
  } else {
    code = constants.HTTP_401_CODE;
    message = constant.AUTHENTICATION_ERR_MSG;
    const resData = customResponse({ code, message });
    return res.status(code).send(resData);
  }
};

const verifyTokenAndAuthorize = (roles = []) => {
  return (req, res, next) => {
    verifyToken(req, res, () => {
      if (typeof roles === "string") {
        roles = [roles];
      }
      if (
        (roles.some((r) => req.decodedUser.roles.includes(r))
        )) {
        next();
      } else {
        res.status(constants.HTTP_403_CODE).json({
          status: constants.HTTP_403_CODE,
          success: false,
          message: constants.FORBIDDEN_MSG,
        });
      }
    });
  };
};

module.exports = {
  verifyToken,
  verifyTokenAndAuthorize,
};
