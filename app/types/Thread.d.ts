export interface Thread {
  id: string;
  title: string;
  content: string;
  authorId: string;
  attachments: Attachment[];
  comments: ThreadComment[];
  status: "open" | "closed";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
}

export interface ThreadComment {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  isAdmin: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
