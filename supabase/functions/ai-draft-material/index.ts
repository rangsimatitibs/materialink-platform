import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SYSTEM_PROMPT = `You are a materials science research assistant. When asked about a material, return a JSON payload with best-effort typical values for its properties, sustainability profile, and description. Only include values you have reasonable evidence for. Use SI units. Return numeric fields as numbers, not strings. Confidence should be one of: verified, estimated, ai_generated.`;

const JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    name: { type: 'string' },
    slug: { type: 'string' },
    short_description: { type: 'string' },
    chemical_formula: { type: 'string' },
    sustainability_summary: { type: 'string' },
    end_of_life_summary: { type: 'string' },
    production_scale_maturity: { type: 'string' },
    data_confidence: { type: 'string', enum: ['verified', 'estimated', 'ai_generated'] },
    properties: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          property_name: { type: 'string' },
          value_min: { type: ['number', 'null'] },
          value_max: { type: ['number', 'null'] },
          exact_value: { type: ['number', 'null'] },
          unit: { type: 'string' },
          test_standard: { type: ['string', 'null'] },
          confidence_level: { type: 'string' },
        },
        required: ['property_name'],
      },
    },
    sustainability: {
      type: 'object',
      additionalProperties: false,
      properties: {
        bio_based_content: { type: ['number', 'null'] },
        recycled_content: { type: ['number', 'null'] },
        carbon_footprint_value: { type: ['number', 'null'] },
        carbon_footprint_unit: { type: ['string', 'null'] },
        lca_available: { type: 'boolean' },
        epd_available: { type: 'boolean' },
        notes: { type: 'string' },
      },
    },
  },
  required: ['name', 'short_description'],
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const jwt = authHeader.replace('Bearer ', '');
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data: userData } = await admin.auth.getUser(jwt);
    if (!userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: roleData } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const isAdmin = (roleData ?? []).some((r) => r.role === 'admin');
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admins only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const materialName: string | undefined = body?.material_name;
    const generalMaterialId: string | undefined = body?.general_material_id;
    const extraContext: string | undefined = body?.context;
    if (!materialName && !generalMaterialId) {
      return new Response(JSON.stringify({ error: 'material_name or general_material_id required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let resolvedName = materialName;
    if (!resolvedName && generalMaterialId) {
      const { data: m } = await admin
        .from('general_materials')
        .select('name')
        .eq('id', generalMaterialId)
        .maybeSingle();
      resolvedName = m?.name;
    }
    if (!resolvedName) {
      return new Response(JSON.stringify({ error: 'Material name not resolvable' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userPrompt = `Draft a materials database entry for: ${resolvedName}.${
      extraContext ? `\n\nAdditional context: ${extraContext}` : ''
    }\n\nReturn only the JSON payload defined by the schema.`;

    const aiRes = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Lovable-API-Key': LOVABLE_API_KEY,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'material_draft',
            schema: JSON_SCHEMA,
            strict: true,
          },
        },
      }),
    });

    if (!aiRes.ok) {
      const details = await aiRes.text();
      console.error('AI gateway failed:', aiRes.status, details);
      return new Response(
        JSON.stringify({ error: 'AI request failed', status: aiRes.status, details }),
        { status: aiRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content;
    let payload: unknown;
    try {
      payload = typeof content === 'string' ? JSON.parse(content) : content;
    } catch {
      return new Response(JSON.stringify({ error: 'Non-JSON AI response', raw: content }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: draft, error } = await admin
      .from('ai_material_drafts')
      .insert({
        general_material_id: generalMaterialId ?? null,
        material_name: resolvedName,
        prompt: userPrompt,
        generated_payload: payload,
        model: 'google/gemini-3-flash-preview',
        source: 'ai',
        status: 'pending',
        created_by: userData.user.id,
      })
      .select()
      .single();
    if (error) throw error;

    return new Response(JSON.stringify({ draft }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : String(e);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});