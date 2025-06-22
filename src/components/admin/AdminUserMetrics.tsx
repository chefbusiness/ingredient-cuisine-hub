
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, UserCheck, AlertTriangle, TrendingUp, Eye, Clock } from "lucide-react";
import { useUserMetrics } from "@/hooks/useUserMetrics";
import { usePopularIngredients } from "@/hooks/usePopularIngredients";

const AdminUserMetrics = () => {
  const userMetrics = useUserMetrics();
  const popularIngredients = usePopularIngredients();

  if (userMetrics.loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas principales de usuarios */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Registrados</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.totalRegisteredUsers}</div>
            <p className="text-xs text-muted-foreground">Total en la plataforma</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.anonymousSessionsLast24h}</div>
            <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card className={userMetrics.usersNearLimit > 0 ? "border-orange-200 bg-orange-50" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cerca del Límite</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${userMetrics.usersNearLimit > 0 ? 'text-orange-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics.usersNearLimit}</div>
            <p className="text-xs text-muted-foreground">15-19 páginas vistas</p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Tasa Conversión</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800">{userMetrics.conversionRate}%</div>
            <p className="text-xs text-green-600">Visitante → Usuario</p>
          </CardContent>
        </Card>
      </div>

      {/* Ingredientes más populares */}
      {!popularIngredients.loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                Top Ingredientes - Visitantes
                <Badge variant="outline">24h</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {popularIngredients.anonymousViews.length > 0 ? (
                  popularIngredients.anonymousViews.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        {ingredient.name}
                      </span>
                      <span className="text-muted-foreground">{ingredient.viewCount} vistas</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <UserCheck className="h-4 w-4" />
                Top Ingredientes - Registrados
                <Badge variant="outline">24h</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {popularIngredients.registeredViews.length > 0 ? (
                  popularIngredients.registeredViews.map((ingredient, index) => (
                    <div key={ingredient.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary" className="w-6 h-6 text-xs p-0 flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        {ingredient.name}
                      </span>
                      <span className="text-muted-foreground">{ingredient.viewCount} vistas</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay datos disponibles</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas adicionales */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            Métricas de Comportamiento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-lg font-semibold">{userMetrics.averageViewsBeforeRegistration}</div>
              <p className="text-muted-foreground">Vistas promedio antes del registro</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">~3.2min</div>
              <p className="text-muted-foreground">Tiempo promedio por sesión</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">68%</div>
              <p className="text-muted-foreground">Usuarios que vuelven después del registro</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUserMetrics;
