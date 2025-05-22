import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skeleton for store header image */}
      <section className="relative">
        <Skeleton className="h-[300px] md:h-[400px] w-full" />
      </section>

      {/* Skeleton for store info */}
      <section className="container mx-auto max-w-5xl px-4 md:px-6 -mt-10 relative z-20">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="w-full">
              <div className="flex gap-2 mb-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-3/4 mb-2" />
              <div className="flex gap-2 mt-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-24" />
              </div>
              <Skeleton className="h-20 w-full mt-4" />
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-5 w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Skeleton for menu tabs */}
      <section className="container mx-auto max-w-5xl px-4 md:px-6 py-8">
        <div className="w-full mb-8">
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-8">
          <div>
            <Skeleton className="h-7 w-40 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div className="flex flex-col justify-between w-full">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-5 w-1/4 mt-2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
