const is = require('./../Includes/includeServer.js');

let app = is.app;
let server = is.server;
let port = is.port;
let path = is.path;

function createOperationForMysql(baseImage , detectedImage , operationTime) {
  is.mysqlDb.runQuery(`Insert into detectoperation (baseImage , detectedImage , operationTime) values('data:image/png;base64,${baseImage}' , '${detectedImage}' , ${operationTime} )`, (err, results) => {
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

    const response = await is.axios.post(c.faceDetectServiceUrl, operation);

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
  is.faceRecognition.processImagesInFolderToDB(c.faceFolderPath)
      .then(() => {
        // Detect faces in the specified image
  })
  .catch(error => {
    console.log('Error:', error);
  });
}

function modelImagesFolder() {
  is.faceRecognition.processImagesInFolder(c.faceFolderPath , descFilePath)
      .then(() => {
        // Detect faces in the specified image
  })
  .catch(error => {
    console.log('Error:', error);
  });
}


function init (app) {
	app.use(is.express.static('public'));

	app.get('/deleteImages', (req, res) => {
	  is.fileHandler.removeDownloadImages(req.query.filePath);
	  res.send('resim silindi');
	});

	app.get('/images', (req, res) => {
	  let fileName = req.query.fileName;
	  let filePath = path.join(__dirname, '../Views/images/', fileName);
	  res.sendFile(filePath);
	});

	app.get('/css', (req, res) => {
	  let fileName = req.query.fileName;
	  let filePath = path.join(__dirname, '../Views/css/', fileName);
	  res.sendFile(filePath);
	});

	app.get('/js', (req, res) => {
	  let fileName = req.query.fileName;
	  let filePath = path.join(__dirname, '../Views/js/', fileName);
	  res.sendFile(filePath);
	});

	// Serve index.html file
	app.get('/', (req, res) => {
	  let fileName = req.query.fileName;
	  let filePath = path.join(__dirname, '../Views/index.html');
	  res.sendFile(filePath);
	});

	app.get('/getDetectedData' , (req , res) => {
	 let content = "";
	 is.mysqlDb.runQuery('Select * from detectoperation order by id desc', (err, results) => {
	   if (err) {
	     console.error('Error executing query:', err);
	     res.status(500).send('Error occurred selecting detected face');
	     return;
	   }
	   if(results.length === 0){
	      res.send("No result data");
	      return;
	   }
	   content = is.MyUtils.createHTMLTable(results , "face-detect-table");
	   res.send(content);
	 });
	});

	app.get('/detectFace', async (req, res) => {
	  const imgPath = req.query.imgFilePath;

	  // Load the face recognition model
	  is.faceRecognition.detectFaces(imgPath)
	    .then(detections => {
	      let baseImage = is.fileHandler.imageToBase64(imgPath);
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
	  is.faceRecognition.isDetectFace(imgPath).then(result => {
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
	    const similarityResult = await is.faceRecognition.compareImages(imgPath, imageFilePath);
	    result.push(similarityResult);
	  }

	  result = result.filter(item => item.matched);

	  if(result.length === 0) {
	      content = "No result data";
	  } else {

	    content = is.MyUtils.createHTMLTable(result, "matched-face-table");
	  }

	  res.send(content);
	});

	app.get('/matchFaceDesc', async (req, res) => {
	  const imgPath = req.query.imgFilePath;
	  const result = await is.faceRecognition.findMatchingDescriptionDb(imgPath);

	  let resultNew = result.filter(item => item.matched);

	  if(resultNew.length === 0) {
	      content = "No result data";
	  } else {

	    content = is.MyUtils.createHTMLTable(resultNew, "matched-face-table");
	  }

	  res.send(content);

	});
}


module.exports = {
	modelImagesDb,
	modelImagesFolder,
	server,
	app,
	port,
	init
};

