const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validUserTypes = ["student", "teacher"];

export function verifyUsersGetBody(body: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate schoolId
  if (typeof body.schoolId !== "string" || !uuidRegex.test(body.schoolId)) {
    errors.push("Invalid or missing schoolId. Must be a valid UUID.");
  }

  // Validate userType
  if (
    typeof body.userType !== "string" ||
    !validUserTypes.includes(body.userType)
  ) {
    errors.push(
      `Invalid or missing userType. Must be one of: ${validUserTypes.join(
        ", "
      )}`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
