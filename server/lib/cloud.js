
const fs = require('fs');
const AWS = require('aws-sdk');
const aws = new AWS.S3();
const path = require('path');

module.exports = class FileUploads {
    constructor(bucketName, basePath) {
        this.bucketName = bucketName;
        this.basePath = basePath;
    }

    /**
     * Path to filename to upload
     * @param {string} pathName
     */
    upload(pathName) {
        const fileName = path.basename(pathName);
        const keyName = `${this.basePath}/${fileName}`;

        return new Promise((resolve, reject) => {
            const readStream = fs.createReadStream(pathName);
            const params = {
                Bucket: this.bucketName,
                Key: keyName,
                Body: readStream
            };

            readStream.on('error', (err) => reject(err.message));

            aws.upload(params, (err, data) => {
                // reject on failure
                if (err) {
                    reject(err.message);
                    return;
                }

                resolve(data);
            });
        });
    }
};
