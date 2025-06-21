
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

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
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-semibold text-foreground mb-3">
            Directorio profesional de ingredientes culinarios
          </h2>
          
          <p className="text-base text-muted-foreground mb-6 leading-relaxed">
            Información detallada sobre ingredientes, precios por país, porcentajes de merma 
            y usos profesionales para chefs y hostelería.
          </p>
          
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10 h-10"
              />
            </div>
            <Button onClick={handleSearch} className="mt-3 h-9 px-4">
              Explorar Directorio
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
