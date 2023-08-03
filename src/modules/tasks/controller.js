const constants = require("../../utilities/constants");
const mongoose = require("mongoose");
const { customResponse, customPagination } = require("../../utilities/helper");
const Task = require("./model");
const Client = require("../clientUser/model");
const User = require("../users/model");

const createTask = async (req, res) => {
    let code, message, resData;
    const isClient = req?.decodedUser?.roles.includes("client");
    try {
        if(isClient) {
            const userid = req?.decodedUser?.user_id;
            if(userid !== req.body?.clientName) {
                throw {
                    message: constants.MESSAGE_TASK.INVALID_CLIENT,
                    code: constants.HTTP_403_CODE,
                };
            }
        }
        else {
            const client = await Client.findById(req.body?.clientName);
            if(!client) {
                throw {
                    message: constants.MESSAGE_TASK.NOT_FOUND,
                    code: constants.HTTP_404_CODE,
                };
            }
        }

        const { clientName, address, taskType, taskStartTime, duration } = req.body;

        const [datePart, timePart] = taskStartTime.split("T");
        const [year, month, day] = datePart.split("-");
        const [hour, minute, second] = timePart.split(":");

        const taskStartTimeDate = new Date(
        Date.UTC(year, month - 1, day, hour, minute, second)
        );

        const task = new Task({
            clientName,
            taskType,
            taskStartTime: taskStartTimeDate,
            duration,
            address,
        });

        await task.save();

        if(!task) {
            throw {
                message: constants.SOMETHING_WRONG_MSG,
                code: constants.HTTP_400_CODE,
            };
        }

        code = constants.HTTP_201_CODE;
        message = constants.MESSAGE_TASK.CREATE;
        const success = true;
        resData = customResponse({ code, message, data: task, success });
        return res.send(resData);
    } catch (error) {
        console.log("error in post Task endpoint", error);
        code = error?.code ? error.code : constants.HTTP_500_CODE;
        message = error?.message ? error.message : constants.SERVER_ERR;
        resData = customResponse({
            code,
            message,
            err: error.message,
        });
        return res.status(code).send(resData);
    }
}

const getTasks = async (req, res) => {
    let code, message, resData, page, limit;
    const { status, client, employee, assigneeStatus } = req.query; 
    try {
        query = {};
        if(status) {
            query.taskStatus = status;
        }
        if(client) {
            query.clientName = client;
        }
        if(employee) {
            query['assignee.assignedTo'] = employee;
        }
        if (assigneeStatus) {
            query['assignee.assigneeStatus'] = assigneeStatus;
        }

        const tasks = await Task.find(query)
                    .populate('assignee.assignedTo', 'name')
                    .populate('clientName', 'name');

        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_TASK.FETCH;

        resData = customResponse({ code, message, data: tasks });
        return res.status(code).send(resData);
    } catch (error) {
        console.log("error in get Task endpoint", error);
        code = error?.code ? error.code : constants.HTTP_500_CODE;
        message = error?.message ? error.message : constants.SERVER_ERR;
        resData = customResponse({
            code,
            message,
            err: error.message,
        });
        return res.status(code).send(resData);
    }
}

const getTask = async (req, res) => {
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
        const task = await Task.findById(_id)
                    .populate('assignee.assignedTo', 'name')
                    .populate('clientName', 'name');
        if (!task) {
            throw {
                message: constants.MESSAGE_TASK.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }
        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_TASK.FETCH;
        const resData = customResponse({
            code,
            message,
            data: task,
        });
        return res.status(code).send(resData);
    } catch (error) {
        console.error("Error in get Task endpoint", error);
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

const updateTask = async (req, res) => {
    const _id = req.params.id;
    let code, message;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    try{
        if (!isValid) {
            throw {
                message: constants.INVALID_OBJECTID,
                code: constants.HTTP_422_CODE,
            };
        }
        const task = await Task.findById(_id);
        if (!task) {
            throw {
                message: constants.MESSAGE_TASK.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }

        if(req.body?.assignedTo) {
            const user = await User.findById(req.body?.assignedTo);
            if (!user) {
                throw {
                    message: constants.USER_NOT_FOUND,
                    code: constants.HTTP_404_CODE,
                };
            }
        }

        if (req.body?.clientName) {
            task.clientName = req.body.clientName;
        }
        if (req.body?.address) {
            task.address = req.body.address;
        }
        if (req.body?.taskType) {
            task.taskType = req.body.taskType;
        }
        if (req.body?.taskStartTime) {
            const [datePart, timePart] = req.body?.taskStartTime.split("T");
            const [year, month, day] = datePart.split("-");
            const [hour, minute, second] = timePart.split(":");

            const taskStartTimeDate = new Date(
                Date.UTC(year, month - 1, day, hour, minute, second)
            );
            task.taskStartTime = taskStartTimeDate;
        }
        if (req.body?.duration) {
            task.duration = req.body.duration;
        }
        

        if (req.body?.paymentDone) {
            task.payment.paymentDone = true;
            task.taskStatus = 'completed';
        }
        

        if (req.body?.assignedTo) {
            task.assignee.assignedTo = req.body.assignedTo;
            task.taskStatus = 'assigned';
        }

        if(req.body.assigneeStatus) {
            if(req.body.assigneeStatus == 'accepted') {
                task.assignee.assigneeStatus = req.body.assigneeStatus;
            }
            else if(req.body.assigneeStatus == 'rejected') {
                task.taskStatus = 'unassigned';
                task.assignee = undefined;
            }
        }

        if (req.body?.startTime) {
            const [datePart, timePart] = req.body?.startTime.split("T");
            const [year, month, day] = datePart.split("-");
            const [hour, minute, second] = timePart.split(":");

            const startTimeDate = new Date(
                Date.UTC(year, month - 1, day, hour, minute, second)
            );

            task.startTime = startTimeDate;
        }
        else if (task?.startTime && req.body?.endTime) {
            const [datePart, timePart] = req.body?.endTime.split("T");
            const [year, month, day] = datePart.split("-");
            const [hour, minute, second] = timePart.split(":");

            const endTimeDate = new Date(
                Date.UTC(year, month - 1, day, hour, minute, second)
            );

            task.endTime = endTimeDate;
            const actualDurationInHours = (task.endTime - task.startTime) / (1000 * 60 * 60);
            const charge = 500 * actualDurationInHours;
            task.payment.totalAmount = Math.ceil(charge);
        }

        const updatedTask = await task.save();

        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_TASK.UPDATE;
        const resData = customResponse({
            code,
            message,
            data: updatedTask,
        });
        return res.status(code).send(resData);
    } catch (error) {
        console.error("Error in update Task endpoint", error);
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

const taskPayment = async (req, res) => {
    const _id = req.params.id;
    let code, message;
    const isValid = mongoose.Types.ObjectId.isValid(_id);
    try{
        if (!isValid) {
            throw {
                message: constants.INVALID_OBJECTID,
                code: constants.HTTP_422_CODE,
            };
        }
        const task = await Task.findById(_id);
        if (!task) {
            throw {
                message: constants.MESSAGE_TASK.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }

        if (req.body?.startTime && req.body?.endTime) {
            task.startTime = req.body.startTime;
            task.endTime = req.body.endTime;
        }

        const updatedTask = await task.save();

        const actualDurationInHours = (task.endTime - task.startTime) / (1000 * 60 * 60);
        const charge = 500 * actualDurationInHours;

        const data = {charge : charge}

        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_TASK.CHARGE;
        const resData = customResponse({
            code,
            message,
            data: data,
        });
        return res.status(code).send(resData);
    } catch (error) {
        console.error("Error in Payment Task endpoint", error);
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

const getAssignee = async(req, res) => {
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
        const getTask = await Task.findById(_id);
        
        if(!getTask) {
            throw {
                message: constants.MESSAGE_TASK.NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }

        // Fetch a list of employees based on the task type
        const employees = await User.find({ roles: { $in: [getTask?.taskType] } });

        // Filter employees based on availability for the given time and duration
        const availableEmployees = await Promise.all(
            employees.map(async (employee) => {
                // Check if the employee has no conflicting tasks during the specified time and duration
                const isBusy = await employeeIsBusy(
                    employee,
                    getTask?.taskStartTime,
                    getTask?.duration
                );
                return { employee, isBusy };
            })
        );

        // Filter available employees who are not busy
        const filteredEmployees = availableEmployees.filter(
            (empData) => !empData.isBusy
        );

        // Extract employee objects from filteredEmployees
        const availableEmployeeObjects = filteredEmployees.map(
            (empData) => empData.employee
        );

        // If no available employees are found, throw an error
        if (availableEmployeeObjects.length === 0) {
            throw {
                message: constants.MESSAGE_TASK.EMPLOYEE_NOT_FOUND,
                code: constants.HTTP_404_CODE,
            };
        }

        code = constants.HTTP_200_CODE;
        message = constants.MESSAGE_TASK.EMPLOYEE_FETCH;
        const resData = customResponse({
            code,
            message,
            data: availableEmployeeObjects,
        });
        return res.status(code).send(resData);
  } catch (error) {
        console.error("Error in get Assignee endpoint", error);
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

// Helper function to check if an employee is busy during the specified time and duration
async function employeeIsBusy(employee, taskStartTime, duration) {
  try {
    // Get all tasks assigned to the employee
    const employeeTasks = await Task.find({ 'assignee.assignedTo': employee._id });
    // Check for conflicting tasks
    for (const task of employeeTasks) {
      // if the task is already completed
      if (task.taskStatus === "completed") {  // Task is completed, so the employee is free during this time
        continue; 
      }

      // Convert the curr duration (hours) to milliseconds
      const taskCurrDurationInMs = duration * 60 * 60 * 1000;

      // Convert the task duration (hours) to milliseconds
      const taskDurationInMs = task.duration * 60 * 60 * 1000;

      // Calculate the task's end time based on its start time and duration
      const taskEndTime = new Date(task?.taskStartTime.getTime() + taskDurationInMs);

      // Calculate the end time of the task being checked
      const checkTaskEndTime = new Date(taskStartTime.getTime() + taskCurrDurationInMs);

      const taskStartDate = new Date(task?.taskStartTime);
      const checkTaskStartDate = new Date(taskStartTime);

      if (taskStartDate.toISOString().substr(0, 10) !== checkTaskStartDate.toISOString().substr(0, 10)) {
        continue; // Dates are different, no need to check time
      }

      // Check for overlap
      if (
        (task.taskStartTime <= taskStartTime && taskEndTime >= taskStartTime) || // Start time overlaps
        (task.taskStartTime <= checkTaskEndTime && taskEndTime >= checkTaskEndTime) || // End time overlaps
        (task.taskStartTime >= taskStartTime && taskEndTime <= checkTaskEndTime) // Task duration overlaps
      ) {
        return true; // Employee is busy during the specified time and duration
      }
    }

    return false; // Employee is not busy
  } catch (error) {
    throw {
        message: constants.SOMETHING_WRONG_MSG,
        code: constants.HTTP_400_CODE,
    };
  }
}


module.exports = { createTask, getTasks, getTask, updateTask, getAssignee, taskPayment }