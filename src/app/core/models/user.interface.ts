export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

export type AuthResult =
  | {
      success: true;
      user: User;
    }
  | {
      success: false;
      message: string;
    };
