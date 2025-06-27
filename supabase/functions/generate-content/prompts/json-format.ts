
export const getJsonFormat = (isSpecificIngredient: boolean, ingredient?: string, category?: string) => {
  const categoryResponse = category 
    ? `"category": "${category}",`
    : `"category": "determina la categoría apropiada basada en el ingrediente",`;

  const nameField = isSpecificIngredient && ingredient
    ? `"name": "${ingredient} (nombre en español España)",`
    : `"name": "nombre en español (España)",`;

  return `{
    ${nameField}
    "name_en": "nombre en inglés",
    "name_fr": "nombre en francés",
    "name_it": "nombre en italiano", 
    "name_pt": "nombre en portugués",
    "name_zh": "nombre en chino (caracteres chinos)",
    "name_la": "sinónimos en español de Latinoamérica (ej: papa en lugar de patata, tomate en lugar de jitomate, etc.)",
    ${categoryResponse}
    "description": "descripción científica y técnica detallada basada en investigación real de fuentes especializadas (400-500 palabras) - DEBE SER UNA CADENA CONTINUA SIN SALTOS DE LÍNEA - Seguir estructura de 5 secciones especializadas del Experto Culinario en Léxico Científico usando marcadores ###SECCION1###, ###SECCION2###, ###SECCION3###, ###SECCION4###, ###SECCION5### para delimitar cada sección - COMPLETAR TODAS LAS 5 SECCIONES SIN CORTAR ABRUPTAMENTE - ALCANZAR 400-500 PALABRAS TOTALES - VERIFICAR ORIGEN HISTÓRICO REAL",
    "temporada": "temporada principal basada en calendarios agrícolas reales",
    "origen": "región de origen VERIFICADA en fuentes históricas/geográficas ACADÉMICAS (ej: tomate=América, patata=Andes)",
    "merma": [MERMA_INSTRUCTIONS_PLACEHOLDER],
    "rendimiento": número entre 20-95 (100 - merma, calculado automáticamente basado en la merma real investigada),
    "popularity": número entre 1-100 basado en frecuencia de uso en recetas profesionales,
    "nutritional_info": {
      "calories": número de BEDCA/USDA,
      "protein": número de fuentes oficiales,
      "carbs": número verificado,
      "fat": número oficial,
      "fiber": número de bases de datos nutricionales,
      "vitamin_c": número de fuentes científicas
    },
    "uses": ["uso culinario profesional 1", "uso culinario profesional 2", "uso culinario profesional 3"],
    "recipes": [
      {
        "name": "nombre de receta REAL investigada",
        "type": "entrante",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta (chef, libro, restaurante)"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "principal",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "guarnición",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "postre",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL investigada",
        "type": "salsa",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta"
      },
      {
        "name": "nombre de receta REAL especialidad regional investigada",
        "type": "especialidad",
        "difficulty": "fácil/medio/difícil",
        "time": "tiempo estimado real",
        "source": "fuente de la receta (región específica)"
      }
    ],
    "varieties": ["variedad real 1", "variedad real 2"],
    "prices_by_country": [
      {
        "country": "España",
        "country_code": "ES",
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada",
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Estados Unidos", 
        "country_code": "US",
        "price": precio_investigado_en_dolares,
        "unit": "determina_unidad_apropiada",
        "currency": "USD",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Francia",
        "country_code": "FR", 
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada",
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Italia",
        "country_code": "IT",
        "price": precio_investigado_en_euros,
        "unit": "determina_unidad_apropiada", 
        "currency": "EUR",
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "México",
        "country_code": "MX",
        "price": precio_investigado_en_pesos,
        "unit": "determina_unidad_apropiada",
        "currency": "MXN", 
        "market_type": "mayorista/minorista",
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      },
      {
        "country": "Argentina", 
        "country_code": "AR",
        "price": precio_investigado_en_pesos_argentinos,
        "unit": "determina_unidad_apropiada",
        "currency": "ARS",
        "market_type": "mayorista/minorista", 
        "last_updated": "2024-XX-XX",
        "source": "fuente del precio"
      }
    ],
    "sources_consulted": ["fuente1.com", "fuente2.com", "fuente3.com"],
    "data_confidence": "alta/media/baja basada en calidad de fuentes",
    "last_researched": "2024-XX-XX"
  }`;
};
