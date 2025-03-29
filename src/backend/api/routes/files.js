import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as ROUTES from "constants/routes";
import {
  generateUploadURL,
  generateDownloadURL,
} from "constants/helpers/s3-signed-url";
import { randomUUID } from "crypto";
import { console } from "inspector";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export default (router) => {
  router.post(ROUTES.FILE_UPLOAD, async (req, res) => {
    const maxFileSize = 10485760; // TODO: Move to environment variable and validate this number to avoid multipart uploads
    if (fileSize > maxFileSize) {
      return res.status(400).send({ error: "File size exceeds limit" });
    }
    const fileId = randomUUID();

    console.log(
      `${ROUTES.FILE_UPLOAD} called\nfileId: ${fileId}\nuserId: ${req.body.userId}`
    );

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            PK: { S: `USER#${req.body.userId}` },
            SK: { S: `FOLDER#${req.body.parentId}#FILE#${fileId}` },
            fileName: { S: req.body.fileName },
            fileId: { S: fileId },
            parentId: { S: req.body.parentId },
            fileType: { S: req.body.fileType },
            fileSize: { N: req.body.fileSize.toString() },
            createdAt: { S: new Date().toISOString() },
            updatedAt: { S: new Date().toISOString() },
          },
        })
      );

      res.send(
        await generateUploadURL({
          userId: req.body.userId,
          fileId: fileId,
          fileType: req.body.fileType,
          fileSize: req.body.fileSize,
        })
      );
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });

  router.get(ROUTES.FILE_DOWNLOAD, async (req, res) => {
    const { fileId } = req.params;
    const userId = req.body.userId; // TODO: get from token

    console.log(`${ROUTES.FILE_DOWNLOAD} called`);
    console.log("fileId", fileId);
    console.log("userId", userId);

    try {
      const downloadURL = await generateDownloadURL({
        userId: userId,
        fileId: fileId,
      });
      res.send(downloadURL);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });

  // TODO: POST - upload thumbnails for a file
};
