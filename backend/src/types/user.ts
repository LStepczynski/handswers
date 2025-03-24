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

  accountStatus: "disabled" | "demo" | "paid";
  statusExpiration: number;

  roles: string[];
}
