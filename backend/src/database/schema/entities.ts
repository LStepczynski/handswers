import {
  CreateTableCommandInput,
  ScalarAttributeType,
  ProjectionType,
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
    {
      AttributeName: "teacherId",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "active",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "roomId",
      AttributeType: ScalarAttributeType.S,
    },
    {
      AttributeName: "roomCode",
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
  GlobalSecondaryIndexes: [
    {
      IndexName: "TeacherActiveRooms",
      KeySchema: [
        { AttributeName: "teacherId", KeyType: "HASH" },
        { AttributeName: "active", KeyType: "RANGE" },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: "ActiveRoomCodeIndex",
      KeySchema: [
        { AttributeName: "roomCode", KeyType: "HASH" },
        { AttributeName: "active", KeyType: "RANGE" },
      ],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
    {
      IndexName: "MessageRoomIdIndex",
      KeySchema: [{ AttributeName: "roomId", KeyType: "HASH" }],
      Projection: {
        ProjectionType: ProjectionType.ALL,
      },
    },
  ],
  BillingMode: "PAY_PER_REQUEST",
};

export default entitiesSchema;
