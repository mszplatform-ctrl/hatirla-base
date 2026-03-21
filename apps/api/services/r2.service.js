/**
 * R2 Service
 * Uploads images to Cloudflare R2 and returns public URLs
 */

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

/**
 * Upload a base64 image (data URI or raw base64) to R2.
 * @param {string} base64Image - data URI like "data:image/jpeg;base64,..." or raw base64
 * @param {string} shareId     - unique filename (without extension)
 * @returns {Promise<string>}  - public URL of the uploaded image
 */
async function uploadImage(base64Image, shareId) {
  // Strip data URI prefix if present
  const matches = base64Image.match(/^data:(image\/\w+);base64,(.+)$/);
  const contentType = matches ? matches[1] : 'image/jpeg';
  const rawBase64 = matches ? matches[2] : base64Image;
  const buffer = Buffer.from(rawBase64, 'base64');

  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: `${shareId}.jpg`,
    Body: buffer,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000',
  }));

  return `${process.env.R2_PUBLIC_URL}/${shareId}.jpg`;
}

module.exports = { uploadImage };
