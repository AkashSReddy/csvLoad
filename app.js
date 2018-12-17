var createError = require("http-errors");
var express = require("express");
var path = require("path");
var stringify = require("csv-stringify");
var fs = require("fs");
var mongoose = require("mongoose");
var jsoncsv = require("json-csv");
require("dotenv").config();
var app = express();
const Q_Database = require("./model/question");
const A_Database = require("./model/applicant");
let datas = [];
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useFindAndModify: false },
  err => {
    if (!err) console.log("Connection successful");
  }
);

var newP = new Promise(function(resolve, reject) {
  A_Database.find({ status: "approved" }, "name phone regno", function(
    err,
    data
  ) {
    if (err) reject(err);
    resolve(data);
  });
});

newP.then(function(data) {
  let columns = {
    name: "name",
    regno: "regno",
    phone: "phone"
  };
  datas = data.map(data => {
    return {
      name: data.name,
      regno: data.regno,
      phone: data.phone
    };
  });
  stringify(datas, { header: true, columns: columns }, (err, output) => {
    if (err) throw err;
    fs.writeFile("data.csv", output, err => {
      if (err) throw err;
      console.log("data.csv saved.");
    });
  });
});
newP.catch(function(err) {
  throw err;
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
