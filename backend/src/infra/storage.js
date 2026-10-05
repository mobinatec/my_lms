const { S3Client, HeadBucketCommand, CreateBucketCommand } = require('@aws-sdk/client-s3');

let client = null;

function isS3Enabled() {
  return (process.env.STORAGE_PROVIDER || 'local').toLowerCase() === 's3';
}

function getStorage() {
  if (!isS3Enabled()) return null;
  if (!client) {
    client = new S3Client({
      region: process.env.S3_REGION || 'us-east-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      credentials: process.env.S3_ACCESS_KEY
        ? { accessKeyId: process.env.S3_ACCESS_KEY, secretAccessKey: process.env.S3_SECRET_KEY || '' }
        : undefined,
    });
  }
  return client;
}

async function ensureBucket() {
  if (!isS3Enabled()) return true;
  const bucket = process.env.S3_BUCKET || 'codesazan-media';
  try {
    await getStorage().send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    if ([403, 404].includes(error?.$metadata?.httpStatusCode)) {
      await getStorage().send(new CreateBucketCommand({ Bucket: bucket }));
      return true;
    }
    throw error;
  }
  return true;
}

async function checkStorage() {
  return ensureBucket();
}

module.exports = { getStorage, ensureBucket, checkStorage, isS3Enabled };
