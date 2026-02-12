const {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3');

const { Upload } = require('@aws-sdk/lib-storage');

require('dotenv').config();

/* ===============================
   CLIENTE S3
=============================== */

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.IAM_USER_KEY,
        secretAccessKey: process.env.IAM_USER_SECRET
    }
});

/* ===============================
   EXPORTS
=============================== */

module.exports = {

    /* ===============================
       STREAM UPLOAD
    =============================== */

    async uploadStreamToS3(stream, key) {

        console.log('\n☁️ S3 STREAM upload');
        console.log('Bucket:', process.env.BUCKET_NAME);
        console.log('Key:', key);

        const start = Date.now();

        try {

            const upload = new Upload({
                client: s3,
                params: {
                    Bucket: process.env.BUCKET_NAME,
                    Key: key,
                    Body: stream
                }
            });

            upload.on('httpUploadProgress', p => {
                if (p.loaded)
                    console.log(`⬆️ ${p.loaded} bytes`);
            });

            const result = await upload.done();

            console.log(
                `✅ STREAM OK (${Date.now() - start}ms)`
            );

            return { error: false, data: result };

        } catch (err) {

            console.error('🔥 STREAM ERRO:', err);

            return {
                error: true,
                message: err.message
            };
        }
    },

    /* ===============================
       BUFFER UPLOAD
    =============================== */

    async uploadBufferToS3(buffer, key, mime) {

        console.log('\n☁️ S3 BUFFER upload');
        console.log('Bucket:', process.env.BUCKET_NAME);
        console.log('Key:', key);
        console.log('Size:', buffer.length);

        const start = Date.now();

        try {

            const cmd = new PutObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: key,
                Body: buffer,
                ContentType: mime
            });

            const result = await s3.send(cmd);

            console.log(
                `✅ BUFFER OK (${Date.now() - start}ms)`
            );

            return { error: false, data: result };

        } catch (err) {

            console.error('🔥 BUFFER ERRO:', err);

            return {
                error: true,
                message: err.message
            };
        }
    },

    /* ===============================
       DELETE S3
    =============================== */

    async deleteFromS3(key) {

        console.log('\n S3 DELETE');
        console.log('Bucket:', process.env.BUCKET_NAME);
        console.log('Key:', key);

        const start = Date.now();

        try {

            const cmd = new DeleteObjectCommand({
                Bucket: process.env.BUCKET_NAME,
                Key: key
            });

            const result = await s3.send(cmd);

            console.log(
                `✅ DELETE OK (${Date.now() - start}ms)`
            );

            return { error: false, data: result };

        } catch (err) {

            console.error('🔥 DELETE ERRO:', err);

            return {
                error: true,
                message: err.message
            };
        }
    }
};
