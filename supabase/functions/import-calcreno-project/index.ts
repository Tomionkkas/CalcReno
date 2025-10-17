import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

Deno.serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // Create a client scoped to the 'calcreno_schema'
    const calcrenoSupabase = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'calcreno_schema' },
    });

    // Create a client scoped to the 'renotimeline_schema'
    const renotimelineSupabase = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'renotimeline_schema' },
    });
    
    // Create a client scoped to the 'shared_schema'
    const sharedSupabase = createClient(supabaseUrl, serviceRoleKey, {
      db: { schema: 'shared_schema' },
    });

    const importData = await req.json();

    // Step 1: Find the CalcReno project using the calcreno-scoped client
    console.log(`🔎 Searching for CalcReno project ${importData.calcreno_project_id} in calcreno_schema...`);
    const { data: existingProject, error: readError } = await calcrenoSupabase
      .from('calcreno_projects')
      .select('id, name, user_id, description')
      .eq('id', importData.calcreno_project_id)
      .single();

    if (readError) {
      console.error('❌ Failed to read CalcReno project:', readError);
      throw new Error(`CalcReno project not found: ${readError.message}`);
    }
    console.log(`✅ Found CalcReno project: ${existingProject.name}`);

    // Step 2: Create the new project in RenoTimeline using the renotimeline-scoped client
    const renoTimelineProjectId = crypto.randomUUID();
    console.log(`➕ Creating new project ${renoTimelineProjectId} in renotimeline_schema...`);
    const { error: timelineProjectError } = await renotimelineSupabase
      .from('projects')
      .insert({
        id: renoTimelineProjectId,
        user_id: existingProject.user_id,
        name: existingProject.name,
        description: importData.description,
        start_date: importData.start_date,
        end_date: importData.end_date,
        status: 'planned', // Default status for new projects
      });

    if (timelineProjectError) {
      console.error('❌ Failed to create RenoTimeline project:', timelineProjectError);
      throw new Error(`Could not create RenoTimeline project: ${timelineProjectError.message}`);
    }
    console.log(`✅ Successfully created RenoTimeline project.`);

    // Step 3: Link the two projects in the renotimeline 'imported_projects' table
    console.log(`🔗 Linking projects in imported_projects table...`);
    const { error: importLinkError } = await renotimelineSupabase
      .from('imported_projects')
      .insert({
        id: crypto.randomUUID(),
        user_id: existingProject.user_id,
        timeline_project_id: renoTimelineProjectId,
        source_app: 'CalcReno',
        source_project_id: existingProject.id,
      });

    if (importLinkError) {
      console.error('❌ Failed to link projects:', importLinkError);
      // This is not a fatal error, so we'll just log it and continue
    } else {
      console.log(`✅ Successfully linked projects.`);
    }
    
    // Step 4: Update the CalcReno project to mark it as exported
    console.log(`📝 Marking CalcReno project as exported...`);
    const { error: updateError } = await calcrenoSupabase
      .from('calcreno_projects')
      .update({
        is_exported_to_timeline: true,
        timeline_project_id: renoTimelineProjectId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingProject.id);

    if (updateError) {
      console.error('❌ Failed to update CalcReno project status:', updateError);
      // Also not fatal
    } else {
      console.log(`✅ Successfully marked CalcReno project as exported.`);
    }
    
    // Step 5: Send a cross-app notification to the user
    console.log(`🔔 Sending cross-app notification...`);
    await sharedSupabase.from('cross_app_notifications').insert({
      user_id: existingProject.user_id,
      from_app: 'CalcReno',
      to_app: 'RenoTimeline',
      type: 'PROJECT_IMPORT_SUCCESS',
      message: `Your project '${existingProject.name}' has been successfully imported into RenoTimeline!`,
      cta_link: `/project/${renoTimelineProjectId}`,
    });
    console.log(`✅ Notification sent.`);

    const result = {
      success: true,
      message: 'Project imported successfully to RenoTimeline',
      renotimeline_project_id: renoTimelineProjectId,
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('💥 Edge Function error:', error);
    const errorResult = {
      success: false,
      error: error.message || 'Unknown error during import',
      details: 'CalcReno project import failed',
      timestamp: new Date().toISOString()
    };
    return new Response(JSON.stringify(errorResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});