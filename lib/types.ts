export type Tag = {
  id: string;
  name: string;
};

export type Quote = {
  id: string;
  text: string;
  author: string;
  createdAt: string;
  tags: Tag[];
};

export type TagWithCount = Tag & {
  _count: { quotes: number };
};

export type GraphNode = {
  id: string;
  text: string;
  author: string;
  tags: Tag[];
  primaryTag: string | null;
};

export type GraphLink = {
  source: string;
  target: string;
  sharedTags: string[];
};
