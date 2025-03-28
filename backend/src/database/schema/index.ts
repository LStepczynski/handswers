import entitiesSchema from "@database/schema/entities";
import usersSchema from "@database/schema/users";
import schoolsSchema from "@database/schema/schools";

export const tables = [entitiesSchema, usersSchema, schoolsSchema];

export type TableSchemas = typeof tables;
