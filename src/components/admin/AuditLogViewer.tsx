
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, RefreshCw, Clock, User } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tables } from '@/integrations/supabase/types';

type AuditLog = Tables<'admin_audit_log'>;

const AuditLogViewer = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los logs de auditoría",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'generate_content':
        return 'bg-blue-100 text-blue-800';
      case 'save_ingredients':
        return 'bg-green-100 text-green-800';
      case 'save_categories':
        return 'bg-purple-100 text-purple-800';
      case 'promote_super_admin':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    
    if (typeof details === 'object') {
      return Object.entries(details).map(([key, value]) => 
        `${key}: ${value}`
      ).join(', ');
    }
    
    return String(details);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Registro de Auditoría
            </CardTitle>
            <CardDescription>
              Historial de acciones administrativas realizadas en el sistema
            </CardDescription>
          </div>
          <Button
            onClick={fetchAuditLogs}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Cargando logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No se encontraron registros de auditoría
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getActionBadgeColor(log.action)}>
                        {log.action}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {log.resource_type}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>Usuario: {log.user_id.slice(0, 8)}...</span>
                      </div>
                    </div>

                    {log.details && (
                      <div className="text-xs text-gray-500 mt-1">
                        <strong>Detalles:</strong>{' '}
                        {formatDetails(log.details)}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AuditLogViewer;
