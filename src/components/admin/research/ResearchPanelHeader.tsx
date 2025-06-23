
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Globe } from "lucide-react";

const ResearchPanelHeader = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Panel de Investigación Profunda con Perplexity
          <Badge className="bg-blue-100 text-blue-800 ml-2">
            <Globe className="h-3 w-3 mr-1" />
            Investigación en Internet
          </Badge>
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

export default ResearchPanelHeader;
