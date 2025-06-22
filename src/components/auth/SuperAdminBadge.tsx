
import { Crown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSuperAdmin } from "@/hooks/useSuperAdmin";

export const SuperAdminBadge = () => {
  const { isSuperAdmin } = useSuperAdmin();

  if (!isSuperAdmin) return null;

  return (
    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-300">
      <Crown className="h-3 w-3 mr-1" />
      Super Admin
    </Badge>
  );
};
