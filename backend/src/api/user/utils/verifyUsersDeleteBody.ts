const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function verifyUsersDeleteBody(body: any): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate id
  if (typeof body.id !== "string" || !uuidRegex.test(body.id)) {
    errors.push("Invalid or missing id. Must be a valid UUID.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
