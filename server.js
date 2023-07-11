const c = require('./Consts/const.js');
const express = require('express');
const http = require('http');
const fs = require('fs');
const path = require('path');
const NodeWebcam = require('node-webcam');
const app = express();
const server = http.createServer(app);
const FaceRecognition = require('./Helpers/Base/FaceRecognition.js');
const FileHandler = require('./Helpers/Base/FileHandler.js');
const MyUtils = require('./Helpers/Base/MyUtils.js');
const MySqlDb = require('./Helpers/MysqlDb.js');
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

app.use(express.static('public'));

app.get('/deleteImages', (req, res) => {
  fileHandler.removeDownloadImages(req.query.filePath);
  res.send('resim silindi');
});

app.get('/images', (req, res) => {
  let fileName = req.query.fileName;
  res.sendFile(__dirname + `/Views/images/${fileName}`);
});

app.get('/css', (req, res) => {
  let fileName = req.query.fileName;
  res.sendFile(__dirname + `/Views/css/${fileName}`);
});

app.get('/js', (req, res) => {
  let fileName = req.query.fileName;
  res.sendFile(__dirname + `/Views/js/${fileName}`);
});

// Serve index.html file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/Views/index.html');
});

app.get('/getDetectedData' , (req , res) => {
 let content = "";
 mysqlDb.runQuery('Select * from detectoperation order by id desc', (err, results) => {
   if (err) {
     console.error('Error executing query:', err);
     res.status(500).send('Error occurred selecting detected face');
     return;
   }
   if(results.length === 0){
      res.send("No result data");
      return;
   }
   content = MyUtils.createHTMLTable(results , "face-detect-table");
   res.send(content);
 });
});

app.get('/detectFace', async (req, res) => {
  const imgPath = req.query.imgFilePath;

  // Load the face recognition model
  faceRecognition.detectFaces(imgPath)
    .then(detections => {
      let baseImage = fileHandler.imageToBase64(imgPath);
      baseImage = `${baseImage}`;
      let detectedImage = detections;
      res.send(detections);

      for(var i=0;i<detections.length;i++) {
        const currentUnixTime = Math.floor(Date.now() / 1000);
        createOperationForMysql(`${baseImage}` , detections[i] , currentUnixTime)
        createOperationForMssql(`data:image/png;base64,${baseImage}` , detections[i] , currentUnixTime);
      }
    })
    .catch(error => {
      console.log('Error:', error);
      res.status(500).send('Error occurred during face detection');
    });
});

app.get('/isDetectFace', async (req, res) => {
  const imgPath = req.query.imgFilePath;

  // Load the face recognition model
  faceRecognition.isDetectFace(imgPath).then(result => {
    return res.send(result);
  })
});

app.get('/matchFace', async (req, res) => {
  const imgPath = req.query.imgFilePath;
  const folderPath = c.faceFolderPath;
  let result = [];
  const imageFiles = fs.readdirSync(folderPath);

  for (const imageFile of imageFiles) {
    const imageFilePath = path.join(folderPath, imageFile);
    const similarityResult = await faceRecognition.compareImages(imgPath, imageFilePath);
    result.push(similarityResult);
  }

  result = result.filter(item => item.matched);

  if(result.length === 0) {
      content = "No result data";
  } else {

    content = MyUtils.createHTMLTable(result, "matched-face-table");
  }

  res.send(content);
});

app.get('/matchFaceDesc', async (req, res) => {
  const imgPath = req.query.imgFilePath;
  const result = await faceRecognition.findMatchingDescriptionDb(imgPath);

  let resultNew = result.filter(item => item.matched);

  if(resultNew.length === 0) {
      content = "No result data";
  } else {

    content = MyUtils.createHTMLTable(resultNew, "matched-face-table");
  }

  res.send(content);

});

/* functions */
function createOperationForMysql(baseImage , detectedImage , operationTime) {
  let tmpBaseImage = `data:image/png;base64,${baseImage}`;
  mysqlDb.runQuery(`Insert into detectoperation (baseImage , detectedImage , operationTime) values(?,?,?)`, [tmpBaseImage , detectedImage , operationTime], (err, results) => {
    if (err) {
      console.log('Error executing query:', err);
      res.status(500).send('Error occurred inserting detected face');
      return;
    } else {
      console.log("Resim Eklendi Mysql");
    }
  });
}

async function createOperationForMssql(baseImage , detectedImage , operationTime) {

  try {
    const operation = {
      baseImage : baseImage ,
      detectedImage : detectedImage ,
      operationTime : operationTime
    };

    const response = await axios.post(c.faceDetectServiceUrl, operation);

    if (response.status === 201) {
      // Operation created successfully
      const createdOperation = response.data;
      console.log('Created Operation: Resim eklendi Mssql');
    } else {
      // Error occurred
      console.error('Error:', response.data);
    }
  } catch (error) {
    // Request error
    console.error('Error:', error.message);
  }
}

function modelImagesDb() {
  faceRecognition.processImagesInFolderToDB(c.faceFolderPath)
      .then(() => {
        // Detect faces in the specified image
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function modelImagesFolder() {
  faceRecognition.processImagesInFolder(c.faceFolderPath , descFilePath)
      .then(() => {
        // Detect faces in the specified image
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

/* functions */


//modelImagesDb();
//modelImagesFolder();

/* Start the server*/
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
/* Start the server*/

