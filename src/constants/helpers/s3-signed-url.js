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
  fileHash,
  subfolder = "items",
}) => {
  const key = `users/${userId}/${subfolder}/${fileId}`;

  // TODO: RequestHeaders: {'x-amz-meta-auth-token': userSpecificToken}  (?)
  const command = new PutObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME,
    Key: key,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: fileHash,
    // TODO: ServerSideEncryption: "aws:kms",
    Metadata: {
      owner: userId,
      "file-id": fileId,
      size: fileSize.toString(),
      type: fileType,
      hash: fileHash,
    },
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
};

export const generateDownloadURL = async ({
  userId,
  fileId,
  subfolder = "files",
}) => {
  const key = `users/${userId}/${subfolder}/${fileId}`;

  const command = new GetObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME,
    Key: key,
  });

  return await getSignedUrl(s3, command, { expiresIn: 300 });
};
