import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import * as ROUTES from "constants/routes";
import {
  generateUploadURL,
  generateDownloadURL,
} from "constants/helpers/s3-signed-url";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export default (router) => {
  router.post(ROUTES.THUMBNAIL_UPLOAD, async (req, res) => {
    const {
      fileId,
      parentId,
      thumbName,
      thumbSize,
      thumbType,
      thumbHash,
      encryptedDataKey,
    } = req.body;

    const timestamp = new Date().toISOString();
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Item: {
        PK: { S: `USER#${res.locals.user.sub}#FOR#${fileId}` },
        SK: { S: `TYPE#thumbnail` },
        userId: { S: res.locals.user.sub },
        itemId: { S: fileId },
        parentId: { S: parentId },
        itemName: { S: thumbName },
        itemSize: { N: thumbSize.toString() },
        itemType: { S: thumbType },
        itemHash: { S: thumbHash },
        encryptedDataKey: { S: encryptedDataKey },
        createdAt: { S: timestamp },
        updatedAt: { S: timestamp },
        itemStatus: { S: "pending" },
      },
    };

    try {
      await ddb.send(new PutItemCommand(params));
      const uploadURL = await generateUploadURL({
        userId: res.locals.user.sub,
        fileId,
        fileType: thumbType,
        fileSize: thumbSize,
        fileHash: thumbHash,
        subfolder: "thumbnails",
      });
      res.send({ uploadURL });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });
};
