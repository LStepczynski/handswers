export interface GoogleUser {
  id: string;
  email: string;
  name: string;
  picture: string;
}

export interface JwtUser extends Omit<GoogleUser, "id"> {
  roles: string[];
}

export interface User extends GoogleUser {
  createdAt: number;

  enabled: boolean;
  accountExpiration: number;

  roles: string[];
}

export interface DBUser {
  id: string;
  email: string;

  type: "student" | "teacher" | "other";
  school: string;

  createdAt: number;

  enabled: boolean;
  accountExpiration: number;

  roles: string[];
}
