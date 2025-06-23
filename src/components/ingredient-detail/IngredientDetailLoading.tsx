
import { Skeleton } from "@/components/ui/skeleton";
import UnifiedHeader from "@/components/UnifiedHeader";
import Footer from "@/components/Footer";

const IngredientDetailLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-orange-50 to-yellow-50 flex flex-col">
      <UnifiedHeader variant="ingredient-detail" />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                <Skeleton className="h-48" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-32" />
                <Skeleton className="h-48" />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IngredientDetailLoading;
