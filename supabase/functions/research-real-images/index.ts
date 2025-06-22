
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

// Security function to verify super admin access
async function verifySuperAdminAccess(authHeader: string | null): Promise<{ authorized: boolean, userEmail?: string }> {
  if (!authHeader) {
    console.log('❌ No authorization header provided');
    return { authorized: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.log('❌ Invalid or expired token:', userError?.message);
      return { authorized: false };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message);
      return { authorized: false, userEmail: user.email };
    }

    if (profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin:', profile.email);
      return { authorized: false, userEmail: profile.email };
    }

    return { authorized: true, userEmail: profile.email };
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return { authorized: false };
  }
}

// Function to validate image URLs
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    return response.ok && contentType?.startsWith('image/');
  } catch {
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 === RESEARCH REAL IMAGES REQUEST ===');
    
    // Security check
    const authHeader = req.headers.get('authorization');
    const authResult = await verifySuperAdminAccess(authHeader);
    
    if (!authResult.authorized) {
      const errorMessage = authResult.userEmail 
        ? `Usuario ${authResult.userEmail} no tiene permisos de super admin.`
        : 'Se requiere autenticación de super admin.';
        
      return new Response(JSON.stringify({ 
        error: errorMessage,
        code: 'UNAUTHORIZED'
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { ingredientIds, mode = 'single' } = await req.json();

    if (!ingredientIds || (Array.isArray(ingredientIds) && ingredientIds.length === 0)) {
      return new Response(JSON.stringify({ 
        error: 'Se requiere al menos un ID de ingrediente',
        code: 'MISSING_INGREDIENT_IDS'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY no configurada');
    }

    const results = [];
    const idsToProcess = Array.isArray(ingredientIds) ? ingredientIds : [ingredientIds];

    for (const ingredientId of idsToProcess) {
      console.log(`🔍 Researching images for ingredient: ${ingredientId}`);

      // Get ingredient details
      const { data: ingredient, error: ingredientError } = await supabase
        .from('ingredients')
        .select('name, name_en, description')
        .eq('id', ingredientId)
        .single();

      if (ingredientError || !ingredient) {
        console.log(`❌ Ingredient not found: ${ingredientId}`);
        results.push({
          ingredientId,
          success: false,
          error: 'Ingrediente no encontrado'
        });
        continue;
      }

      // DeepSeek prompt for image research
      const researchPrompt = `
      Eres un experto en investigación de imágenes de ingredientes culinarios. 
      
      INGREDIENTE: ${ingredient.name} (${ingredient.name_en})
      DESCRIPCIÓN: ${ingredient.description}
      
      TAREA: Encuentra 4-6 URLs de imágenes REALES y de alta calidad de este ingrediente.
      
      CRITERIOS ESTRICTOS:
      - Solo URLs de imágenes REALES (no ilustraciones, no AI)
      - Alta resolución (mínimo 800x600)
      - Fondo preferiblemente neutral
      - Diferentes perspectivas: crudo, cocinado, cortado, entero
      - Fuentes confiables (sitios culinarios, bancos de imágenes)
      - URLs directas a archivos de imagen (.jpg, .png, .webp)
      
      FORMATO DE RESPUESTA (JSON):
      {
        "images": [
          {
            "url": "URL_DIRECTA_IMAGEN",
            "description": "descripción_breve",
            "category": "crudo|cocinado|cortado|entero|variedad"
          }
        ]
      }
      
      IMPORTANTE: Responde SOLO con el JSON válido, sin texto adicional.
      `;

      try {
        const deepseekResponse = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              {
                role: 'system',
                content: 'Eres un investigador experto en imágenes de ingredientes culinarios. Responde solo con JSON válido.'
              },
              {
                role: 'user',
                content: researchPrompt
              }
            ],
            temperature: 0.3,
            max_tokens: 2000
          }),
        });

        if (!deepseekResponse.ok) {
          throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
        }

        const deepseekData = await deepseekResponse.json();
        const content = deepseekData.choices[0]?.message?.content;

        if (!content) {
          throw new Error('No content received from DeepSeek');
        }

        // Parse JSON response
        let imagesData;
        try {
          imagesData = JSON.parse(content);
        } catch {
          // Try to extract JSON from response if it has extra text
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            imagesData = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error('Invalid JSON response from DeepSeek');
          }
        }

        const validImages = [];
        
        // Validate and filter images
        if (imagesData.images && Array.isArray(imagesData.images)) {
          for (const imageInfo of imagesData.images.slice(0, 6)) { // Max 6 images
            if (imageInfo.url && typeof imageInfo.url === 'string') {
              console.log(`🔍 Validating image URL: ${imageInfo.url}`);
              
              const isValid = await validateImageUrl(imageInfo.url);
              if (isValid) {
                validImages.push({
                  url: imageInfo.url,
                  caption: imageInfo.description || '',
                  category: imageInfo.category || 'general'
                });
                console.log(`✅ Valid image found: ${imageInfo.url}`);
              } else {
                console.log(`❌ Invalid image URL: ${imageInfo.url}`);
              }
            }
          }
        }

        // Save valid images to database
        let savedCount = 0;
        for (const imageInfo of validImages) {
          const { error: insertError } = await supabase
            .from('ingredient_real_images')
            .insert({
              ingredient_id: ingredientId,
              image_url: imageInfo.url,
              caption: imageInfo.caption,
              uploaded_by: 'ai_research',
              is_approved: true // Auto-approve AI researched images
            });

          if (!insertError) {
            savedCount++;
          } else {
            console.log(`❌ Error saving image: ${insertError.message}`);
          }
        }

        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: true,
          imagesFound: validImages.length,
          imagesSaved: savedCount,
          images: validImages
        });

        console.log(`✅ Processed ${ingredient.name}: ${savedCount}/${validImages.length} images saved`);

      } catch (error) {
        console.error(`❌ Error processing ingredient ${ingredientId}:`, error);
        results.push({
          ingredientId,
          ingredientName: ingredient.name,
          success: false,
          error: error.message
        });
      }
    }

    // Log admin action
    try {
      await supabase.rpc('log_admin_action', {
        action_type: 'research_real_images',
        resource_type: 'ingredient_images',
        action_details: {
          mode,
          processed_ingredients: idsToProcess.length,
          successful_ingredients: results.filter(r => r.success).length,
          total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
          total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0),
          user_email: authResult.userEmail
        }
      });
    } catch (logError) {
      console.log('⚠️ Failed to log admin action:', logError);
    }

    const summary = {
      total_processed: idsToProcess.length,
      successful: results.filter(r => r.success).length,
      total_images_found: results.reduce((sum, r) => sum + (r.imagesFound || 0), 0),
      total_images_saved: results.reduce((sum, r) => sum + (r.imagesSaved || 0), 0)
    };

    console.log('🎉 === RESEARCH COMPLETED ===');
    console.log(`📊 Resumen: ${summary.total_images_saved} imágenes guardadas de ${summary.total_images_found} encontradas`);

    return new Response(JSON.stringify({ 
      success: true,
      results,
      summary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in research-real-images:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
