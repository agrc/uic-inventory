export const valueToLabel = (list = [], value) => {
  const item = list.find((x) => x.value === value);

  return item?.label ?? value;
};

export const contactTypes = [
  {
    value: 'owner_operator',
    label: 'Owner/Operator',
  },
  {
    value: 'facility_owner',
    label: 'Owner',
  },
  {
    value: 'facility_operator',
    label: 'Operator',
  },
  {
    value: 'facility_manager',
    label: 'Facility Manager',
  },
  {
    value: 'legal_rep',
    label: 'Legal Representative',
  },
  {
    value: 'official_rep',
    label: 'Official Representative',
  },
  {
    value: 'contractor',
    label: 'Contractor',
  },
  {
    value: 'project_manager',
    label: 'DEQ Dist Eng/Project Manager',
  },
  {
    value: 'health_dept',
    label: 'Local Health Department',
  },
  {
    value: 'permit_writer',
    label: 'Permit Writer',
  },
  {
    value: 'developer',
    label: 'Developer',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

export const validSiteContactTypes = ['legal_rep', 'facility_owner', 'owner_operator'];

export const serContactTypes = [
  {
    value: 'project_manager',
    label: 'DEQ Dist Eng/Project Manager',
  },
];

export const serDivisions = [
  { value: 'Division of Air Quality' },
  { value: 'Division of Drinking Water' },
  { value: 'Division of Environmental Response and Remediation' },
  { value: 'Division of Waste Management and Radiation Control' },
  { value: 'Division of Water Quality' },
];

export const ownershipTypes = [
  {
    value: 'PB',
    label: 'Private, For-Profit',
  },
  {
    value: 'PN',
    label: 'Private, Not-For-Profit',
  },
  {
    value: 'PF',
    label: 'Private, Farm',
  },
  {
    value: 'PV',
    label: 'Private, Other',
  },
  {
    value: 'FG',
    label: 'Federal Government',
  },
  {
    value: 'SG',
    label: 'State Government',
  },
  {
    value: 'LG',
    label: 'Local Government',
  },
  {
    value: 'OT',
    label: 'Tribal Government',
  },
  {
    value: 'OI',
    label: 'Individual/Household',
  },
  {
    value: 'OR',
    label: 'Other',
  },
];

export const operatingStatusTypes = [
  { value: 'AC', label: 'Active' },
  { value: 'PA', label: 'Abandoned - Approved' },
  { value: 'PR', label: 'Proposed Under Authorization By Rule' },
  { value: 'OT', label: 'Other' },
];

export const remediationTypes = [
  { value: 1, label: 'Brownfield' },
  { value: 2, label: 'LUST' },
  { value: 3, label: 'NPL' },
  { value: 4, label: 'RCRA' },
  { value: 5, label: 'Superfund' },
  { value: 6, label: 'TRI' },
  { value: 7, label: 'VCP' },
  { value: 8, label: 'DSHW' },
  { value: 999, label: 'Other' },
];

export const wellTypes = [
  { value: -1, label: 'General', primary: true, epa: 'NO CODE' },
  { value: 5000, label: 'Agricultural Drainage', epa: '5H2' },
  { value: 5001, label: 'Aquifer Recharge', epa: '5B1' },
  { value: 5002, label: 'Subsurface environmental remediation wells', epa: '5B6', primary: true },
  { value: 5003, label: 'Direct Heat Re-Injection', epa: '5C3' },
  { value: 5004, label: 'Domestic Wastewater Treatment Plant Effluent Disposal', epa: '5D' },
  { value: 5005, label: 'Electric Power Re-Injection', epa: '5C4' },
  { value: 5006, label: 'Experimental Technology', epa: '5G' },
  { value: 5007, label: 'Ground Water Aquaculture Return Flow', epa: '5C5' },
  { value: 5008, label: 'Heat Pump/AC Return Flow', epa: '5C2' },
  { value: 5010, label: 'Industrial Drainage', epa: '5A' },
  { value: 5011, label: 'Industrial Process - Water and Waste (General)', epa: '5A24' },
  { value: 5012, label: 'Industrial Process - Car Wash', epa: '5A1' },
  { value: 5013, label: 'Industrial Process - Car Wash (no engine/undercarriage)', epa: '5A2' },
  { value: 5014, label: 'Industrial Process - Appliance Service', epa: '5A3' },
  { value: 5015, label: 'Industrial Process - Beauty/Barber', epa: '5A4' },
  { value: 5016, label: 'Industrial Process - Nail Salon', epa: '5A5' },
  { value: 5017, label: 'Industrial Process - Dry Cleaner', epa: '5A6' },
  { value: 5018, label: 'Industrial Process - Laundromat (no DC)', epa: '5A7' },
  { value: 5019, label: 'Industrial Process - Funeral Services', epa: '5A8' },
  { value: 5020, label: 'Industrial Process - Wood/Furniture Finishing', epa: '5A9' },
  { value: 5021, label: 'Industrial Process - Machine/Welding', epa: '5A10' },
  { value: 5022, label: 'Industrial Process - Medical Services', epa: '5A11' },
  { value: 5023, label: 'Industrial Process - Pesticide Services', epa: '5A12' },
  { value: 5024, label: 'Industrial Process - Photographic Processing', epa: '5A13' },
  { value: 5025, label: 'Industrial Process - Printing', epa: '5A14' },
  { value: 5026, label: 'Veterinary, kennel, or pet grooming wastewater disposal system', epa: '5A15', primary: true },
  { value: 5027, label: 'Industrial Process - Metal Plating', epa: '5A16' },
  { value: 5028, label: 'Industrial Process - Equipment Manufacturing', epa: '5A17' },
  { value: 5029, label: 'Industrial Process - Cooling Water (no additives)', epa: '5A18' },
  { value: 5030, label: 'Industrial Process - Cooling Water (with additives)', epa: '5A19' },
  { value: 5031, label: 'Industrial Process - Food Processing', epa: '5A20' },
  { value: 5032, label: 'Industrial Process - Small Engine', epa: '5A21' },
  { value: 5034, label: 'Industrial Process - Drinking Water Treatment Residual', epa: '5A23' },
  { value: 5035, label: 'In-Situ Fossil Fuel Recovery', epa: '5L2' },
  { value: 5037, label: 'Mining Sand Or Other Backfill', epa: '5I' },
  { value: 5038, label: 'Motor Vehicle Waste Disposal (BANNED)', epa: '5K' },
  { value: 5040, label: 'Saline Water Intrusion Barrier', epa: '5B2' },
  {
    value: 5101,
    label: 'UIC-Regulated large underground wastewater disposal system',
    epa: '5F',
    extra: '(LUWDS) => 5000 gdp',
    primary: true,
  },
  { value: 5044, label: 'Solution Mining', epa: '5L1' },
  { value: 5045, label: 'Other Drainage', epa: '5H3' },
  { value: 5046, label: 'Spent-Brine Return Flow', epa: '5C1' },
  { value: 5047, label: 'Storm water drainage wells', epa: '5H1', primary: true },
  { value: 5048, label: 'Subsidence Control Wells', epa: '5B3' },
  { value: 5050, label: 'Aquifer Storage and Recovery', epa: '5B4' },
  { value: 5100, label: 'CessPools/Untreated Sewage Waste Disposal', epa: '5E' },
  { value: 5998, label: 'Experimental Technology CO2 Sequestration', epa: '5G2' },
  { value: 5999, label: 'Other (Class V)', epa: '5X' },
];
