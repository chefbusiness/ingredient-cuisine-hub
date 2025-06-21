
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChefHat, ArrowLeft, Database, Wand2, BarChart3 } from "lucide-react";
import AdminContentGenerator from "@/components/AdminContentGenerator";
import { useIngredients } from "@/hooks/useIngredients";
import { useCategories } from "@/hooks/useCategories";

const Admin = () => {
  const { data: ingredients = [] } = useIngredients();
  const { data: categories = [] } = useCategories();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="clean-nav sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-3">
                <div className="p-2 bg-primary rounded-md">
                  <ChefHat className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg font-semibold text-foreground">
                  Panel de Administración
                </h1>
              </Link>
            </div>
            <Link to="/directorio">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Directorio
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredients.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contenido AI</CardTitle>
              <Wand2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Activo</div>
              <p className="text-xs text-muted-foreground">DeepSeek + Replicate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">Generador AI</TabsTrigger>
            <TabsTrigger value="content">Gestión de Contenido</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <AdminContentGenerator />
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Contenido Existente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Herramientas para editar y gestionar el contenido existente del directorio.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Ingredientes</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {ingredients.length} ingredientes registrados
                    </p>
                    <Button variant="outline" size="sm">Ver Lista</Button>
                  </Card>
                  <Card className="p-4">
                    <h3 className="font-semibold mb-2">Categorías</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {categories.length} categorías disponibles
                    </p>
                    <Button variant="outline" size="sm">Gestionar</Button>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de APIs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold">DeepSeek API</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generación de contenido de ingredientes
                    </p>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold">Replicate (Flux)</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Generación de imágenes de ingredientes
                    </p>
                  </Card>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Las API keys se configuran en las variables de entorno de Supabase Edge Functions.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
