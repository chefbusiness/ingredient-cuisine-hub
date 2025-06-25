
import { useIngredientById, useIngredientBySlug } from "./useIngredients";

export const useIngredientBySlugOrId = (param: string) => {
  // Detectar si es UUID (ID) o slug
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(param);
  
  const byId = useIngredientById(isUUID ? param : "");
  const bySlug = useIngredientBySlug(!isUUID ? param : "");
  
  return {
    data: isUUID ? byId.data : bySlug.data,
    isLoading: isUUID ? byId.isLoading : bySlug.isLoading,
    error: isUUID ? byId.error : bySlug.error,
    isLegacyUrl: isUUID
  };
};
