
const QRCode = require('qrcode');

class qrCode {
    constructor(tx, fp){
      this.code = this.generateQRCode(tx, fp);

    }

    generateQRCode(text, outputFilePath){
      QRCode.toFile(outputFilePath, text, function (err) {
        if (err) {
          console.error('Error generating QR code:', err);
          return;
        }
        console.log('QR code saved in', outputFilePath);
      }
    )};

}

module.exports = qrCode;



