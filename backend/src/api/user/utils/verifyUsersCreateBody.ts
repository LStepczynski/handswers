// UUID v4 regex
const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Google email pattern (supports Workspace domains)
const googleEmailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|org|edu|net)$/;

// Allowed user types
const validUserTypes = ["student", "teacher"];

export function verifyUsersCreateBody(body: any): {
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

  // Validate userList
  if (!Array.isArray(body.userList)) {
    errors.push("userList must be an array.");
  } else {
    const invalidEmails = body.userList.filter(
      (email: any) => typeof email !== "string" || !googleEmailRegex.test(email)
    );

    if (invalidEmails.length > 0) {
      errors.push(`Invalid email addresses: ${invalidEmails.join(", ")}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
