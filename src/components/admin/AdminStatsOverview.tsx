
import AdminUserMetrics from "./AdminUserMetrics";

interface AdminStatsOverviewProps {
  ingredientsCount: number;
  categoriesCount: number;
}

const AdminStatsOverview = ({ ingredientsCount, categoriesCount }: AdminStatsOverviewProps) => {
  return (
    <div className="space-y-6">
      {/* Métricas de usuarios principales */}
      <AdminUserMetrics />
      
      {/* Métricas de contenido como información adicional */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Contenido del Directorio</h3>
              <div className="mt-2 space-y-1">
                <div className="text-2xl font-bold text-blue-900">{ingredientsCount}</div>
                <p className="text-xs text-blue-600">Ingredientes disponibles</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-green-800">Organización</h3>
              <div className="mt-2 space-y-1">
                <div className="text-2xl font-bold text-green-900">{categoriesCount}</div>
                <p className="text-xs text-green-600">Categorías organizadas</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatsOverview;
