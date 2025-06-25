
import { ChevronRight, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface BreadcrumbItem {
  name: string;
  url: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

const Breadcrumbs = ({ items, className = "" }: BreadcrumbsProps) => {
  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`} aria-label="Breadcrumb">
      <Link 
        to="/" 
        className="flex items-center hover:text-foreground transition-colors"
        aria-label="Ir al inicio"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <ChevronRight className="h-4 w-4 mx-1" />
          {item.current ? (
            <span className="font-medium text-foreground" aria-current="page">
              {item.name}
            </span>
          ) : (
            <Link 
              to={item.url} 
              className="hover:text-foreground transition-colors"
              aria-label={`Ir a ${item.name}`}
            >
              {item.name}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
