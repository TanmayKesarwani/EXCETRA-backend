const mongoose = require("mongoose");
const { customResponse, customPagination } = require("../../utilities/helper");
const userModel = require("../users/model");
const constants = require("../../utilities/constants");
const apartmentModel = require("../apartments/models")


const updateRole = async (req, res) => {

    let code, message;

    try {
        console.log(req?.decodedUser?.roles);

        if (req?.decodedUser?.roles.includes("Super_Admin") || req?.decodedUser?.roles.includes("Operations_Manager")) {
            const updateDetails = await userModel.findOneAndUpdate(
                { _id: req.params.id },
                { roles: req.body.roles, reportingTo: req?.decodedUser?.user_id },
                { new: true }
            );
            await updateDetails.save();
            console.log(updateDetails);
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
        console.log("error in put role endpoint", error);
        code = 500;
        message = "Internal server error";
        const resData = customResponse({
            code,
            message,
            err: error,
        });
        return res.send(resData);
    }
};

const assignAreaManager = async (req, res) => {
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

module.exports = { updateRole, assignAreaManager };