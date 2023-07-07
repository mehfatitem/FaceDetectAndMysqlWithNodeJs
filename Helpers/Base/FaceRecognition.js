const faceapi = require('face-api.js');
const canvas = require('canvas');

const username = 'mehfatitem';
const faceFolderPath = `C:/Users/${username}/Downloads/yuzler`;
const distanceThreshold = 0.48; // Define a threshold value to determine if the faces are a match

const {
  Canvas,
  Image,
  ImageData
} = canvas;
faceapi.env.monkeyPatch({
  Canvas,
  Image,
  ImageData
});

const MySqlDb = require('./../MysqlDb.js');

const fs = require('fs');
const path = require('path');

const FileHandler = require('./FileHandler.js');

const fileHandler = new FileHandler();
const mysqlDb = new MySqlDb();

class FaceRecognition {
  constructor() {
    this.faceMatcher = null;
    //tf.enableProdMode();
  }

  async loadModel() {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('models');
  }

  async isDetectFace(imagePath) {
    await this.loadModel();

    const img = await canvas.loadImage(imagePath);

    const detections = await faceapi.detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors()

    return detections.length > 0;
  }

  async detectFaces(imagePath) {
    await this.loadModel();
    const img = await canvas.loadImage(imagePath);

    // Detect faces in the image
    const detections = await faceapi.detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors()

    const croppedFaces = [];

    // Crop and save the face images
    detections.forEach(detection => {
      const box = detection.detection.box;
      const face = faceapi.createCanvasFromMedia(img).getContext('2d');

      // Adjust the face region to include some padding
      const padding = 20;
      const startX = Math.max(0, box.x - padding);
      const startY = Math.max(0, box.y - padding);
      const width = Math.min(img.width - startX, box.width + padding * 2);
      const height = Math.min(img.height - startY, box.height + padding * 2);

      // Crop the face region from the original image
      face.canvas.width = width;
      face.canvas.height = height;
      face.drawImage(img, startX, startY, width, height, 0, 0, width, height);

      // Convert the cropped face image to a data URL
      const croppedFaceImage = face.canvas.toDataURL();
      croppedFaces.push(croppedFaceImage);
    });

    return croppedFaces;
  }

  async generateFaceDescriptor(imagePath) {
    await this.loadModel();

    const img = await canvas.loadImage(imagePath);

    // Detect faces in the image
    const detections = await faceapi.detectAllFaces(img)
      .withFaceLandmarks()
      .withFaceDescriptors();

    const fileName = path.basename(imagePath, path.extname(imagePath));

    const faceDescriptors = detections.map(detection => ({
      descriptor: detection.descriptor,
      label: fileName // Provide a label for the face descriptor
    }));

    return faceDescriptors;
  }

  async findMatchingDescriptionDb(imagePath) {
    const faceDescriptors = await this.generateFaceDescriptor(imagePath);

    if (faceDescriptors.length === 0) {
      return [{
        matched: false,
        matchedImgpath: null,
        contact: null,
        similarityScore: null,
        message: `The faces do not match.`
      }];
    }

    const result = [];

    await new Promise((resolve, reject) => {
      mysqlDb.runQuery(`SELECT * FROM facedescriptions ORDER BY id`, [], async (err, results) => {
        if (err) {
          console.log('Error executing query:', err);
          reject(err);
        } else {
          for (const item in results) {
            const description = results[item]['description'];
            const contact = results[item]['contact'];
            const imgPath = path.join(faceFolderPath, `${contact}.png`);

            const desc = Object.values(JSON.parse(description));

            const distance = faceapi.euclideanDistance(faceDescriptors[0].descriptor, desc);
            const similarityScore = 1 - distance; // Calculate the similarity score

            console.dir(similarityScore);

            if (similarityScore > distanceThreshold) {
              const similarityPercentage = Math.round(similarityScore * 100);
              const matchedImg = 'data:image/png;base64,' + await fileHandler.imageToBase64(imgPath);
              result.push({
                matched: true,
                matchedImgpath: matchedImg,
                contact: contact,
                similarityScore: similarityPercentage,
                message: `The faces are a match. Similarity Score: ${similarityPercentage}%`
              });
            } else {
              result.push({
                matched: false,
                matchedImgpath: null,
                contact: null,
                similarityScore: null,
                message: `The faces do not match.`
              });
            }
          }
          resolve();
        }
      });
    });

    return result;
  }

  async findMatchingDescription(imagePath, folderPath) {
    const faceDescriptors = await this.generateFaceDescriptor(imagePath);

    if (faceDescriptors.length == 0)
      return [{
        matched: false,
        matchedImgpath: null,
        contact: null,
        similarityScore: null,
        message: `The faces are not match.`
      }];

    const fileNames = fs.readdirSync(folderPath);



    let result = [];

    for (const fileName of fileNames) {
      const filePath = path.join(folderPath, fileName);
      const description = fs.readFileSync(filePath, 'utf8');

      const desc = Object.values(JSON.parse(description));

      const distance = faceapi.euclideanDistance(faceDescriptors[0].descriptor, desc);
      const similarityScore = 1 - distance; // Calculate the similarity score

      if (similarityScore > distanceThreshold) {
        const similarityPercentage = Math.round(similarityScore * 100);
        const matchedImgpath = `data:image/png;base64,${fileHandler.imageToBase64(path.join(faceFolderPath, fileName.replace('.txt', '.png')))}`
        result.push({
          matched: true,
          matchedImgpath: matchedImgpath,
          contact: fileName.replace('.txt', ''),
          similarityScore: similarityPercentage,
          message: `The faces are a match. Similarity Score: ${similarityPercentage}%`
        });
      } else {
        result.push({
          matched: false,
          matchedImgpath: null,
          contact: null,
          similarityScore: null,
          message: `The faces are not match.`
        });
      }
    }

    return result;
  }

  async compareImages(imagePath1, imagePath2) {
    const faceDescriptors1 = await this.generateFaceDescriptor(imagePath1);
    const faceDescriptors2 = await this.generateFaceDescriptor(imagePath2);

    const distanceThreshold = 0.6; // Define a threshold value to determine if the faces are a match

    let contact = path.parse(imagePath2).name; // Move the contact variable outside the loop

    // Compare each face descriptor from imagePath1 with each face descriptor from imagePath2
    for (const faceDescriptor1 of faceDescriptors1) {
      for (const faceDescriptor2 of faceDescriptors2) {
        const distance = faceapi.euclideanDistance(faceDescriptor1.descriptor, faceDescriptor2.descriptor);
        const similarityScore = 1 - distance; // Calculate the similarity score

        if (similarityScore > distanceThreshold) {
          const similarityPercentage = Math.round(similarityScore * 100);
          return {
            matched: true,
            matchedImgpath: `data:image/png;base64,${fileHandler.imageToBase64(imagePath2)}`,
            contact: contact,
            similarityScore: similarityPercentage,
            message: `${imagePath2} The faces are a match. Similarity Score: ${similarityPercentage}%`
          };
        } else {
          return {
            matched: false,
            matchedImgpath: null,
            contact: null,
            similarityScore: null,
            message: null
          };
        }
      }
    }
  }

  async processImagesInFolder(folderPath, outputFolder) {
    await this.loadModel();

    const fileNames = fs.readdirSync(folderPath);

    for (const fileName of fileNames) {
      const imagePath = path.join(folderPath, fileName);
      const faceDescriptors = await this.generateFaceDescriptor(imagePath);

      for (const faceDescriptor of faceDescriptors) {
        const faceLabel = faceDescriptor.label;
        const faceOutputPath = path.join(outputFolder, `${path.parse(fileName).name}.txt`);
        const faceDescriptorText = JSON.stringify(faceDescriptor.descriptor);

        fs.writeFileSync(faceOutputPath, faceDescriptorText);
      }
    }
  }

  async processImagesInFolderToDB(folderPath) {
    await this.loadModel();

    const fileNames = fs.readdirSync(folderPath);

    for (const fileName of fileNames) {
      const imagePath = path.join(folderPath, fileName);
      const faceDescriptors = await this.generateFaceDescriptor(imagePath);
      const contact = path.parse(fileName).name

      for (const faceDescriptor of faceDescriptors) {
        const faceDescriptorText = JSON.stringify(faceDescriptor.descriptor);

        const currentUnixTime = Math.floor(new Date().getTime() / 1000);

        mysqlDb.runQuery(`Insert into facedescriptions (description, contact, operationtime) values(? , ? , ? )`, [faceDescriptorText , contact , currentUnixTime] ,  (err, results) => {
          if (err) {
            console.log('Error executing query:', err);
            res.status(500).send('Error occurred inserting detected face');
            return;
          } else {
            console.log(`Face description eklendi ${contact}`);
          }
        });
      }
    }
  }

}

module.exports = FaceRecognition;