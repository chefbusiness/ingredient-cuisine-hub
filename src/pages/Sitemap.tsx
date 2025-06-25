
import { useEffect } from "react";

const Sitemap = () => {
  useEffect(() => {
    // Redirigir inmediatamente a la edge function del sitemap
    window.location.href = "https://unqhfgupcutpeyepnavl.supabase.co/functions/v1/generate-sitemap";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-xl font-semibold mb-2">Generando sitemap...</h1>
        <p className="text-muted-foreground">Redirigiendo al sitemap XML...</p>
      </div>
    </div>
  );
};

export default Sitemap;
