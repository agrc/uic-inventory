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
  naics: yup
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
        'health_dep',
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
  name: yup.string().max(512).required(),
  order: yup.number().typeError('Order number is required').integer().positive().required('Order number is required'),
  wellType: yup.string().oneOf(['general', 'storm', 'remediation', 'uic', 'veterinary']).required().label('Well Type'),
});
