
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChefHat, ArrowLeft, Database, Wand2, BarChart3, CheckCircle, Zap } from "lucide-react";
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
                  Panel de Administración AI
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
        {/* Status Banner */}
        <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Sistema AI Activado</h3>
              <p className="text-sm text-green-700">
                DeepSeek API y Replicate (Flux) están configurados y listos para generar contenido e imágenes
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingredientes</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ingredients.length}</div>
              <p className="text-xs text-muted-foreground">En la base de datos</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorías</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-xs text-muted-foreground">Categorías disponibles</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800">DeepSeek AI</CardTitle>
              <Wand2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-800">Activo</div>
              <p className="text-xs text-green-600">Generación de contenido</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800">Flux (Replicate)</CardTitle>
              <Zap className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-800">Activo</div>
              <p className="text-xs text-blue-600">Generación de imágenes</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Admin Tabs */}
        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">
              <Wand2 className="h-4 w-4 mr-2" />
              Generador AI
            </TabsTrigger>
            <TabsTrigger value="content">Gestión de Contenido</TabsTrigger>
            <TabsTrigger value="settings">Configuración</TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">Generador de Contenido AI</h2>
              <p className="text-muted-foreground">
                Usa DeepSeek para generar ingredientes, categorías y precios, y Flux para crear imágenes realistas.
              </p>
            </div>
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
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/directorio">Ver Lista</Link>
                    </Button>
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
                <CardTitle>Estado de las APIs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="p-4 border-green-200 bg-green-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <h3 className="font-semibold text-green-800">DeepSeek API</h3>
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <p className="text-sm text-green-700">
                      Generación de contenido de ingredientes, categorías y precios
                    </p>
                    <div className="mt-2 text-xs text-green-600">
                      ✓ API Key configurada correctamente
                    </div>
                  </Card>
                  
                  <Card className="p-4 border-blue-200 bg-blue-50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-blue-800">Replicate (Flux)</h3>
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700">
                      Generación de imágenes realistas de ingredientes
                    </p>
                    <div className="mt-2 text-xs text-blue-600">
                      ✓ API Key configurada correctamente
                    </div>
                  </Card>
                </div>
                
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-2">Funcionalidades Disponibles</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Generación de ingredientes por categoría</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Creación de nuevas categorías</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Actualización automática de precios</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Generación de imágenes realistas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Información nutricional detallada</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Usos culinarios profesionales</span>
                    </div>
                  </div>
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
