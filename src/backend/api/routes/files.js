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
      return res.status(413).send({ error: "File size exceeds limit" });
    }
    const itemPath = decodeURIComponent(req.body.itemPath);

    const fileId = randomUUID();
    const timestamp = new Date().toISOString();

    console.log(
      `${ROUTES.FILE_UPLOAD} called\nfileId: ${fileId}\nUser: ${res.locals.user.name}`
    );

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            PK: { S: `USER#${res.locals.user.sub}` },
            SK: { S: `ID#${fileId}#TYPE#file` },
            GSI1PK: {
              S: `USER#${res.locals.user.sub}#IN#${req.body.parentId}`,
            },
            GSI1SK: { S: `PATH#${itemPath}` },
            userId: { S: res.locals.user.sub },
            itemName: { S: req.body.fileName },
            itemId: { S: fileId },
            parentId: { S: req.body.parentId },
            itemPath: { S: itemPath },
            itemType: { S: req.body.fileType },
            itemSize: { N: req.body.fileSize.toString() },
            createdAt: { S: timestamp },
            updatedAt: { S: timestamp },
          },
        })
      );

      res.send(
        await generateUploadURL({
          userId: res.locals.user.sub,
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
