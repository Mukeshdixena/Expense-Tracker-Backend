const AWS = require('aws-sdk');



const s3 = new AWS.S3({
    accessKeyId: process.env.IAM_USER_KEY,
    secretAccessKey: process.env.IAM_USER_SECRET_KEY,
});

function uploadToS3(data, fileName) {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: fileName,
        Body: Buffer.from(data),
        ACL: 'public-read'
    };

    return new Promise((resolve, reject) => {
        s3.upload(params, (err, s3Response) => {
            if (err) {
                console.error('S3 Upload Error:', err);
                reject(err);
            } else {
                console.log("Upload successful:", s3Response.Location);
                resolve(s3Response.Location);
            }
        });
    });
}

module.exports = { uploadToS3 };