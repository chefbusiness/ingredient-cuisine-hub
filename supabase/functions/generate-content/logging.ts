
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

export async function logAdminAction(
  actionType: string,
  resourceType: string,
  actionDetails: any
): Promise<void> {
  try {
    await supabase.rpc('log_admin_action', {
      action_type: actionType,
      resource_type: resourceType,
      action_details: actionDetails
    });
  } catch (logError) {
    console.log('⚠️ Failed to log admin action:', logError);
    // Don't fail the request if logging fails
  }
}
