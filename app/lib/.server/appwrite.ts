import { Client } from "node-appwrite";

export const adminClient = new Client();

adminClient
  // .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67176ba8001fcd33e841")
  .setKey(
    "standard_caa1c980343c3ebb791b637cbbbe9ee44fb3e0f34f73ad16c1fddafbbf9b72c714c32f20005dc06fe471027d5c9e8b7eeecda04a7fc9dee3aff88f5c3baa050e0374d0be47476f19d41d687e4a0b1608e43a59afa57df4b2533e582293e7920e208aa7383f09735f2b88fef95163079cb26c49c4f97e25af26b6e92c3ef3bc17"
  );
