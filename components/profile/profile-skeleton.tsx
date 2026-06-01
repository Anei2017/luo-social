import { Skeleton } from "@/components/ui/skeleton";

/** Full-page profile loading state */
export function ProfilePageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-4xl animate-pulse space-y-4 pb-8">
      <Skeleton className="h-48 w-full rounded-none sm:h-56 md:h-[312px] md:rounded-t-2xl" />
      <div className="relative px-4 sm:px-6">
        <Skeleton className="-mt-20 size-[140px] rounded-full border-4 border-surface sm:-mt-24 sm:size-[180px]" />
        <Skeleton className="mt-4 h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-32" />
        <Skeleton className="mt-4 h-16 w-full max-w-lg" />
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
      <div className="flex gap-2 px-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-20 rounded-full" />
        ))}
      </div>
      <Skeleton className="mx-4 h-40 rounded-2xl" />
      <Skeleton className="mx-4 h-56 rounded-2xl" />
    </div>
  );
}
