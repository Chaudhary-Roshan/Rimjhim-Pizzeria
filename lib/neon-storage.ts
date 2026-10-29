import { S3Client, ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3";

/**
 * Neon Object Storage Client (S3-compatible)
 * Uses AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_ENDPOINT_URL_S3, and AWS_REGION
 */

export function getNeonS3Client(): S3Client {
  const endpoint = process.env.AWS_ENDPOINT_URL_S3;
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || "ap-southeast-1";

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error("Neon Object Storage S3 credentials not configured in environment variables.");
  }

  return new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle: true,
  });
}

export async function uploadToNeonStorage(
  bucketName: string,
  key: string,
  content: string | Buffer,
  contentType: string = "text/plain"
) {
  const client = getNeonS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: typeof content === "string" ? Buffer.from(content) : content,
    ContentType: contentType,
  });

  return await client.send(command);
}

export async function listNeonStorageObjects(bucketName: string) {
  const client = getNeonS3Client();
  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    MaxKeys: 20,
  });

  const response = await client.send(command);
  return response.Contents || [];
}

