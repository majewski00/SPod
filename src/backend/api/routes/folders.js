import {
  DynamoDBClient,
  PutItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import * as ROUTES from "constants/routes";

const ddb = new DynamoDBClient({
  region: process.env.AWS_REGION,
});

export default (router) => {
  router.post(ROUTES.FOLDER_CREATE, async (req, res) => {
    const folderId = randomUUID();

    console.log(
      `${ROUTES.FOLDER_CREATE} called\nfolderId: ${folderId}\nuserId: ${req.body.userId}`
    );

    try {
      await ddb.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: {
            PK: { S: `USER#${req.body.userId}` },
            SK: { S: `FOLDER#${folderId}` }, // TODO: Maybe there should be a parentId here
            folderName: { S: req.body.folderName },
            folderId: { S: folderId },
            parentId: { S: req.body.parentId },
            createdAt: { S: new Date().toISOString() },
            updatedAt: { S: new Date().toISOString() },
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
    const userId = req.body.userId; // TODO: get from token

    console.log(
      `${ROUTES.FOLDER_LIST_ITEMS} called\nfolderId: ${folderId}\nuserId: ${userId}`
    );

    try {
      const params = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: "PK = :pk and begins_with(SK, :sk)",
        ExpressionAttributeValues: {
          ":pk": { S: `USER#${userId}` },
          ":sk": { S: `FOLDER#${folderId}` }, // TODO: This won't list folders inside the folder
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
    const userId = req.body.userId; // TODO: get from token

    console.log(
      `${ROUTES.FOLDER_THUMBNAILS} called\nfolderId: ${folderId}\nuserId: ${userId}\npage: ${page}\nlimit: ${limit}`
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
        params.ExclusiveStartKey = nextToken; // TODO: Decode (JWT ??)
      }

      const data = await ddb.send(new QueryCommand(params));
      const items = data.Items.map((item) => ({
        fileId: item.fileId.S, // ? Should return more metadata?
        thumbnailUrl: `https://s3.amazonaws.com/${process.env.S3_STORAGE_BUCKET_NAME}/users/${userId}/thumbnails/${item.fileId.S}`,
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
