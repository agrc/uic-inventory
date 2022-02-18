export const valueToLabel = (list = [], value) => {
  const item = list.find((x) => x.value === value);

  return item?.label ?? value;
};

export const wellTypes = [
  {
    value: -1,
    label: 'General',
  },
  {
    value: 5047,
    label: 'Storm water drainage wells',
  },
  {
    value: 5002,
    label: 'Subsurface environmental remediation wells',
  },
  {
    value: 5101,
    label: 'UIC - Regulated large underground wastewater disposal system',
    extra: '(LUWDS) => 5000 gdp',
  },
  {
    value: 5026,
    label: 'Veterinary, kennel, or pet grooming wastewater disposal system',
  },
];

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
  { value: 'PA', label: 'Abandoned ‐ Approved' },
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

export const subClassTypes = [
  { value: 5000, label: 'Agricultural Drainage' },
  { value: 5001, label: 'Aquifer Recharge' },
  { value: 5050, label: 'Aquifer Storage and Recovery' },
  { value: 5100, label: 'CessPools/Untreated Sewage Waste Disposal' },
  { value: 5003, label: 'Direct Heat Re-Injection' },
  { value: 5004, label: 'Domestic Wastewater Treatment Plant Effluent Disposal' },
  { value: 5005, label: 'Electric Power Re-Injection' },
  { value: 5006, label: 'Experimental Technology' },
  { value: 5998, label: 'Experimental Technology CO2 Sequestration' },
  { value: 5007, label: 'Ground Water Aquaculture Return Flow' },
  { value: 5008, label: 'Heat Pump/AC Return Flow' },
  { value: 5010, label: 'Industrial Drainage' },
  { value: 5014, label: 'Industrial Process -  Appliance Service' },
  { value: 5015, label: 'Industrial Process -  Beauty/Barber' },
  { value: 5012, label: 'Industrial Process -  Car Wash' },
  { value: 5013, label: 'Industrial Process -  Car Wash (no engine/undercarriage)' },
  { value: 5029, label: 'Industrial Process -  Cooling Water (no additives)' },
  { value: 5030, label: 'Industrial Process -  Cooling Water (with additives)' },
  { value: 5034, label: 'Industrial Process -  Drinking Water Treatment Residual' },
  { value: 5017, label: 'Industrial Process -  Dry Cleaner' },
  { value: 5028, label: 'Industrial Process -  Equipment Manufacturing' },
  { value: 5031, label: 'Industrial Process -  Food Processing' },
  { value: 5019, label: 'Industrial Process -  Funeral Services' },
  { value: 5018, label: 'Industrial Process -  Laundromat (no DC)' },
  { value: 5021, label: 'Industrial Process -  Machine/Welding' },
  { value: 5022, label: 'Industrial Process -  Medical Services' },
  { value: 5027, label: 'Industrial Process -  Metal Plating' },
  { value: 5016, label: 'Industrial Process -  Nail Salon' },
  { value: 5023, label: 'Industrial Process -  Pesticide Services' },
  { value: 5024, label: 'Industrial Process -  Photographic Processing' },
  { value: 5025, label: 'Industrial Process -  Printing' },
  { value: 5032, label: 'Industrial Process -  Small Engine' },
  { value: 5026, label: 'Industrial Process -  Veterinary/Kennel/Grooming' },
  { value: 5011, label: 'Industrial Process -  Water and Waste (General)' },
  { value: 5020, label: 'Industrial Process -  Wood/Furniture Finishing' },
  { value: 5035, label: 'In-Situ Fossil Fuel Recovery' },
  { value: 5037, label: 'Mining Sand Or Other Backfill' },
  { value: 5038, label: 'Motor Vehicle Waste Disposal (BANNED)' },
  { value: 5040, label: 'Saline Water Intrusion Barrier' },
  { value: 5101, label: 'Septic Systems' },
  { value: 5044, label: 'Solution Mining' },
  { value: 5046, label: 'Spent-Brine Return Flow' },
  { value: 5047, label: 'Storm Water Drainage' },
  { value: 5048, label: 'Subsidence Control Wells' },
  { value: 5002, label: 'Subsurface Environmental Remediation' },
  { value: 5045, label: 'Other Drainage' },
  { value: 5999, label: 'Other (Class V)' },
];
