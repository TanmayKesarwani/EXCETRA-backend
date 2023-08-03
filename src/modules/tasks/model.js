const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require("../../utilities/constants");
const db = require("../../utilities/db");

const taskSchema = new Schema({
  clientName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "clientUser",
    required: true
  },
  address: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    enum : constants.task_types,
    required: true
  },
  taskStartTime: {
    type: Date,
    required: true,
    default: Date.now()
  },
  duration: {
    type: Number,
    min: 1,
    max: 8,
    required: true
  },
  taskStatus: {
    type: String,
    enum: constants.task_status,
    default: 'unassigned'
  },
  payment: {
    paymentDone: {
      type: Boolean,
      default: false
    },
    totalAmount: {
      type: Number,
      default: 0
    }
  },
  startTime: {
    type: Date,
  },
  endTime: {
    type: Date,
  },
  assignee: {
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    assigneeStatus: {
      type: String,
      enum: constants.assignee_status,
    }
  }
});

const Task = db.model('Task', taskSchema);

module.exports = Task;
