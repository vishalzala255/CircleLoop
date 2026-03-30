-- ==========================================
-- CIRCLELOOP SDG, POLICIES & WASTE WORKFLOW
-- Run this to add new tables for SDG Goals, Policies, and Waste Management Workflow
-- ==========================================

-- 1. CREATE SDG GOALS TABLE (Real UN SDG Data)
CREATE TABLE IF NOT EXISTS public.sdg_goals (
  id SERIAL PRIMARY KEY,
  goal_number INTEGER UNIQUE NOT NULL, -- 1-17
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  targets TEXT[], -- Array of target descriptions
  indicators TEXT[], -- Array of indicator descriptions
  color TEXT NOT NULL, -- SDG color code (e.g., #E5243B for Goal 1)
  icon_url TEXT,
  status TEXT DEFAULT 'Active', -- Active, In Progress, Achieved
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CREATE POLICIES TABLE (International and National)
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name TEXT NOT NULL,
  policy_type TEXT NOT NULL CHECK (policy_type IN ('International', 'National', 'Regional')),
  country TEXT,
  category TEXT NOT NULL CHECK (category IN ('E-Waste', 'Recycling', 'Environmental', 'Sustainability', 'Circular Economy')),
  description TEXT NOT NULL,
  effective_date DATE,
  expiry_date DATE,
  source_url TEXT,
  enforcement_body TEXT,
  compliance_requirements TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CREATE WASTE WORKFLOW STAGES TABLE
CREATE TABLE IF NOT EXISTS public.waste_workflow_stages (
  id SERIAL PRIMARY KEY,
  stage_name TEXT UNIQUE NOT NULL CHECK (stage_name IN ('Collection', 'Transport', 'Segregation', 'Processing', 'Dispatch')),
  stage_order INTEGER UNIQUE NOT NULL,
  description TEXT NOT NULL,
  estimated_duration_days INTEGER,
  responsible_party TEXT, -- Customer, Company, Admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. CREATE WASTE TRACKING TABLE (Extended pickup requests with workflow)
CREATE TABLE IF NOT EXISTS public.waste_tracking (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  pickup_request_id BIGINT REFERENCES public.pickup_requests(id) ON DELETE CASCADE,
  current_stage TEXT NOT NULL CHECK (current_stage IN ('Collection', 'Transport', 'Segregation', 'Processing', 'Dispatch')),
  collection_date TIMESTAMP WITH TIME ZONE,
  collection_location TEXT,
  collection_assigned_to uuid REFERENCES public.profiles(id),
  
  transport_date_start TIMESTAMP WITH TIME ZONE,
  transport_date_end TIMESTAMP WITH TIME ZONE,
  transport_vehicle_id TEXT,
  transport_assigned_to uuid REFERENCES public.profiles(id),
  
  segregation_date_start TIMESTAMP WITH TIME ZONE,
  segregation_date_end TIMESTAMP WITH TIME ZONE,
  segregation_categories TEXT[], -- Array of segregated item types
  segregation_assigned_to uuid REFERENCES public.profiles(id),
  
  processing_date_start TIMESTAMP WITH TIME ZONE,
  processing_date_end TIMESTAMP WITH TIME ZONE,
  processing_method TEXT, -- Recycling, Refurbishment, Recovery, Disposal
  processing_assigned_to uuid REFERENCES public.profiles(id),
  
  dispatch_date TIMESTAMP WITH TIME ZONE,
  dispatch_destination TEXT,
  dispatch_assigned_to uuid REFERENCES public.profiles(id),
  final_status TEXT DEFAULT 'In Progress', -- In Progress, Completed, Failed
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. CREATE WASTE TRACKING AUDIT LOG
CREATE TABLE IF NOT EXISTS public.waste_tracking_audit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  waste_tracking_id uuid REFERENCES public.waste_tracking(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  action TEXT NOT NULL,
  performed_by uuid REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. ENABLE RLS ON NEW TABLES
ALTER TABLE public.sdg_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_tracking_audit ENABLE ROW LEVEL SECURITY;

-- 7. RLS POLICIES FOR SDG GOALS (Public Read)
CREATE POLICY "SDG Goals public read" ON public.sdg_goals FOR SELECT USING (true);
CREATE POLICY "SDG Goals admin write" ON public.sdg_goals FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "SDG Goals admin update" ON public.sdg_goals FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 8. RLS POLICIES FOR POLICIES (Public Read)
CREATE POLICY "Policies public read" ON public.policies FOR SELECT USING (true);
CREATE POLICY "Policies admin write" ON public.policies FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Policies admin update" ON public.policies FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- 9. RLS POLICIES FOR WASTE WORKFLOW STAGES (Public Read)
CREATE POLICY "Waste stages public read" ON public.waste_workflow_stages FOR SELECT USING (true);

-- 10. RLS POLICIES FOR WASTE TRACKING
CREATE POLICY "Waste tracking customers view own" ON public.waste_tracking FOR SELECT USING (
  auth.uid() = (SELECT user_id FROM public.pickup_requests WHERE id = waste_tracking.pickup_request_id)
);
CREATE POLICY "Waste tracking admin manage" ON public.waste_tracking FOR ALL USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
CREATE POLICY "Waste tracking company view" ON public.waste_tracking FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'company')
);

-- 11. RLS POLICIES FOR WASTE TRACKING AUDIT (Admin Read)
CREATE POLICY "Waste audit admin read" ON public.waste_tracking_audit FOR SELECT USING (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);
CREATE POLICY "Waste audit admin write" ON public.waste_tracking_audit FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin')
);

-- 12. INSERT REAL UN SDG GOALS DATA
INSERT INTO public.sdg_goals (goal_number, title, description, targets, indicators, color) VALUES
(1, 'No Poverty', 'Eradicate poverty in all its forms everywhere', ARRAY['End poverty in all its dimensions', 'Reduce poverty and vulnerable populations'], ARRAY['Proportion of population below poverty line', 'Employment rate'], '#E5243B'),
(2, 'Zero Hunger', 'End hunger, achieve food security and improved nutrition', ARRAY['End all forms of hunger and malnutrition', 'Double agricultural productivity'], ARRAY['Prevalence of undernourishment', 'Agricultural productivity'], '#DDA63B'),
(3, 'Good Health and Well-Being', 'Ensure healthy lives and promote well-being for all', ARRAY['Reduce mortality rates', 'Combat disease and promote health'], ARRAY['Maternal mortality ratio', 'Under-5 mortality rate'], '#4C9F38'),
(4, 'Quality Education', 'Ensure inclusive and equitable quality education', ARRAY['Free primary education', 'Equal access to education'], ARRAY['Completion rates', 'Literacy rate'], '#C6192B'),
(5, 'Gender Equality', 'Achieve gender equality and empower all women and girls', ARRAY['End discrimination and violence', 'Ensure participation in leadership'], ARRAY['Women in parliament', 'Gender wage gap'], '#FF3A21'),
(6, 'Clean Water and Sanitation', 'Ensure access to water and sanitation', ARRAY['Universal access to safe drinking water', 'Adequate sanitation'], ARRAY['Population with access to safe water', 'Sanitation facilities'], '#26BDE2'),
(7, 'Affordable and Clean Energy', 'Ensure access to modern energy services', ARRAY['Universal access to modern energy', 'Increase renewable energy share'], ARRAY['Renewable energy share', 'Energy efficiency'], '#FCCC0A'),
(8, 'Decent Work and Economic Growth', 'Promote inclusive economic growth and decent work', ARRAY['Full employment opportunities', 'Safe working conditions'], ARRAY['Unemployment rate', 'Labor productivity'], '#A21E48'),
(9, 'Industry, Innovation and Infrastructure', 'Build resilient infrastructure and foster innovation', ARRAY['Develop reliable and sustainable infrastructure', 'Increase innovation'], ARRAY['Infrastructure development', 'R&D expenditure'], '#DD1C3B'),
(10, 'Reduced Inequalities', 'Reduce inequality within and among countries', ARRAY['Promote income growth for bottom 40%', 'Reduce inequalities'], ARRAY['Income inequality', 'Social mobility'], '#DD1C3B'),
(11, 'Sustainable Cities and Communities', 'Make cities inclusive, safe and sustainable', ARRAY['Safe housing and transport', 'Reduce pollution and waste'], ARRAY['Urban population in adequate housing', 'Air quality'], '#FD6925'),
(12, 'Responsible Consumption and Production', 'Ensure sustainable consumption and production patterns', ARRAY['Reduce waste generation', 'Decrease food waste'], ARRAY['Waste per capita', 'Recycling rate'], '#BF8B2E'),
(13, 'Climate Action', 'Take urgent action to combat climate change', ARRAY['Strengthen resilience to climate change', 'Reduce emissions'], ARRAY['CO2 emissions', 'Climate resilience'], '#407D52'),
(14, 'Life Below Water', 'Conserve and sustainably use oceans and marine resources', ARRAY['Prevent marine pollution', 'Protect marine ecosystems'], ARRAY['Ocean health index', 'Overfishing rate'], '#0A97D9'),
(15, 'Life on Land', 'Protect, restore and promote sustainable use of terrestrial ecosystems', ARRAY['Halt deforestation', 'Prevent species extinction'], ARRAY['Forest coverage', 'Species extinction rate'], '#56C596'),
(16, 'Peace, Justice and Strong Institutions', 'Promote peaceful and inclusive societies', ARRAY['Reduce violence and corruption', 'Build effective institutions'], ARRAY['Violence rate', 'Corruption index'], '#00689D'),
(17, 'Partnerships for the Goals', 'Strengthen implementation and partnerships for sustainable development', ARRAY['Strengthen partnerships', 'Encourage collaboration'], ARRAY['ODA contributions', 'Technology transfer'], '#1F4788');

-- 13. INSERT REAL INTERNATIONAL E-WASTE AND RECYCLING POLICIES
INSERT INTO public.policies (policy_name, policy_type, country, category, description, effective_date, source_url, enforcement_body) VALUES
('Basel Convention', 'International', NULL, 'E-Waste', 'International treaty designed to reduce movements of hazardous waste between nations, and specifically to prevent transfer of hazardous waste from developed to less developed countries', '1992-05-22', 'https://www.basel.int/', 'Basel Convention Secretariat'),
('Restriction of Hazardous Substances Directive (RoHS)', 'International', 'EU', 'E-Waste', 'Restricts the use of specific hazardous substances in electrical and electronic equipment', '2003-02-13', 'https://ec.europa.eu/growth/tools-databases/nando/index.cfm?fuseaction=directive.index&dir_id=13', 'European Commission'),
('Waste Electrical and Electronic Equipment Directive (WEEE)', 'International', 'EU', 'E-Waste', 'Establishes extended producer responsibility (EPR) for WEEE collection, reuse and recovery', '2003-01-27', 'https://ec.europa.eu/environment/waste/weee/index_en.htm', 'European Commission'),
('End of Life Vehicles Directive (ELV)', 'International', 'EU', 'Recycling', 'Directive on the treatment of end-of-life vehicles and their components', '2000-06-18', 'https://ec.europa.eu/growth/tools-databases/nando/index.cfm?fuseaction=directive.index&dir_id=33', 'European Commission'),
('Extended Producer Responsibility Directive (EPR)', 'International', 'EU', 'Circular Economy', 'Makes producers responsible for the entire lifecycle of their products', '2005-04-04', 'https://ec.europa.eu/environment/circular-economy/', 'European Commission'),
('National Pollutant Release Inventory', 'National', 'Canada', 'Environmental', 'Requirement for facilities to report release of pollutants', '1994-01-01', 'https://www.canada.ca/en/services/environment/pollution-prevention/national-pollutant-release-inventory.html', 'Environment and Climate Change Canada'),
('Resource Conservation and Recovery Act (RCRA)', 'National', 'United States', 'E-Waste', 'Federal law that governs the disposal of solid waste and hazardous waste', '1976-10-21', 'https://www.epa.gov/rcra', 'EPA'),
('Comprehensive Environmental Response, Compensation and Liability Act (CERCLA)', 'National', 'United States', 'Environmental', 'Comprehensive environmental liability statute', '1980-12-11', 'https://www.epa.gov/superfund/superfund-cercla-overview', 'EPA'),
('India E-Waste Management Rules', 'National', 'India', 'E-Waste', 'Specifies responsibilities of manufacturers, bulk consumers, collection agencies, recyclers and other stakeholders in the management of e-waste', '2016-03-24', 'https://www.cpcb.nic.in/', 'Central Pollution Control Board'),
('India Plastic Waste Management Rules', 'National', 'India', 'Recycling', 'Regulates plastic waste management and promotes circular economy', '2016-03-18', 'https://www.moefcc.gov.in/', 'Ministry of Environment, Forest and Climate Change'),
('China Electronic Information Products RoHS', 'National', 'China', 'E-Waste', 'Requirement that reduces hazardous substances in electronic products', '2006-03-01', 'https://www.miit.gov.cn/', 'Ministry of Industry and Information Technology'),
('Japan Home Appliance Recycling Law', 'National', 'Japan', 'E-Waste', 'Law obligating consumers to pay recycling costs and retailers to accept used appliances', '2001-04-01', 'https://www.env.go.jp/', 'Ministry of Environment');

-- 14. INSERT WASTE WORKFLOW STAGES
INSERT INTO public.waste_workflow_stages (stage_name, stage_order, description, estimated_duration_days, responsible_party) VALUES
('Collection', 1, 'Customer initiates e-waste collection request and provides item details. Collection team verifies and pickups items from customer location.', 3, 'Company'),
('Transport', 2, 'Collected e-waste is transported from customer location to processing facility using designated vehicles with proper handling protocols.', 2, 'Company'),
('Segregation', 3, 'E-waste items are segregated by type (metals, plastics, circuit boards, etc.) and assessed for reusability or recycling potential.', 5, 'Company'),
('Processing', 4, 'Items undergo processing: refurbishment for reusable items, or recycling/recovery for non-reusable items. Hazardous components are safely handled.', 7, 'Company'),
('Dispatch', 5, 'Processed items are dispatched to partners, refurbishment centers, or final disposal facilities. Complete tracking provided to stakeholders.', 2, 'Company');

COMMIT;
