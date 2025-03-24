import { ApiResponse } from "@type/apiResponse";

import { JwtUser } from "@type/user";

export interface AuthResponse<T> extends ApiResponse<T> {
  status: "success";
  auth: {
    user: JwtUser;
  };
}
