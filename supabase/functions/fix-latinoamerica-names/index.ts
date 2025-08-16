
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

    console.log('✅ User authenticated:', user.email);

    // Check super admin status from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError.message);
      return { authorized: false, userEmail: user.email };
    }

    console.log('📋 User profile:', { email: profile.email, role: profile.role });

    if (profile.role !== 'super_admin') {
      console.log('❌ User is not a super admin:', profile.email, 'Current role:', profile.role);
      return { authorized: false, userEmail: profile.email };
    }

    console.log('✅ Super admin access verified for:', profile.email);
    return { authorized: true, userEmail: profile.email };
  } catch (error) {
    console.log('❌ Error verifying admin access:', error);
    return { authorized: false };
  }
}

// Mapeo de correcciones para nombres científicos a sinónimos latinoamericanos
const nameCorrections: Record<string, string> = {
  'Sus scrofa domesticus': 'cochino, marrano, chancho',
  'Capra aegagrus hircus': 'chivo, cabra',
  'Bos taurus': 'res, ganado',
  'Gallus gallus domesticus': 'pollo, gallina',
  'Ovis aries': 'borrego, carnero',
  'Salmo salar': 'salmón',
  'Thunnus': 'atún',
  'Gadus morhua': 'bacalao',
  'Merluccius': 'merluza',
  'Solanum tuberosum': 'papa',
  'Solanum lycopersicum': 'tomate, jitomate',
  'Allium cepa': 'cebolla',
  'Capsicum annuum': 'chile, ají, pimiento',
  'Phaseolus vulgaris': 'frijoles, porotos, judías',
  'Zea mays': 'maíz, elote, choclo',
  'Triticum aestivum': 'trigo',
  'Oryza sativa': 'arroz',
  'Brassica oleracea': 'repollo, col',
  'Daucus carota': 'zanahoria',
  'Lactuca sativa': 'lechuga',
  'Spinacia oleracea': 'espinaca',
  'Citrus sinensis': 'naranja',
  'Citrus limon': 'limón',
  'Malus domestica': 'manzana',
  'Prunus persica': 'durazno',
  'Vitis vinifera': 'uva',
  'Fragaria × ananassa': 'fresa, frutilla',
  'Musa': 'plátano, banana',
  'Ananas comosus': 'piña, ananá',
  'Persea americana': 'palta, aguacate',
  'Cucumis sativus': 'pepino',
  'Cucurbita pepo': 'calabacín, zapallito',
  'Allium sativum': 'ajo',
  'Petroselinum crispum': 'perejil',
  'Coriandrum sativum': 'cilantro, culantro',
  'Ocimum basilicum': 'albahaca',
  'Rosmarinus officinalis': 'romero',
  'Thymus vulgaris': 'tomillo',
  'Origanum vulgare': 'orégano',
  'Piper nigrum': 'pimienta',
  'Cinnamomum verum': 'canela',
  'Cuminum cyminum': 'comino',
  'Syzygium aromaticum': 'clavo de olor'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // SECURITY: Verify super admin access
  const authHeader = req.headers.get('Authorization');
  const { authorized, userEmail } = await verifySuperAdminAccess(authHeader);
  
  if (!authorized) {
    console.log('❌ Unauthorized access attempt from:', userEmail || 'unknown');
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Access denied. Super admin privileges required.',
        unauthorized: true 
      }), 
      { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    console.log('🔧 === INICIANDO CORRECCIÓN DE NOMBRES LATINOAMERICANOS ===');
    
    // Obtener todos los ingredientes con sus name_la actuales
    const { data: ingredients, error: fetchError } = await supabase
      .from('ingredients')
      .select('id, name, name_la')
      .not('name_la', 'is', null);
    
    if (fetchError) {
      console.error('❌ Error obteniendo ingredientes:', fetchError);
      throw fetchError;
    }
    
    console.log(`📋 Encontrados ${ingredients?.length || 0} ingredientes con name_la`);
    
    let correctedCount = 0;
    let skippedCount = 0;
    const corrections: any[] = [];
    
    for (const ingredient of ingredients || []) {
      const currentNameLa = ingredient.name_la?.trim() || '';
      
      // Verificar si parece un nombre científico (contiene palabras en latín, mayúsculas, etc.)
      const seemsScientific = 
        currentNameLa.includes(' ') && 
        (currentNameLa.match(/^[A-Z][a-z]+ [a-z]+/) || // Formato "Genus species"
         currentNameLa.includes('domesticus') ||
         currentNameLa.includes('officinalis') ||
         currentNameLa.includes('vulgaris') ||
         currentNameLa.includes('sativa') ||
         currentNameLa.includes('annuum'));
      
      if (seemsScientific) {
        // Buscar corrección específica
        let newNameLa = nameCorrections[currentNameLa];
        
        // Si no encontramos una corrección específica, intentar con palabras clave
        if (!newNameLa) {
          for (const [scientific, synonym] of Object.entries(nameCorrections)) {
            if (currentNameLa.includes(scientific.split(' ')[0])) {
              newNameLa = synonym;
              break;
            }
          }
        }
        
        // Si aún no encontramos, usar el nombre español base
        if (!newNameLa) {
          newNameLa = ingredient.name; // Usar el mismo nombre español como fallback
        }
        
        console.log(`🔄 Corrigiendo: "${ingredient.name}"`);
        console.log(`   Antes: "${currentNameLa}"`);
        console.log(`   Después: "${newNameLa}"`);
        
        // Actualizar en la base de datos
        const { error: updateError } = await supabase
          .from('ingredients')
          .update({ name_la: newNameLa })
          .eq('id', ingredient.id);
        
        if (updateError) {
          console.error(`❌ Error actualizando ${ingredient.name}:`, updateError);
        } else {
          correctedCount++;
          corrections.push({
            id: ingredient.id,
            name: ingredient.name,
            old_name_la: currentNameLa,
            new_name_la: newNameLa
          });
        }
      } else {
        console.log(`✅ Saltando "${ingredient.name}" - ya parece correcto: "${currentNameLa}"`);
        skippedCount++;
      }
    }
    
    console.log('🎉 === CORRECCIÓN COMPLETADA ===');
    console.log(`✅ Ingredientes corregidos: ${correctedCount}`);
    console.log(`⏭️ Ingredientes ya correctos: ${skippedCount}`);
    
    return new Response(JSON.stringify({
      success: true,
      corrected_count: correctedCount,
      skipped_count: skippedCount,
      total_processed: (ingredients?.length || 0),
      corrections: corrections
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error en fix-latinoamerica-names:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
