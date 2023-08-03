require("dotenv").config();
const mongoose = require("mongoose");
const apartmentSchema = require("./models");
const { customResponse, customPagination, genPassword, configureMail, shootMails, genText } = require("../../utilities/helper");
const userModel = require("../users/model")

const addApartment = async (req, res) => {
    try {
        const data = await new apartmentSchema({
            ...req?.body
        }).save();
        code = constants.HTTP_201_CODE;
        message = constants.USER_REGISTER_SUCCESS_MSG;
        // data = newUser;
        success = true;
        const resData = customResponse({ code, message, data, success });
        return res.send(resData);
    } catch (error) {
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

const getAllApartment = async (req, res) => { 
    const { approved, areaManager } = req.query; 
    try {
        let query = {};
        if(req.query?.approved) {
            query.approved = approved;
        }
        if (areaManager) {
            query.areaManager = areaManager;
        }

        const data = await apartmentSchema.find(query);
        code = constants.HTTP_201_CODE;
        message = "fetched data successfully";
        const resData = customResponse({ code, message, data });
        return res.send(resData);
    } catch (error) {
        console.log(error)
        code = constants.HTTP_400_CODE;
        message = constants.SOMETHING_WRONG_MSG;
        const resData = customResponse({
            code,
            message,
            err: error.message,
        });
        return res.send(resData);
    }
}

const getAppartment = async (req, res) => {
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
        const apartment = await apartmentSchema.findById(_id);
        if (!apartment) {
            throw {
                message: constants.MESSAGE_APARTMENT.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }
        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_APARTMENT.FETCH;
        const resData = customResponse({
            code,
            message,
            data: apartment,
        });
        return res.status(code).send(resData);
    } catch (error) {
        console.error("Error in get appartement endpoint", error);
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

const assignAreaManager = async (req, res) => {
    try {
        if (req?.decodedUser?.roles.includes("Super_Admin") || req?.decodedUser?.roles.includes("Operations_Manager")) {
            const user = await userModel.findOne({
                _id: req.body?.areaManager,
                roles: { $elemMatch: { $eq: 'Area_Manager' } }
            });
            if(!user) {
                throw {
                    message: constants.AREA_MANAGER_NOT_FOUND,
                    code: constants.HTTP_404_CODE,
                };
            }
            const data = await apartmentSchema.findOneAndUpdate(
                { _id: req.params.id },
                { $set: { areaManager: req?.body?.areaManager, requestedby: req?.body?.requestedby, approved: true } },
                { new: true }
            );

            code = 200;
            message = "data updated successfully";
            const resData = customResponse({
                code,
                data: data,
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
        console.error("Error in update approveApartment endpoint", error);
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

module.exports = { getAllApartment, addApartment, getAppartment, assignAreaManager }