
export interface IngredientFormData {
  name: string;
  name_en: string;
  name_la: string;
  name_fr: string;
  name_it: string;
  name_pt: string;
  name_zh: string;
  description: string;
  category_id: string;
  temporada: string;
  origen: string;
  merma: number;
  rendimiento: number;
  popularity: number;
  image_url: string;
  real_image_url: string;
  slug: string; // Nuevo campo para SEO
}
