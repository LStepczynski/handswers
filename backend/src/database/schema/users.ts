import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
} from "@aws-sdk/client-dynamodb";

const entitiesSchema: CreateTableCommandInput = {
  TableName: "Users",
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "email",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "school",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "type",
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
      IndexName: "EmailIndex",
      KeySchema: [
        {
          AttributeName: "email",
          KeyType: "HASH",
        },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: "SchoolIndex",
      KeySchema: [
        {
          AttributeName: "school",
          KeyType: "HASH",
        },
        {
          AttributeName: "type",
          KeyType: "RANGE",
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
