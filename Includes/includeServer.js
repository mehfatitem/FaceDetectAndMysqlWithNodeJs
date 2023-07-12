const c = require('./../Consts/const.js');
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const NodeWebcam = require('node-webcam');
const app = express();
const server = http.createServer(app);
const FaceRecognition = require('./../Helpers/Base/FaceRecognition.js');
const FileHandler = require('./../Helpers/Base/FileHandler.js');
const MyUtils = require('./../Helpers/Base/MyUtils.js');
const MySqlDb = require('./../Helpers/MysqlDb.js');
const axios = require('axios');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const faceRecognition = new FaceRecognition();
const fileHandler = new FileHandler();
const mysqlDb = new MySqlDb();

const port = 3000;


module.exports = {
  faceRecognition,
  fileHandler,
  mysqlDb,
  port,
  server,
  axios,
  app,
  MyUtils,
  server,
  express,
  path
};