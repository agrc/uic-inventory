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
