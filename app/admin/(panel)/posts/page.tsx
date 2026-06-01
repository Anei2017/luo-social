import { PostModeration } from "@/components/admin/post-moderation";

export default function AdminPostsPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-foreground">Content moderation</h1>
      <PostModeration />
    </div>
  );
}
