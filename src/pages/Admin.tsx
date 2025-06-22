
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader, BarChart3, Settings, Database, TrendingUp, Zap } from "lucide-react";
import UnifiedHeader from "@/components/UnifiedHeader";
import AdminStatsOverview from "@/components/admin/AdminStatsOverview";
import AdminContentTab from "@/components/admin/AdminContentTab";
import AdminAnalyticsTab from "@/components/admin/AdminAnalyticsTab";
import AdminSettingsTab from "@/components/admin/AdminSettingsTab";
import BatchOperations from "@/components/admin/BatchOperations";
import { useIngredients } from "@/hooks/useIngredients";
import { useCategories } from "@/hooks/useCategories";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";
import { useAuth } from "@/contexts/AuthContext";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { isSuperAdmin, loading: superAdminLoading } = useSuperAdmin();
  const { data: ingredients = [], isLoading: ingredientsLoading } = useIngredients();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  // Redirect if not authenticated or not super admin
  useEffect(() => {
    if (!superAdminLoading && (!user || !isSuperAdmin)) {
      window.location.href = '/';
    }
  }, [user, isSuperAdmin, superAdminLoading]);

  if (superAdminLoading || ingredientsLoading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedHeader />
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center py-16">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Cargando dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isSuperAdmin) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedHeader />
      
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard de Administración</h1>
              <p className="text-muted-foreground mt-2">
                Panel de control para gestionar el directorio de ingredientes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Zap className="h-3 w-3 mr-1" />
                Super Admin
              </Badge>
              <Badge variant="outline">
                {ingredients.length} ingredientes
              </Badge>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Resumen</span>
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Contenido</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="batch" className="flex items-center space-x-2">
              <Zap className="h-4 w-4" />
              <span>Operaciones</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>Configuración</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <div className="mt-6">
            <TabsContent value="overview">
              <AdminStatsOverview />
            </TabsContent>

            <TabsContent value="content">
              <AdminContentTab 
                ingredientsCount={ingredients.length}
                categoriesCount={categories.length}
              />
            </TabsContent>

            <TabsContent value="analytics">
              <AdminAnalyticsTab />
            </TabsContent>

            <TabsContent value="batch">
              <BatchOperations totalIngredients={ingredients.length} />
            </TabsContent>

            <TabsContent value="settings">
              <AdminSettingsTab />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
