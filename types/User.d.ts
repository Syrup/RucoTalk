export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  password: string;
  emailVerified: boolean;
  image: string;
  roles: string[];
  bio: string;
  signature: string;
  url: string;
  extendedData: {
    [key: any]: any;
  };
  isLoggedIn: boolean;
}
