const express = require("express");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const colors = require("colors");
const fileupload = require("express-fileupload");
const errorHandler = require("./middleware/error");
const cookieParser = require("cookie-parser");

//Import NoSQL Injection Depender
const mongoSanitize = require("express-mongo-sanitize");

// Header security
const helmet = require("helmet");
// Xss Script Depender
const xss = require("xss-clean");

// Speend limit
const rateLimit = require("express-rate-limit");

//HTTP Param 변조 방지
const hpp = require("hpp");

// 전체 도메인 허용
const cors = require("cors");

// Load Env var : 환경 설정 적용
dotenv.config({ path: "./config/config.env" });

// Connect to Database
connectDB();

//Route Files Import

//express 생성
const app = express();

// Request Json Body Parser
app.use(express.json());

//Dev loggin middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}
//Cookie-Parser
app.use(cookieParser());
//File Uploading
app.use(fileupload());

// Sanitize data
app.use(mongoSanitize());

//Set Security headers
// app.use(helmet());
app.use(helmet({ contentSecurityPolicy: false }));

// Prevent XSS attacked
app.use(xss());

//Rate limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, // 10 mins
  max: 100,
});
app.use(limiter);

//prevent http param pollution
app.use(hpp());

//Enable CORS
app.use(cors());

//Set static Folder
app.use(express.static(path.join(__dirname, "public")));

//Mount routers Use

/** Error Handler */
app.use(errorHandler);

//PORT Setting
const PORT = process.env.PORT || 5000;

//Server Open
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  );
});

//handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`.red);
  //Close server & exit process
  server.close(() => process.exit(1));
});
