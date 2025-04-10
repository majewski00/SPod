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
    const {
      fileName,
      fileType,
      fileSize,
      parentId,
      encryptedDataKey,
      fileHash,
    } = req.body;

    const maxFileSize = 10485760; // TODO: Move this check to the frontend
    if (fileSize > maxFileSize) {
      return res.status(413).send({ error: "File size exceeds limit" });
    }
    const itemPath = decodeURIComponent(req.body.itemPath);

    const fileId = randomUUID();
    const timestamp = new Date().toISOString();

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            PK: { S: `USER#${res.locals.user.sub}#IN#${parentId}` },
            SK: { S: `ID#${fileId}#TYPE#file` },
            GSI1PK: {
              S: `USER#${res.locals.user.sub}#PATH#${itemPath}`,
            },
            GSI1SK: { S: `NAME#${fileName}` },
            userId: { S: res.locals.user.sub },
            itemName: { S: fileName },
            itemId: { S: fileId },
            parentId: { S: parentId },
            itemPath: { S: itemPath },
            itemType: { S: fileType },
            itemSize: { N: fileSize.toString() },
            createdAt: { S: timestamp },
            updatedAt: { S: timestamp },
            encryptedDataKey: { S: encryptedDataKey },
            fileHash: { S: fileHash },
            itemStatus: { S: "pending" }, // for 'Orphaned Records' search
          },
        })
      );

      res.send({
        url: await generateUploadURL({
          userId: res.locals.user.sub,
          fileId: fileId,
          fileType: fileType,
          fileSize: fileSize,
          fileHash: fileHash,
        }),
        fileId: fileId,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });

  router.get(ROUTES.FILE_DOWNLOAD, async (req, res) => {
    const { fileId } = req.params; // TODO

    console.log(`${ROUTES.FILE_DOWNLOAD} called`);
    console.log("fileId", fileId);
    console.log("user", res.locals.user.name);

    try {
      const downloadURL = await generateDownloadURL({
        userId: res.locals.user.sub,
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
