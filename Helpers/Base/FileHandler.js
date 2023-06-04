const fs = require('fs');

class FileHandler {

  removeDownloadImages(filePath) {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('File does not exist');
      } else {
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Error deleting file:', err);
          } else {
            console.log('File deleted:', filePath);
          }
        });
      }
    });
  }

  imageToBase64(imagePath) {
    try {
      const image = fs.readFileSync(imagePath);
      const base64Image = Buffer.from(image).toString('base64');
      return base64Image;
    } catch (error) {
      console.error('Error converting image to Base64:', error);
      return null;
    }
  }

}

module.exports = FileHandler;