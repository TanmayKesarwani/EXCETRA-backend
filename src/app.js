require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const cron = require("node-cron");
const router = require("./routes/index");
const swaggerUI = require("swagger-ui-express");
const swaggerFile = require("../public/api-docs/swagger-output.json");
require("./utilities/db");

const port = process.env.API_PORT || 8085;
const ip_adress = process.env.API_IP || "0.0.0.0";
const appName = process.env.APP_NAME || "VB STORE";
const appDesc =
  process.env.APP_INFO || "VB STORE is an ecommerce platform built on krypton";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: appName,
      description: appDesc,
    },
    servers: [
      {
        url: "http://localhost:8085",
      },
    ],
  },
  apis: ["./routes*.js"],
};

app.use(
  "/api-docs",
  swaggerUI.serve,
  swaggerUI.setup(swaggerFile, swaggerOptions)
);

app.use(cors({ origin: "*" }));
app.use(express.json());

app.use("/api", router);



app.listen(port, ip_adress, () => {
  console.log(`${appName} listening on the port ${port}`);
});

module.exports = app;
