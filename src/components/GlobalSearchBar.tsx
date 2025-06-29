
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useResponsive } from "@/hooks/useResponsive";

const GlobalSearchBar = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { isMobile } = useResponsive();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/directorio?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/directorio');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`w-full max-w-md ${isMobile ? 'mb-4' : 'mb-6'}`}>
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
        <Input
          type="text"
          placeholder="Buscar ingredientes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          className={`pl-10 ${isMobile ? 'h-9 text-sm' : 'h-10'}`}
        />
      </div>
      <Button 
        onClick={handleSearch} 
        className={`mt-2 w-full ${isMobile ? 'h-8 text-sm' : 'h-9'}`}
        size={isMobile ? "sm" : "default"}
      >
        Buscar en Directorio
        <ArrowRight className={`ml-2 ${isMobile ? 'h-3 w-3' : 'h-3 w-3'}`} />
      </Button>
    </div>
  );
};

export default GlobalSearchBar;
