const os = require('os');
const path = require('path');

function getDownloadPath() {
  // Get the user's home directory
  const homeDirectory = os.homedir();

  // Determine the downloads folder path based on the operating system
  let downloadsPath;
  if (process.platform === 'win32') {
    downloadsPath = path.join(homeDirectory, 'Downloads');
  } else if (process.platform === 'darwin') {
    downloadsPath = path.join(homeDirectory, 'Downloads');
  } else {
    downloadsPath = path.join(homeDirectory, 'Downloads');
  }

  return downloadsPath;
}

let downloadsPath = getDownloadPath();

const faceDetectServiceUrl = "http://localhost:5000/api/operations";
const faceFolderPath = `${downloadsPath}/yuzler`;
const descFilePath = `${downloadsPath}/yuzler_description`;
const distanceThreshold = 0.48; // Define a threshold value to determine if the faces are a match

module.exports = {
  faceDetectServiceUrl,
  faceFolderPath , 
  descFilePath,
  distanceThreshold
};
