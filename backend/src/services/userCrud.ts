import {
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  UpdateItemCommandInput,
  QueryCommand,
  PutItemCommandInput,
  GetItemCommandInput,
  DeleteItemCommandInput,
  DeleteItemCommand,
  QueryCommandInput,
  BatchWriteItemCommandInput,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";

import { getUnixTimestamp, InternalError } from "@utils/index";

import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "@database/dynamodb";

export class UserCrud {
  private static TABLE_NAME = "Users";

  /**
   * Retrieves a single object from the DynamoDB table based on the provided id.
   *
   * @param id - The user unique id
   * @returns A promise that resolves to the  object if found, or `null` if the object does not exist.
   * @throws InternalError - If an unexpected issue occurs during the retrieval process.
   */
  public static async getById(id: string): Promise<Record<string, any> | null> {
    const params: GetItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        id: { S: id },
      },
    };

    try {
      // Send request
      const resp = await client.send(new GetItemCommand(params));

      // Return the item if found
      if (resp.Item) {
        return unmarshall(resp.Item);
      }

      return null;
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        "Error while fetching the object from the database",
        500,
        ["getUserById"],
        err
      );
    }
  }

  /**
   * Retrieves a objects from the DynamoDB table based on the provided email.
   *
   * @param email - The user email
   * @returns A promise that resolves to the  object if found, or `null` if the object does not exist.
   * @throws InternalError - If an unexpected issue occurs during the retrieval process.
   */
  public static async getByEmail(
    email: string
  ): Promise<Record<string, any>[]> {
    const params: QueryCommandInput = {
      TableName: this.TABLE_NAME,
      IndexName: "EmailIndex",
      KeyConditionExpression: "email = :e",
      ExpressionAttributeValues: {
        ":e": { S: email },
      },
    };

    try {
      const resp = await client.send(new QueryCommand(params));

      // Return the objects
      if (resp.Items && resp.Items.length > 0) {
        return resp.Items.map((item) => unmarshall(item));
      }

      // Return an empty array if no entities found
      return [];
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        "Error while fetching the object from the database",
        500,
        ["getUserByEmail"],
        err
      );
    }
  }

  public static async getBySchoolAndType(
    school: string,
    type: "student" | "teacher",
    page: number = 1,
    limit: number = 10
  ): Promise<Record<string, any>[]> {
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    let currentPage = 1;
    let items: Record<string, any>[] = [];

    while (currentPage <= page) {
      const params: QueryCommandInput = {
        TableName: this.TABLE_NAME,
        IndexName: "SchoolIndex",
        KeyConditionExpression: "school = :school AND #type = :type",
        ExpressionAttributeNames: {
          "#type": "type",
        },
        ExpressionAttributeValues: {
          ":school": { S: school },
          ":type": { S: type },
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      const resp = await client.send(new QueryCommand(params));

      if (currentPage === page) {
        items = resp.Items?.map((item: any) => unmarshall(item)) || [];
      }

      lastEvaluatedKey = resp.LastEvaluatedKey;
      currentPage++;

      if (!lastEvaluatedKey) break; // No more pages
    }

    return items;
  }

  /**
   * Queries the DynamoDB table for multiple users based on the provided query parameters.
   *
   * @param params - The query parameters to execute the DynamoDB query.
   *
   * @returns A promise that resolves to an array of objects matching the query conditions.
   *          Returns an empty array if no users are found.
   * @throws InternalError - If an unexpected issue occurs during the query execution.
   */
  public static async query(
    params: Partial<QueryCommandInput>
  ): Promise<Record<string, any>[]> {
    // Add the table name to the params
    const completeParams: QueryCommandInput = {
      TableName: this.TABLE_NAME,
      ...params,
    };

    try {
      const resp = await client.send(new QueryCommand(completeParams));

      // Return the objects
      if (resp.Items && resp.Items.length > 0) {
        return resp.Items.map((item) => unmarshall(item));
      }

      // Return an empty array if no users found
      return [];
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        "Error while fetching the objects from the database",
        500,
        ["queryUsers"],
        err
      );
    }
  }

  /**
   * Updates a user record in the database by id with the specified `updates`.
   * Dynamically constructs the update expressions for efficient database updates.
   *
   * @param {string} id - The user id
   * @param {Record<string, any>} updates - An object containing the fields to update and their new values.
   * @throws {InternalError} - If the database update operation fails.
   * @returns {Promise<Record<string, any> | null>} - The updated object, or `null` if no updates were applied.
   */
  public static async update(
    id: string,
    updates: Record<string, any>
  ): Promise<Record<string, any> | null> {
    // Check if `updates` is empty
    const updateKeys = Object.keys(updates);
    if (updateKeys.length === 0) return null;

    // Prepare the UpdateCommand
    let updateExpression = "SET";
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Build UpdateExpression and ExpressionAttributeValues dynamically
    updateKeys.forEach((key, index) => {
      const attributePlaceholder = `#attr${index}`;
      const valuePlaceholder = `:val${index}`;

      // Append to UpdateExpression
      updateExpression += ` ${attributePlaceholder} = ${valuePlaceholder},`;

      // Add to ExpressionAttributeNames
      expressionAttributeNames[attributePlaceholder] = key;

      // Use marshall to convert the value dynamically
      const marshalledValue = marshall({ value: updates[key] }); // Wrap in object
      expressionAttributeValues[valuePlaceholder] = marshalledValue.value; // Extract formatted value
    });

    const params: UpdateItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: { id: { S: id } },
      UpdateExpression: updateExpression.slice(0, -1), // Remove trailing comma
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    // Send request
    try {
      const response = await client.send(new UpdateItemCommand(params));
      return unmarshall(response.Attributes!);
    } catch (err) {
      throw new InternalError(
        "Failed to update the item in the database.",
        500,
        ["updateUser"],
        err
      );
    }
  }

  /**
   * Creates an user object and adds it to the database
   * @public
   * @static
   * @param {Record<string, any>} partialObject
   * @returns {Promise<User>}
   */
  public static async create(
    partialObject: Record<string, any>
  ): Promise<Record<string, any>> {
    const currentTime = getUnixTimestamp();

    // Fill in missing fields with defaults
    const finishedObject = {
      createdAt: currentTime,
      ...partialObject,
    };

    // Request params
    const params: PutItemCommandInput = {
      TableName: this.TABLE_NAME,
      Item: marshall(finishedObject),
    };

    try {
      await client.send(new PutItemCommand(params));
      return finishedObject;
    } catch (err) {
      throw new InternalError(
        "Addition to the database failed",
        500,
        ["createUser"],
        err
      );
    }
  }

  public static async createMany(
    partialObjects: Record<string, any>[]
  ): Promise<Record<string, any>[]> {
    const currentTime = getUnixTimestamp();

    // Prepare finished items with defaults
    const finishedObjects = partialObjects.map((obj) => ({
      createdAt: currentTime,
      ...obj,
    }));

    // DynamoDB allows max 25 items per batch
    const batches = [];
    for (let i = 0; i < finishedObjects.length; i += 25) {
      batches.push(finishedObjects.slice(i, i + 25));
    }

    try {
      for (const batch of batches) {
        const params: BatchWriteItemCommandInput = {
          RequestItems: {
            [this.TABLE_NAME]: batch.map((item) => ({
              PutRequest: {
                Item: marshall(item),
              },
            })),
          },
        };

        await client.send(new BatchWriteItemCommand(params));
      }

      return finishedObjects;
    } catch (err) {
      throw new InternalError(
        "Batch addition to the database failed",
        500,
        ["createManyUsers"],
        err
      );
    }
  }

  /**
   * Deletes an user record from the database by the id.
   * Returns the deleted user data if the deletion was successful.
   *
   * @param {string} id - The user id
   * @throws {InternalError} - If an error occurs during the deletion operation.
   * @returns {Promise<Record<string, any> | null>} - The deleted user object, or `null` if the user did not exist.
   */
  public static async delete(id: string): Promise<Record<string, any> | null> {
    const params: DeleteItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        id: { S: id },
      },
      ReturnValues: "ALL_OLD",
    };

    try {
      const response = await client.send(new DeleteItemCommand(params));
      if (response.Attributes) {
        return unmarshall(response.Attributes);
      }
      return null;
    } catch (err) {
      throw new InternalError(
        "Error while deleting from the databse",
        500,
        ["deleteUser"],
        err
      );
    }
  }
}
