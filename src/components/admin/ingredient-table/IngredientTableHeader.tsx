
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const IngredientTableHeader = () => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-16 sticky left-0 bg-background z-10">Imagen</TableHead>
        <TableHead className="min-w-[200px] sticky left-16 bg-background z-10">Nombre</TableHead>
        <TableHead className="min-w-[120px]">Categoría</TableHead>
        <TableHead className="min-w-[100px]">Calidad</TableHead>
        <TableHead className="min-w-[100px] hidden sm:table-cell">Temporada</TableHead>
        <TableHead className="min-w-[80px] hidden md:table-cell">Merma</TableHead>
        <TableHead className="min-w-[100px] hidden md:table-cell">Rendimiento</TableHead>
        <TableHead className="min-w-[90px] hidden lg:table-cell">Popularidad</TableHead>
        <TableHead className="min-w-[200px] sticky right-0 bg-background z-10">Acciones</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default IngredientTableHeader;
