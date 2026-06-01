export type PostAuthor = {
  _id?: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
} | null;

export type FeedPost = {
  _id: string;
  content: string;
  imageUrl?: string;
  topic?: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  author: PostAuthor;
};

export type DiscoverPost = FeedPost;

export type ConvexUser = {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  skills?: string[];
};
