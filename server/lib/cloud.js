
const fs = require('fs');
const AWS = require('aws-sdk');
AWS.config.update({region:'us-east-1'});

const s3 = new AWS.S3();
const sns = new AWS.SNS();
const path = require('path');
const config = require('../config.json');

module.exports = class CloudUtils {
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

            s3.upload(params, (err, data) => {
                // reject on failure
                if (err) {
                    reject(err.message);
                    return;
                }

                resolve(data);
            });
        });
    }

    /**
     * Registers mobile enpoint with AWS SNS service
     * @param {string} tokenId - token or registration id supplied by notification service
     * @param {string} platformType - mobile platform (iOS or Android)
     */
    registerEndPoint(tokenId, platformType) {
        const params = {
            PlatformApplicationArn: config.iosAwsApplicationArn,
            Token: tokenId,
            CustomUserData: platformType
        };

        // TODO: determine a better method to distinguish token id's
        if (tokenId.length > 80) {
            // android registration ids are longer than APNS tokens
            params.PlatformApplicationArn = config.androidAwsApplicationArn;
            params.CustomUserData = 'android';
        }

        return new Promise((resolve, reject) => {
            sns.createPlatformEndpoint(params, function(err, data) {
                var subscribeParams = {
                    Protocol: 'application',
                    TopicArn: config.awsTopicArn
                };

                if (err) {
                    reject(err.message);
                } else {
                    // assing mobile endpoint
                    subscribeParams.Endpoint = data.EndpointArn;

                    // subscribe endpoint to topic
                    sns.subscribe(subscribeParams, function (err, subscribeData) {
                        if (err) {
                            console.log('Failed to subscribe');
                            reject(err.message);
                        } else {
                            // returns subscribeData.SubscriptionArn
                            resolve(subscribeData);
                        }
                    });
                }
            });
        });
    }

    /**
     * Publish a message to an SNS topic
     * @param {string} topicArn - SNS topic ARN
     * @param {string} message - message to publish
     * @param {string} title - optional title message to publish
     */
    publishToTopic(topicArn, message, title) {
        function genAPNSMsg(msg, title) {
            var obj = {
                aps: {
                    alert: {
                        body: msg
                    },
                    badge: 1,
                    sound: 'default'
                }
            };

            if (title) {
                obj.aps.alert.title = title;
            }

            return JSON.stringify(obj);
        }

        function genGCMMsg(msg, title) {
            var obj = {
                data: {
                    message: msg
                }
            };

            if (title) {
                obj.data.title = title;
            }

            return JSON.stringify(obj);
        }

        return new Promise((resolve, reject) => {
            var params = {
                MessageStructure: 'json',
                Message: JSON.stringify({
                    default: message,
                    APNS: genAPNSMsg(message, title),
                    APNS_SANDBOX: genAPNSMsg(message, title),
                    GCM: genGCMMsg(message, title)
                }),
                TopicArn: topicArn
            };

            // publish message to SNS topic
            sns.publish(params, function(err, data) {
                if (err) {
                    reject(err.message);
                } else {
                    resolve(data);
                }
            });
        });

    }
};
