import {
  CreateTableCommandInput,
  ScalarAttributeType,
} from "@aws-sdk/client-dynamodb";

const entitiesSchema: CreateTableCommandInput = {
  TableName: "Entities",
  AttributeDefinitions: [
    {
      AttributeName: "PK",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "SK",
      AttributeType: ScalarAttributeType.S,
    },
  ],
  KeySchema: [
    {
      AttributeName: "PK",
      KeyType: "HASH",
    },
    {
      AttributeName: "SK",
      KeyType: "RANGE",
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

export default entitiesSchema;
