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
 mysqlDb.runQuery('Select * from detectoperation order by id asc', (err, results) => {
   if (err) {
     console.error('Error executing query:', err);
     res.status(500).send('Error occurred selecting detected face');
     return;
   }
   content = MyUtils.createHTMLTable(results);
   res.send(content);
 });
});



app.get('/detectFace', async (req, res) => {
  const imgPath = req.query.imgFilePath;

  // Load the face recognition model
  faceRecognition.loadModel()
    .then(() => {
      // Detect faces in the specified image
      return faceRecognition.detectFaces(imgPath);
    })
    .then(detections => {
      let baseImage = fileHandler.imageToBase64(imgPath);
      baseImage = `data:image/png;base64,${baseImage}`;
      let detectedImage = detections;
      res.send(detections);

      for(var i=0;i<detections.length;i++) {
        const currentUnixTime = Math.floor(Date.now() / 1000);
        mysqlDb.runQuery(`Insert into detectoperation (baseImage , detectedImage , operationTime) values('${baseImage}' , '${detections[i]}' , ${currentUnixTime} )`, (err, results) => {
          if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Error occurred inserting detected face');
            return;
          }
          console.log('Resim kaydı başarılı.');
       });
      }
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).send('Error occurred during face detection');
    });
});

app.get('/matchFace', async (req, res) => {
    const imgPath = req.query.imgFilePath;
    faceRecognition.loadModel()
    .then(() => {
      // Detect faces in the specified image
      return faceRecognition.detectFaces(imgPath);
    })
    .then(detections => {
      const faceDescriptors = [
        {
          label: 'Person 1',
          descriptor: new Float32Array(/* Face descriptor for Person 1 */)
        },
        {
          label: 'Person 2',
          descriptor: new Float32Array(/* Face descriptor for Person 2 */)
        },
        // Add more face descriptors as needed
      ];
      faceRecognition.createFaceMatcher(faceDescriptors).
      then(data => {
          faceRecognition.matchFaces(imgPath).
          then( matches => {
            // Process the matches as needed
            matches.forEach(match => {
              const { detection, match: bestMatch } = match;
              console.log('Face detected:', detection);
              console.log('Best match:', bestMatch);
            });
          }).
          catch(error => {
            console.error('Error occurred during match faces', error);
          })
      }).
      catch(error =>  {
          console.error('Error occurred during create matcher', error);
      });
    })
    .catch(error => {
      console.error('Error occurred during face detection', error);
    });


});

// Start the server
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

