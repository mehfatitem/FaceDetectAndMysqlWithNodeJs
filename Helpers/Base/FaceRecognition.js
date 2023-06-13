const faceapi = require('face-api.js');
const canvas = require('canvas');
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

/*const tf = require("@tensorflow/tfjs-node");
const cocoSsd = require("@tensorflow-models/coco-ssd");*/

const fs = require('fs');
const path = require('path');

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

  async detectFaces(imagePath) {
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

  async createFaceMatcher(faceDescriptors) {
    const labeledDescriptors = faceDescriptors.map(fd => new faceapi.LabeledFaceDescriptors(fd.label, [fd.descriptor]));
    this.faceMatcher = new faceapi.FaceMatcher(labeledDescriptors);
  }

  async matchFaces(imagePath) {
    if (!this.faceMatcher) {
      throw new Error('Face matcher not initialized. Call createFaceMatcher() first.');
    }

    const detections = await this.detectFaces(imagePath);
    const matches = detections.map(detection => ({
      detection,
      match: this.faceMatcher.findBestMatch(detection.descriptor)
    }));

    return matches;
  }


  async  createDescription(imagePath) {
    await faceapi.nets.ssdMobilenetv1.loadFromDisk('models');
    await faceapi.nets.faceLandmark68Net.loadFromDisk('models');
    await faceapi.nets.faceRecognitionNet.loadFromDisk('models');

    // Load input image
    const image = await canvas.loadImage(imagePath);

    // Detect faces in the image
    const detections = await faceapi.detectAllFaces(image).withFaceLandmarks().withFaceDescriptors();

    // Iterate through each detected face
    detections.forEach(detection => {
      // Access the face descriptor
      //console.dir(detection['descriptor']);

    });

    console.dir(detections);

    return detections;
  }
}

module.exports = FaceRecognition;