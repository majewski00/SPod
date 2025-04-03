import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import * as ROUTES from "constants/routes";
import { randomUUID } from "crypto";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export default (router) => {
  router.post(ROUTES.FOLDER_CREATE, async (req, res) => {
    const folderId = randomUUID();
    const timestamp = new Date().toISOString();

    console.log(
      `${ROUTES.FOLDER_CREATE} called\nfolderId: ${folderId}\nUser: ${res.locals.user.name}`
    );

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            PK: { S: `USER#${res.locals.user.sub}` },
            SK: { S: `ID#${folderId}#TYPE#folder` },
            GSI1PK: {
              S: `USER#${res.locals.user.sub}#IN#${req.body.parentId}`,
            },
            GSI1SK: { S: `UPDATED#${timestamp}#TYPE#folder` },
            userId: { S: res.locals.user.sub },
            itemName: { S: req.body.folderName },
            itemId: { S: folderId },
            parentId: { S: req.body.parentId },
            itemType: { S: "folder" },
            itemSize: { N: "0" },
            createdAt: { S: timestamp },
            updatedAt: { S: timestamp },
          },
        })
      );
      console.log(
        `Folder created successfully with ID: ${folderId}, parentId: ${req.body.parentId}`
      );
      res.send({ folderId });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });

  router.get(ROUTES.FOLDER_LIST_ITEMS, async (req, res) => {
    const { folderId } = req.params;

    console.log(
      `${ROUTES.FOLDER_LIST_ITEMS} called\nfolderId: ${folderId}\nUser: ${res.locals.user.name}`
    );

    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        IndexName: "GSI1",
        KeyConditionExpression: "GSI1PK = :gsi1pk",
        ExpressionAttributeValues: {
          ":gsi1pk": { S: `USER#${res.locals.user.sub}#IN#${folderId}` },
        },
      };
      const data = await ddb.send(new QueryCommand(params));
      res.send(data.Items);
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });

  router.get(ROUTES.FOLDER_THUMBNAILS, async (req, res) => {
    const { folderId } = req.params;
    const { limit = 10, nextToken } = req.query;
    // TODO: implement POST method to upload thumbnail

    console.log(
      `${ROUTES.FOLDER_THUMBNAILS} called\nfolderId: ${folderId}\nUser: ${res.locals.user.name}\nlimit: ${limit}`
    );

    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": { S: `USER#${userId}` },
          ":sk": { S: `FOLDER#${folderId}` },
        },
        Limit: parseInt(limit),
      };

      if (nextToken) {
        params.ExclusiveStartKey = nextToken; // TODO: Decode
      }

      const data = await ddb.send(new QueryCommand(params));
      const items = data.Items.map((item) => ({
        fileId: item.fileId.S, // ? Should return more metadata?
        thumbnailUrl: `https://s3.amazonaws.com/${process.env.S3_STORAGE_BUCKET_NAME}/users/${userId}/thumbnails/${item.fileId.S}`,
        // TODO: they will probably have public access blocked!!
      }));

      res.send({
        items,
        pagination: {
          limit: parseInt(limit),
          count: items.length,
          hasMore: !!data.LastEvaluatedKey,
          nextToken: data.LastEvaluatedKey || null, // TODO: Encode
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).send({ error: "Something went wrong" });
    }
  });
};
