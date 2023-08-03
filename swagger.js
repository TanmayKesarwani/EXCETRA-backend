require("dotenv").config();
const fs = require("fs");
const swaggerAutogen = require("swagger-autogen")();

const appName = process.env.APP_NAME || "VB STORE";
const appDesc =
  process.env.APP_INFO || "VB STORE is an ecommerce platform built on krypton";

const doc = {
  info: {
    title: appName,
    description: appDesc,
  },
  host: "localhost:8085/api",
  basePath: "/",
  schemes: ["http", "https"],
  consumes: ["application/json"],
  produces: ["application/json"],
  tags: [
    {
      name: appName,
      description: appDesc,
    },
  ],
};

let outputFile = "./public/api-docs/swagger-output.json";
if (!fs.existsSync(outputFile)) {
  outputFile = fs.openSync(outputFile, "w");
}
const endpointsFiles = ["./src/routes/index.js"];
swaggerAutogen(outputFile, endpointsFiles, doc);
