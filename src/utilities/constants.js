module.exports = constants = {
  STATUS_SUCCESS: "success",
  STATUS_FAILURE: "failure",
  SOMETHING_WRONG_MSG: "Something went wrong",
  ENV_TEST: "test",
  TOKEN_INVALID_MSG: "Invalid Token",
  INVALID_OBJECTID: "Invalid object id",
  AUTHENTICATION_ERR_MSG: "Authentication error. Token required.",
  NOT_AUUTH_FOR_ROUTE_MSG: "Not Authorized for this route",
  LOCALE: "en",
  USER_REGISTER_SUCCESS_MSG: "User successfully registered",
  LOGIN_SUCCESS: "Logged In successful",
  USER_UPDATED_SUCCESS_MSG: "user successfully updated!",
  BAD_REQ_MSG: "Bad Request",
  SERVER_ERR: "Internal server error",
  USER_NOT_FOUND_WITH_EMAIL_MSG: "User not found with this email",
  USER_EXIST_WITH_EMAIL: "User already exist with this email!",
  USER_NOT_FOUND: "User not found",
  AREA_MANAGER_NOT_FOUND: "Area manager not found",
  ROLE_NOT_EXISTS: "Role does not exist",
  USER_EXIST_WITH_USERNAME: "User already exist with this username!",
  TEST_EMAIL: "test@gmail.com",
  USER_LOGOUT_MSG: "User successfully Logout",
  USER_ID_NOT_FOUND: "User id is not there!",
  ROLES_INVALID_MSG:
    "Invalid Roles, These roles are not there in the organization!",
  FORBIDDEN_MSG: "Forbidden! You're not authorized to perform this action",
  emailStatus: "Can not send email",
  //HTTP Status codes
  HTTP_200_CODE: 200,
  HTTP_201_CODE: 201,
  HTTP_204_CODE: 204,
  HTTP_401_CODE: 401,
  HTTP_403_CODE: 403,
  HTTP_404_CODE: 404,
  HTTP_422_CODE: 422,
  HTTP_400_CODE: 400,
  HTTP_206_CODE: 206,
  HTTP_500_CODE: 500,

  roles: ["helper", "maid", "plumber", "Area_Manager", "Operations_Manager", "client", "electrician", "Super_Admin", "technician"],
  task_types: ["helper", "maid", "electrician", "plumber", "technician"],
  task_status: ['unassigned', 'assigned', 'completed'],
  assignee_status: ["accepted", "rejected"],

  annonymousUser: "Anonymous User",

  mailSubject: "Your auto generated password from EXCETRA",

  MESSAGE_OTP: {
    CREATE: "OTP Generated Successfully",
    INVALID_OTP : "Invalid OTP",
    OTP_EXPIRED: "OTP expired",
    PASSWORDS_NOT_MATCHED: "Passwords do not match",
    PASSWORD_CHANGE : "Password has been changed successfully",
  },
  MESSAGE_APARTMENT: {
    NOT_FOUND: "Apartement not found",
    FETCH: "Apartment fetch successfully"
  },
  MESSAGE_TASK: {
    NOT_FOUND: "Task not found",
    FETCH: "Task fetch successfully",
    EMPLOYEE_FETCH: "Task asignee employee fetch successfully",
    INVALID_CLIENT: "Invalid client",
    CREATE: "task created successfully",
    CHARGE: "Charges get successfully",
    UPDATE: "task updated successfully",
    EMPLOYEE_NOT_FOUND : "No available employees for the given time and duration."
  },

  MESSAGE_CLIENT: {
    CLIENT_APPARTEMENT_NOT_FOUND: "client appartement data is not found",
    CLIENT_EMAIL_ALREADY_EXIST: "client email is already exists",
    NOT_FOUND: "client not found",
    FETCH: "cliet fetch successfully"
  },

};
