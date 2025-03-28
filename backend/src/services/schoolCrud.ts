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
  ScanCommandInput,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

import { getUnixTimestamp, InternalError } from "@utils/index";

import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { client } from "@database/dynamodb";

export class SchoolCrud {
  private static TABLE_NAME = "Schools";

  /**
   * Fetches schools with pagination using page number and limit
   * @param page - Page number (1-based index)
   * @param limit - Number of items per page
   * @returns An array of school records
   */
  public static async getAll(
    page: number = 1,
    limit: number = 10
  ): Promise<Record<string, any>[]> {
    let lastEvaluatedKey: Record<string, any> | undefined = undefined;
    let currentPage = 1;
    let items: Record<string, any>[] = [];

    while (currentPage <= page) {
      const params: ScanCommandInput = {
        TableName: this.TABLE_NAME,
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
      };

      try {
        const resp = await client.send(new ScanCommand(params));

        if (currentPage === page) {
          items = resp.Items?.map((item: any) => unmarshall(item)) || [];
        }

        lastEvaluatedKey = resp.LastEvaluatedKey;
        currentPage++;

        if (!lastEvaluatedKey) break; // Reached end of data
      } catch (err) {
        throw new InternalError(
          "Error while fetching schools from the database",
          500,
          ["getAllPaginated"],
          err
        );
      }
    }

    return items;
  }

  /**
   * Retrieves a single object from the DynamoDB table based on the provided id.
   *
   * @param id - The school unique id
   * @returns A promise that resolves to the object if found, or `null` if the object does not exist.
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
        ["getSchoolById"],
        err
      );
    }
  }

  /**
   * Retrieves a objects from the DynamoDB table based on the provided name.
   *
   * @param name - The school name
   * @returns A promise that resolves to the object if found, or `null` if the object does not exist.
   * @throws InternalError - If an unexpected issue occurs during the retrieval process.
   */
  public static async getByName(name: string): Promise<Record<string, any>[]> {
    const params: QueryCommandInput = {
      TableName: this.TABLE_NAME,
      IndexName: "NameIndex",
      KeyConditionExpression: "name = :n",
      ExpressionAttributeValues: {
        ":n": { S: name },
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
        ["getSchoolByName"],
        err
      );
    }
  }

  /**
   * Queries the DynamoDB table for multiple schools based on the provided query parameters.
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

      // Return an empty array if no schools found
      return [];
    } catch (err) {
      // Throw an internal error if there was an unexpected problem
      throw new InternalError(
        "Error while fetching the objects from the database",
        500,
        ["querySchools"],
        err
      );
    }
  }

  /**
   * Updates a school record in the database by id with the specified `updates`.
   * Dynamically constructs the update expressions for efficient database updates.
   *
   * @param {string} id - The school id
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
        ["updateSchool"],
        err
      );
    }
  }

  /**
   * Creates a school object and adds it to the database
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
        ["createSchool"],
        err
      );
    }
  }

  /**
   * Deletes a school record from the database by the id.
   * Returns the deleted school data if the deletion was successful.
   *
   * @param {string} id - The school id
   * @throws {InternalError} - If an error occurs during the deletion operation.
   * @returns {Promise<Record<string, any> | null>} - The deleted school object, or `null` if the school did not exist.
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
        ["deleteSchool"],
        err
      );
    }
  }
}
