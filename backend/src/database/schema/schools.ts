import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
} from "@aws-sdk/client-dynamodb";

const entitiesSchema: CreateTableCommandInput = {
  TableName: "Schools",
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "name",
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
  ],
  GlobalSecondaryIndexes: [
    {
      IndexName: "NameIndex",
      KeySchema: [
        {
          AttributeName: "name",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

export default entitiesSchema;
