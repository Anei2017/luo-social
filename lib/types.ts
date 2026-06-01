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
  hashtags?: string[];
  language?: string;
  createdAt: number;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  myReaction?: string | null;
  poll?: {
    options: string[];
    counts: number[];
    total: number;
    myVote?: number;
    pollEndsAt?: number;
  } | null;
  author: PostAuthor;
};

export type DiscoverPost = FeedPost;

export type ConvexUser = {
  _id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  skills?: string[];
  clan?: string;
  hometown?: string;
  interests?: string[];
  language?: string;
};
