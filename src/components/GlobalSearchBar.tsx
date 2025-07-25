
import { useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full mb-4">
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <Input
          type="text"
          placeholder="Buscar ingredientes... (presiona Enter)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`pl-10 w-full ${isMobile ? 'h-10 text-sm' : 'h-12 text-base'} bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-green-500 rounded-lg shadow-sm`}
        />
      </div>
    </div>
  );
};

export default GlobalSearchBar;
