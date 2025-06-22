
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useUpdateIngredient } from "@/hooks/mutations";
import { Ingredient } from "@/hooks/useIngredients";

interface SimpleTextEditorProps {
  ingredient: Ingredient;
  onSave: () => void;
}

const SimpleTextEditor = ({ ingredient, onSave }: SimpleTextEditorProps) => {
  const [name, setName] = useState(ingredient.name || "");
  const [description, setDescription] = useState(ingredient.description || "");
  const [merma, setMerma] = useState(ingredient.merma || 0);
  const [rendimiento, setRendimiento] = useState(ingredient.rendimiento || 100);
  
  const { mutate: updateIngredient, isPending } = useUpdateIngredient();

  const handleSave = () => {
    console.log('💾 SIMPLE: Saving text changes for:', ingredient.id);
    
    updateIngredient({
      id: ingredient.id,
      updates: {
        name,
        description,
        merma,
        rendimiento,
        updated_at: new Date().toISOString()
      }
    }, {
      onSuccess: () => {
        console.log('✅ SIMPLE: Text saved successfully');
        onSave();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Nombre</Label>
        <Input 
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre del ingrediente"
        />
      </div>

      <div>
        <Label>Descripción</Label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción del ingrediente"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Merma (%)</Label>
          <Input 
            type="number"
            value={merma}
            onChange={(e) => setMerma(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>

        <div>
          <Label>Rendimiento (%)</Label>
          <Input 
            type="number"
            value={rendimiento}
            onChange={(e) => setRendimiento(Number(e.target.value))}
            min="0"
            max="100"
          />
        </div>
      </div>

      <Button 
        onClick={handleSave}
        disabled={isPending}
        className="w-full"
      >
        {isPending ? "Guardando..." : "Guardar Cambios"}
      </Button>
    </div>
  );
};

export default SimpleTextEditor;
