
import { CheckCircle } from "lucide-react";

const AdminStatusBanner = () => {
  return (
    <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div>
          <h3 className="font-semibold text-green-800">Sistema AI Activado</h3>
          <p className="text-sm text-green-700">
            DeepSeek API y Replicate (Flux 1.1 Pro) están configurados y listos para generar contenido e imágenes de calidad profesional
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminStatusBanner;
