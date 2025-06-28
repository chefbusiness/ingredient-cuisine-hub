
export function processResults(generatedIngredients: any[]): {
  successful: any[];
  duplicates: any[];
  failed: any[];
} {
  const successfulIngredients = generatedIngredients.filter(ing => ing.generated !== false);
  const duplicateIngredients = generatedIngredients.filter(ing => ing.error === 'DUPLICADO_DETECTADO');
  const failedIngredients = generatedIngredients.filter(ing => ing.generated === false && ing.error !== 'DUPLICADO_DETECTADO');
  
  return {
    successful: successfulIngredients,
    duplicates: duplicateIngredients,
    failed: failedIngredients
  };
}

export function logResults(
  results: ReturnType<typeof processResults>,
  totalRequested: number,
  mode: 'manual' | 'automatic'
): void {
  console.log(`🎯 Sonar Deep Research ${mode} mode completed:`);
  console.log(`  ✅ Successful: ${results.successful.length}/${totalRequested}`);
  console.log(`  ⚠️ Duplicates (tokens saved): ${results.duplicates.length}/${totalRequested}`);
  console.log(`  ❌ Failed: ${results.failed.length}/${totalRequested}`);
  
  // Log generated ingredient names for verification
  if (results.successful.length > 0) {
    console.log(`📝 Generated ingredient names with Deep Research:`);
    results.successful.forEach((ing, idx) => {
      console.log(`  ${idx + 1}. ${ing.name || 'No name'} (requested: ${ing.requested_ingredient || 'N/A'})`);
    });
  }
}
