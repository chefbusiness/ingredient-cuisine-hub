
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Image, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export interface ImageEntry {
  id: string;
  url: string;
  caption: string;
  category: string;
}

interface ImageEntryFormProps {
  entry: ImageEntry;
  index: number;
  canRemove: boolean;
  onUpdate: (id: string, field: keyof ImageEntry, value: string) => void;
  onRemove: (id: string) => void;
}

const categories = [
  { value: 'general', label: 'General' },
  { value: 'crudo', label: 'Crudo' },
  { value: 'cocinado', label: 'Cocinado' },
  { value: 'cortado', label: 'Cortado' },
  { value: 'entero', label: 'Entero' },
  { value: 'variedad', label: 'Variedad' }
];

const ImageEntryForm = ({ entry, index, canRemove, onUpdate, onRemove }: ImageEntryFormProps) => {
  const { toast } = useToast();

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image className="h-4 w-4" />
          <span className="font-medium">Imagen {index + 1}</span>
        </div>
        {canRemove && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onRemove(entry.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`url-${entry.id}`}>URL de la Imagen</Label>
          <Input
            id={`url-${entry.id}`}
            value={entry.url}
            onChange={(e) => onUpdate(entry.id, 'url', e.target.value)}
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        <div>
          <Label htmlFor={`category-${entry.id}`}>Categoría</Label>
          <select
            id={`category-${entry.id}`}
            value={entry.category}
            onChange={(e) => onUpdate(entry.id, 'category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor={`caption-${entry.id}`}>Descripción (opcional)</Label>
        <Input
          id={`caption-${entry.id}`}
          value={entry.caption}
          onChange={(e) => onUpdate(entry.id, 'caption', e.target.value)}
          placeholder="Descripción de la imagen..."
        />
      </div>

      {/* Image Preview */}
      {entry.url && (
        <div className="mt-3">
          <Label>Vista previa:</Label>
          <div className="mt-2">
            <img
              src={entry.url}
              alt="Vista previa"
              className="w-full h-32 object-cover rounded-md border"
              onError={() => {
                toast({
                  title: "Error",
                  description: "No se pudo cargar la imagen desde esa URL",
                  variant: "destructive",
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEntryForm;
