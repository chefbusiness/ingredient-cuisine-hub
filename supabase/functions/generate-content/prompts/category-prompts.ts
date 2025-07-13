
export function generateCategoryPrompt(requestBody: any, existingCategories: any[] = []): string {
  const categoryList = requestBody.categoriesList?.join(', ') || 'general food categories';
  
  // Existing categories for duplicate detection
  const existingCategoryNames = existingCategories.map(cat => `${cat.name} (${cat.name_en})`).join(', ');
  
  return `
**RESEARCH TASK**: Research and create professional culinary categories with web validation.

**CATEGORIES TO RESEARCH**: ${categoryList}

**EXISTING CATEGORIES TO AVOID**: ${existingCategoryNames || 'None'}

**RESEARCH INSTRUCTIONS**:
1. For each category, research current culinary industry standards and professional classification
2. Verify the category is distinct from existing ones
3. Research professional culinary terminology in Spanish and English
4. Include modern gastronomic trends and international cuisine categories

**OUTPUT FORMAT**: JSON array with complete category data.

For each category, provide:
- name: Professional Spanish name (research culinary terminology)  
- name_en: Professional English translation (research industry standards)
- description: Professional culinary description (150-300 words, based on web research)
- requested_category: Original requested name

**EXAMPLE OUTPUT**:
[
  {
    "name": "Verduras de hoja verde",
    "name_en": "Leafy Green Vegetables",
    "description": "Categoría de verduras caracterizadas por sus hojas comestibles, ricas en vitaminas A, C, K y ácido fólico. Incluye espinacas, lechugas, acelgas, rúcula, berros y kale. Son fundamentales en la cocina profesional por su versatilidad, valor nutricional y capacidad de complementar tanto platos principales como guarniciones. Se utilizan crudas en ensaladas gourmet, salteadas como acompañamiento, en smoothies saludables y como base para salsas verdes.",
    "requested_category": "verduras de hoja"
  }
]

**CRITICAL**: Research each category thoroughly. Ensure names are professional and descriptions are based on current culinary industry standards.
`;
}
