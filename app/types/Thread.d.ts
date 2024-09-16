export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  attachments: Attachment[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}
