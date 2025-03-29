import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

export const generateUploadURL = async ({
  userId,
  fileId,
  fileType,
  fileSize,
}) => {
  const key = `users/${userId}/${fileId}`;

  const command = new PutObjectCommand({
    Bucket: process.env.bucketName, // TODO: bucketName
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    Metadata: {
      "x-amz-meta-owner": userId,
      "x-amz-meta-file-id": fileId,
      "x-amz-meta-size": fileSize.toString(),
    },
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
};

export const generateDownloadURL = async ({ userId, fileId }) => {
  const key = `users/${userId}/${fileId}`;

  const command = new GetObjectCommand({
    Bucket: process.env.bucketName, // TODO: bucketName
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
};
