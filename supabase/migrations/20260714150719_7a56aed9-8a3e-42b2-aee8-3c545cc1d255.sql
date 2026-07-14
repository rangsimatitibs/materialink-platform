
DROP TABLE IF EXISTS
  public.application_match_considerations,
  public.application_match_strengths,
  public.application_matches,
  public.material_applications,
  public.material_properties,
  public.material_properties_database,
  public.material_property_sources,
  public.material_property_values,
  public.material_regulations,
  public.material_sustainability,
  public.material_synonyms,
  public.materials,
  public.supplier_certifications,
  public.supplier_detailed_properties,
  public.supplier_properties,
  public.suppliers,
  public.research_material_applications,
  public.research_material_properties,
  public.research_materials,
  public.lab_recipe_materials,
  public.lab_recipe_steps,
  public.lab_recipes,
  public.bibliography_entries,
  public.bibliography_libraries,
  public.saved_bibliography_entries,
  public.external_data_sources,
  public.excluded_search_terms,
  public.property_lookup_cache,
  public.optimization_runs,
  public.daily_usage,
  public.monthly_usage,
  public.subscriptions
CASCADE;

DROP FUNCTION IF EXISTS public.search_materials(text, text, text, integer);
DROP FUNCTION IF EXISTS public.has_tier_access(uuid, text);
DROP FUNCTION IF EXISTS public.get_user_tier(uuid);
