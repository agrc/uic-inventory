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
