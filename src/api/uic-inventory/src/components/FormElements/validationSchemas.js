import * as yup from 'yup';

const firstName = yup.string().max(128).required().label('First name');
const lastName = yup.string().max(128).required().label('Last name');
const email = yup.string().email().max(512).required().label('Email');
const organization = yup.string().max(512).required().label('Organization');
const phoneNumber = yup
  .string()
  .ensure()
  .max(12)
  .required()
  .matches(/^[+]\d{11}$/, 'The phone number format is incorrect')
  .label('Phone');
const mailingAddress = yup.string().max(512).required().label('Address');
const city = yup.string().max(128).required().label('City');
const state = yup.string().max(2).required().label('State');
const zipCode = yup.string().max(64).required().label('Zip');

export const ProfileSchema = yup.object().shape({
  firstName,
  lastName,
  email,
  organization,
  phoneNumber,
  mailingAddress,
  city,
  state,
  zipCode,
});

export const SiteSchema = yup.object().shape({
  name: yup.string().max(512).required().label('Name'),
  ownership: yup.string().max(512).required().label('ownership'),
  naicsPrimary: yup
    .string()
    .matches(/^\d{6}$/, 'NAICS codes must be a 6 digit code')
    .required()
    .label('NAICS code'),
  naicsTitle: yup.string().max(512).required().label('NAICS title'),
});

export const ContactSchema = yup.object().shape({
  description: yup.string().when('contactType', {
    is: 'OTHER',
    then: yup.string().required().min(5).max(512),
  }),
  contactType: yup
    .string()
    .required()
    .oneOf(
      [
        'owner_operator',
        'facility_owner',
        'facility_operator',
        'facility_manager',
        'legal_rep',
        'office_rep',
        'contractor',
        'project_manager',
        'health_dept',
        'permit_writer',
        'developer',
        'other',
      ],
      'A valid selection must be made'
    )
    .label('Contact Type'),
  firstName,
  lastName,
  email,
  organization,
  phoneNumber,
  mailingAddress,
  city,
  state,
  zipCode,
});

export const ContactProgramSchema = yup.object().shape({
  message: yup.string().max(512).required().label('Message'),
});

export const SiteLocationSchema = yup.object().shape({
  address: yup.string().max(512).required('A site address or a point location is required').label('Address'),
  geometry: yup
    .object()
    .nullable()
    .pick(['geometry'])
    .required('A site geometry must be selected or created')
    .label('Site location'),
});

export const WellSchema = yup.object().shape({
  orderNumber: yup
    .number()
    .typeError('Order number is required')
    .integer()
    .positive()
    .required('Order number is required'),
  subClass: yup.number().oneOf([-1, 5047, 5002, 5101, 5026]).required().label('Well Type'),
});

export const WellLocationSchema = yup.object().shape({
  construction: yup.string().max(512).required(),
  status: yup
    .string()
    .oneOf(['AC', 'PA', 'TA', 'AN', 'PW', 'PR', 'PI', 'OT'], 'A valid selection must be made')
    .required(),
  description: yup.string().when('status', {
    is: 'OT',
    then: yup.string().required().min(5).max(512),
  }),
  count: yup.number().typeError('A well count is required').integer().positive().required(),
  geometry: yup
    .string()
    .matches(/^-?\d+,\s\d+$/, 'The format of the geometry is incorrect')
    .required('A well point must be placed on the map')
    .label('Well location'),
  // only for SER wells
  remediationType: yup
    .mixed()
    .optional()
    .when('$subClass', {
      is: 5002,
      then: yup
        .number()
        .typeError('A valid selection is required')
        .oneOf([1, 2, 3, 4, 5, 6, 7, 8, 999], 'A valid selection must be made')
        .required(),
    }),
  remediationDescription: yup
    .mixed()
    .optional()
    .when('remediationType', {
      is: 999,
      then: yup.string().required().min(5).max(512).label('Remediation Description'),
    }),
  remediationProjectId: yup.string().optional(),
});
