
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";
import ResearchResultCard from "./ResearchResultCard";

interface ResearchResultsProps {
  showResults: boolean;
  researchResults: any[];
  researchType: string;
  researchOptions: Array<{
    value: string;
    label: string;
  }>;
}

const ResearchResults = ({ 
  showResults, 
  researchResults, 
  researchType, 
  researchOptions 
}: ResearchResultsProps) => {
  if (!showResults || researchResults.length === 0) return null;

  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Resultados de la Investigación
        </CardTitle>
        <Badge variant="outline">
          {researchOptions.find(opt => opt.value === researchType)?.label}
        </Badge>
      </CardHeader>
      <CardContent>
        {researchResults.map((result, index) => (
          <ResearchResultCard
            key={index}
            result={result}
            researchType={researchType}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default ResearchResults;
