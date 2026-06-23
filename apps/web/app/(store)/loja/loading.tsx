import { Skeleton } from "@repo/ui/components/skeleton";

export default function Loading() {
  return (
    <div className="container py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-5 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[180px]" />
      </div>

      <div className="mb-6 flex gap-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col overflow-hidden rounded-xl border">
            <Skeleton className="aspect-square w-full rounded-none" />
            <div className="p-4 space-y-3 flex-1">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-7 w-1/2 mt-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
