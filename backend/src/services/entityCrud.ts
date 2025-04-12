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

export class EntityCrud {
  private static TABLE_NAME = "Entities";

  /**
   * Retrieves a single object from the DynamoDB table based on the provided primary and sort key.
   *
   * @param PK - The primary key of the item.
   * @param SK - The sort key of the item.
   * @returns A promise that resolves to the  object if found, or `null` if the object does not exist.
   * @throws InternalError - If an unexpected issue occurs during the retrieval process.
   */
  public static async get(
    PK: string,
    SK: string
  ): Promise<Record<string, any> | null> {
    const params: GetItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        PK: { S: PK },
        SK: { S: SK },
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
        ["getEntity"],
        err
      );
    }
  }

  /**
   * Queries the DynamoDB table for multiple entities based on the provided query parameters.
   *
   * @param params - The query parameters to execute the DynamoDB query.
   * @param page
   * @param limit - How many items are returned
   *
   * @returns A promise that resolves to an array of objects matching the query conditions.
   *          Returns an empty array if no entities are found.
   * @throws InternalError - If an unexpected issue occurs during the query execution.
   */
  public static async query(
    params: Partial<QueryCommandInput>,
    page: number = 1,
    limit: number = 15
  ): Promise<Record<string, any>[]> {
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    let currentPage = 1;
    let items: Record<string, any>[] = [];

    while (currentPage <= page) {
      // Add the table name to the params
      const completeParams: QueryCommandInput = {
        TableName: this.TABLE_NAME,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ...params,
      };

      try {
        const resp = await client.send(new QueryCommand(completeParams));

        // Return the objects
        if (currentPage === page) {
          items = resp.Items?.map((item: any) => unmarshall(item)) || [];
        }

        lastEvaluatedKey = resp.LastEvaluatedKey;
        currentPage++;

        if (!lastEvaluatedKey) break; // No more pages
      } catch (err) {
        // Throw an internal error if there was an unexpected problem
        throw new InternalError(
          "Error while fetching the objects from the database",
          500,
          ["queryEntities"],
          err
        );
      }
    }

    return items;
  }

  /**
   * Updates an entity record in the database by `PK` and `SK` with the specified `updates`.
   * Dynamically constructs the update expressions for efficient database updates.
   *
   * @param {string} PK - The primary key.
   * @param {string} SK - The secondary key.
   * @param {Record<string, any>} updates - An object containing the fields to update and their new values.
   * @throws {InternalError} - If the database update operation fails.
   * @returns {Promise<Record<string, any> | null>} - The updated entity object, or `null` if no updates were applied.
   */
  public static async update(
    PK: string,
    SK: string,
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
      Key: { PK: { S: PK }, SK: { S: SK } },
      UpdateExpression: updateExpression.slice(0, -1), // Remove trailing comma
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
      ConditionExpression: "attribute_exists(PK)",
    };

    // Send request
    try {
      const response = await client.send(new UpdateItemCommand(params));
      return unmarshall(response.Attributes!);
    } catch (err) {
      throw new InternalError(
        "Failed to update the item in the database.",
        500,
        ["updateEntity"],
        err
      );
    }
  }

  /**
   * Creates an Entity object and adds it to the database
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
        ["createEntity"],
        err
      );
    }
  }

  /**
   * Deletes an entity record from the database by the PK and SK.
   * Returns the deleted entity data if the deletion was successful.
   *
   * @param {string} PK - The primary key.
   * @param {string} SK - The secondary key.
   * @throws {InternalError} - If an error occurs during the deletion operation.
   * @returns {Promise<Record<string, any> | null>} - The deleted entity object, or `null` if the object did not exist.
   */
  public static async delete(
    PK: string,
    SK: string
  ): Promise<Record<string, any> | null> {
    const params: DeleteItemCommandInput = {
      TableName: this.TABLE_NAME,
      Key: {
        PK: { S: PK },
        SK: { S: SK },
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
        ["deleteEntity"],
        err
      );
    }
  }

  public static async batchDelete(
    keys: { PK: string; SK: string }[]
  ): Promise<void> {
    const MAX_BATCH_SIZE = 25;
    const MAX_RETRIES = 5;
    const INITIAL_DELAY_MS = 100; // starting delay in milliseconds

    // Process keys in chunks of 25
    for (let i = 0; i < keys.length; i += MAX_BATCH_SIZE) {
      let chunk = keys.slice(i, i + MAX_BATCH_SIZE);
      let retries = 0;
      let unprocessed: any[] = [];

      do {
        // Map the chunk to delete requests
        const requestItems = chunk.map((key) => ({
          DeleteRequest: {
            Key: {
              PK: { S: key.PK },
              SK: { S: key.SK },
            },
          },
        }));

        const params: BatchWriteItemCommandInput = {
          RequestItems: {
            [this.TABLE_NAME]: requestItems,
          },
        };

        try {
          const response = await client.send(new BatchWriteItemCommand(params));
          // Check for unprocessed items in the response
          unprocessed = response.UnprocessedItems?.[this.TABLE_NAME] || [];

          if (unprocessed.length > 0) {
            // Prepare the keys for the next retry from unprocessed items
            chunk = unprocessed.map((item: any) => {
              const key = item.DeleteRequest.Key;
              return { PK: key.PK.S, SK: key.SK.S };
            });
            retries++;
            // Exponential backoff delay
            const delayTime = INITIAL_DELAY_MS * Math.pow(2, retries);
            await new Promise((resolve) => setTimeout(resolve, delayTime));
          } else {
            break; // All items processed successfully
          }
        } catch (err) {
          throw new InternalError(
            "Error while batch deleting from the database",
            500,
            ["batchDeleteEntities"],
            err
          );
        }
      } while (retries < MAX_RETRIES);

      if (unprocessed.length > 0) {
        console.warn(
          `Batch delete: ${unprocessed.length} items failed to delete after ${MAX_RETRIES} retries.`
        );
      }
    }
  }
}
