import { Account, Client, ID } from "appwrite";

const client = new Client();
client
  // .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67176ba8001fcd33e841");

export { client };
export const account = new Account(client);
export { ID };

async function login(email: string, password: string) {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

async function logout() {
  await account.deleteSession("current");
}

async function register(email: string, password: string, name: string) {
  await account.create(ID.unique(), email, password, name);
}

export { login, logout, register };
