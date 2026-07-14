
INSERT INTO public.material_categories (id, name, slug) VALUES
  ('11111111-0000-0000-0000-000000000001','Biocomposites','biocomposites'),
  ('11111111-0000-0000-0000-000000000002','Recycled Polymers','recycled-polymers'),
  ('11111111-0000-0000-0000-000000000003','Natural Fibres','natural-fibres'),
  ('11111111-0000-0000-0000-000000000004','Low-carbon Cement','low-carbon-cement')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.applications (id, name) VALUES
  ('22222222-0000-0000-0000-000000000001','Packaging'),
  ('22222222-0000-0000-0000-000000000002','Insulation'),
  ('22222222-0000-0000-0000-000000000003','Bottles & Fibres'),
  ('22222222-0000-0000-0000-000000000004','Structural Concrete')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.certifications (id, name, issuing_body, region) VALUES
  ('33333333-0000-0000-0000-000000000001','EPD','International EPD System','Global'),
  ('33333333-0000-0000-0000-000000000002','Cradle to Cradle Certified','C2C Products Innovation Institute','Global'),
  ('33333333-0000-0000-0000-000000000003','GRS','Textile Exchange','Global')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.companies (id, company_name, slug, country, website, description, company_type, sustainability_focus, verified_status) VALUES
  ('aaaaaaaa-0000-0000-0000-000000000001','Ecovative','ecovative','USA','https://ecovative.com','Mycelium-based biomaterials pioneer.','producer','Mycelium biocomposites, home-compostable','approved'),
  ('aaaaaaaa-0000-0000-0000-000000000002','Indorama Ventures','indorama','Thailand','https://indoramaventures.com','Global leader in PET recycling and rPET resins.','producer','Recycled PET, closed-loop bottles','approved'),
  ('aaaaaaaa-0000-0000-0000-000000000003','Hempitecture','hempitecture','USA','https://hempitecture.com','Industrial hemp fibre insulation and boards.','producer','Carbon-negative hemp construction materials','approved'),
  ('aaaaaaaa-0000-0000-0000-000000000004','Wagners CFT','wagners-cft','Australia','https://wagner.com.au','Earth Friendly Concrete – geopolymer binder systems.','producer','Geopolymer, low-clinker cementitious systems','approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.general_materials (id, name, slug, short_description, category_id, chemical_formula, sustainability_summary, end_of_life_summary, production_scale_maturity, data_confidence, status) VALUES
  ('bbbbbbbb-0000-0000-0000-000000000001','Mycelium composite','mycelium-composite','Grown biocomposite from mycelium and agricultural residues.','11111111-0000-0000-0000-000000000001',NULL,'Home-compostable, low embodied carbon, agricultural waste feedstock.','Home compostable within 45 days.','commercial','high','published'),
  ('bbbbbbbb-0000-0000-0000-000000000002','rPET pellet','rpet-pellet','Post-consumer recycled polyethylene terephthalate pellets.','11111111-0000-0000-0000-000000000002','(C10H8O4)n','Displaces virgin PET; ~70% lower embodied carbon vs virgin.','Mechanically recyclable in PET streams.','industrial','high','published'),
  ('bbbbbbbb-0000-0000-0000-000000000003','Hemp fibre board','hemp-fibre-board','Rigid board of industrial hemp fibres with bio-binder.','11111111-0000-0000-0000-000000000003',NULL,'Carbon storage through hemp cultivation; low VOC.','Compostable / biomass energy recovery.','commercial','medium','published'),
  ('bbbbbbbb-0000-0000-0000-000000000004','Geopolymer concrete','geopolymer-concrete','Alkali-activated binder concrete with no Portland cement.','11111111-0000-0000-0000-000000000004',NULL,'~60% lower CO2e vs OPC concrete; uses fly ash / slag.','Recyclable as aggregate.','industrial','high','published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.supplier_material_grades (id, general_material_id, company_id, grade_name, description, production_scale, availability_type, country_of_production, verified_status, premium_visibility, status) VALUES
  ('cccccccc-0000-0000-0000-000000000001','bbbbbbbb-0000-0000-0000-000000000001','aaaaaaaa-0000-0000-0000-000000000001','Mycelium Foam MF-180','Standard density mycelium foam block.','commercial','wholesale','USA','approved',true,'approved'),
  ('cccccccc-0000-0000-0000-000000000002','bbbbbbbb-0000-0000-0000-000000000002','aaaaaaaa-0000-0000-0000-000000000002','Ramapet R1 rPET','98% post-consumer recycled PET resin pellets.','industrial','industrial','Thailand','approved',true,'approved'),
  ('cccccccc-0000-0000-0000-000000000003','bbbbbbbb-0000-0000-0000-000000000003','aaaaaaaa-0000-0000-0000-000000000003','HempWool Board HB-60','Rigid hemp fibre insulation board.','commercial','wholesale','USA','approved',true,'approved'),
  ('cccccccc-0000-0000-0000-000000000004','bbbbbbbb-0000-0000-0000-000000000004','aaaaaaaa-0000-0000-0000-000000000004','EFC 40MPa','Earth Friendly Concrete, 40 MPa grade.','industrial','on_demand','Australia','approved',true,'approved')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.material_properties (owner_type, owner_id, property_name, exact_value, unit, confidence_level) VALUES
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','Density',180,'kg/m³','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','Compressive strength',0.32,'MPa','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','Young''s modulus',18,'MPa','medium'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','Thermal conductivity',0.04,'W/m·K','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','Processing temperature',28,'°C','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','Density',1380,'kg/m³','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','Tensile strength',55,'MPa','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','Melt temperature',255,'°C','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000003','Density',150,'kg/m³','medium'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000003','Thermal conductivity',0.039,'W/m·K','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004','Density',2350,'kg/m³','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004','Compressive strength',40,'MPa','high'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004','Young''s modulus',30,'GPa','medium');

INSERT INTO public.sustainability_indicators (owner_type, owner_id, bio_based_content, recycled_content, carbon_footprint_value, carbon_footprint_unit, lca_available, epd_available, notes) VALUES
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001',100,0,0.42,'kg CO2e/kg',true,true,'Cradle-to-gate, agricultural residue feedstock.'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002',0,98,1.35,'kg CO2e/kg',true,true,'EPD published; ~70% reduction vs virgin PET.'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000003',95,0,0.68,'kg CO2e/kg',true,false,'Carbon storage from hemp not counted.'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004',0,60,0.21,'kg CO2e/kg',true,true,'Compared to OPC-only concrete baseline.');

INSERT INTO public.material_applications (owner_type, owner_id, application_id) VALUES
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000001'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','22222222-0000-0000-0000-000000000002'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','22222222-0000-0000-0000-000000000003'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000003','22222222-0000-0000-0000-000000000002'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004','22222222-0000-0000-0000-000000000004');

INSERT INTO public.material_certifications (owner_type, owner_id, certification_id, status) VALUES
  ('general_material','bbbbbbbb-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000001','active'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000001','active'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000002','33333333-0000-0000-0000-000000000003','active'),
  ('general_material','bbbbbbbb-0000-0000-0000-000000000004','33333333-0000-0000-0000-000000000001','active'),
  ('supplier_grade','cccccccc-0000-0000-0000-000000000001','33333333-0000-0000-0000-000000000002','active');
