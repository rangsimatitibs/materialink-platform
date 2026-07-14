import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const UA = 'MateriaLink/1.0 (rangsimatiti.b.s@gmail.com)';

async function fetchPubChem(query: string) {
  // 1. Resolve CID by name
  const cidRes = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/cids/JSON`,
    { headers: { 'User-Agent': UA } },
  );
  if (!cidRes.ok) throw new Error(`PubChem name lookup failed: ${cidRes.status}`);
  const cidJson = await cidRes.json();
  const cid = cidJson?.IdentifierList?.CID?.[0];
  if (!cid) throw new Error('No PubChem CID found');

  // 2. Fetch properties
  const propRes = await fetch(
    `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${cid}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES,XLogP,ExactMass/JSON`,
    { headers: { 'User-Agent': UA } },
  );
  if (!propRes.ok) throw new Error(`PubChem property lookup failed: ${propRes.status}`);
  const p = (await propRes.json())?.PropertyTable?.Properties?.[0] ?? {};

  const properties: Array<Record<string, unknown>> = [];
  if (p.MolecularWeight)
    properties.push({
      property_name: 'Molecular weight',
      exact_value: Number(p.MolecularWeight),
      unit: 'g/mol',
      confidence_level: 'verified',
      test_standard: 'PubChem',
    });
  if (p.ExactMass)
    properties.push({
      property_name: 'Exact mass',
      exact_value: Number(p.ExactMass),
      unit: 'Da',
      confidence_level: 'verified',
      test_standard: 'PubChem',
    });
  if (p.XLogP !== undefined && p.XLogP !== null)
    properties.push({
      property_name: 'XLogP',
      exact_value: Number(p.XLogP),
      unit: '',
      confidence_level: 'verified',
      test_standard: 'PubChem',
    });

  return {
    name: query,
    chemical_formula: p.MolecularFormula ?? null,
    short_description: p.IUPACName ? `IUPAC: ${p.IUPACName}` : null,
    data_confidence: 'verified',
    properties,
    _meta: { pubchem_cid: cid, canonical_smiles: p.CanonicalSMILES },
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const jwt = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
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
    if (!(roleData ?? []).some((r) => r.role === 'admin')) {
      return new Response(JSON.stringify({ error: 'Admins only' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const query: string | undefined = body?.query;
    const generalMaterialId: string | undefined = body?.general_material_id;
    if (!query) {
      return new Response(JSON.stringify({ error: 'query required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const payload = await fetchPubChem(query);

    const { data: draft, error } = await admin
      .from('ai_material_drafts')
      .insert({
        general_material_id: generalMaterialId ?? null,
        material_name: query,
        prompt: `PubChem import for "${query}"`,
        generated_payload: payload,
        model: 'external:pubchem',
        source: 'pubchem',
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