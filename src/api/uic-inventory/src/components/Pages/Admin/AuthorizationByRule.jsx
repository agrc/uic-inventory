import { useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { List } from 'react-content-loader';

import { AuthContext } from '../../../AuthProvider';
import { Chrome, useParams, onRequestError } from '../../PageElements';
import { wellTypes } from '../../../data/lookups';

export default function AuthorizationByRule() {
  const { inventoryId, siteId } = useParams();
  const { status, data } = useQuery({
    queryKey: ['inventory', inventoryId],
    queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
  });

  return (
    <Chrome title="Authorization by Rule">
      <section className="m-20 mx-auto max-w-prose space-y-4 rounded-sm outline outline-offset-[3rem] outline-gray-300">
        {status === 'loading' && <List />}
        {status === 'success' && getAbrType(data)}
      </section>
      <section className="mt-10 flex flex-1 justify-center gap-6 print:hidden">
        <button
          onClick={open}
          className="inline-flex justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 font-medium text-white shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:opacity-50 sm:col-span-6 md:col-span-2"
        >
          Cancel
        </button>
        <button data-meta="default" className="sm:col-span-6 md:col-span-2">
          Approve and Send
        </button>
      </section>
    </Chrome>
  );
}

const getAbrType = (data) => {
  switch (data.subClass) {
    case -1: {
      return <General inventory={data} />;
    }
    default: {
      return <General inventory={data} />;
    }
  }
};

function General({ inventory }) {
  const { authInfo } = useContext(AuthContext);
  const { siteId } = useParams();

  const wellCount = inventory.wells.reduce((sum, well) => sum + well.count, 0);
  const wellStatus = inventory.wells.map((well) => well.status).join(', ');

  return (
    <>
      <ContactDetails siteId={siteId} />
      <SubjectDetails inventory={inventory} />
      <p className="font-bold uppercase italic">APPROVAL AND AUTHORIZATION</p>
      <p>
        The Division of Water Quality (DWQ) has reviewed the information submitted on the Utah Underground Injection
        Control (UIC) Inventory Information form along with any additional details that may have been provided
        pertaining to the proposed Class V well{wellCount > 1 ? 's' : ''} at the subject property.
      </p>
      <p>
        Approval is hereby granted to construct and operate {wellCount} Class V well{wellCount > 1 ? 's' : ''} under
        Authorization by Rule according to the Administrative Rules for the Utah UIC Program (Utah UIC Program Rules),
        R317-7.
      </p>
      <p>
        The Class V well{wellCount > 1 ? 's' : ''} {wellCount > 1 ? 'are' : 'is'} authorized as{' '}
        {wellTypes.find((item) => item.value === inventory.subClass).label}. The subject facility is authorized to
        dispose of wastewater in accordance with the activities defined in the submitted well inventory application
        associated with this Authorization by Rule approval.
      </p>
      <SurfaceWaterProtection wells={inventory.wells} />
      <p className="text-lg font-black text-red-700">
        NOTICE - You are required to report any well operating status changes (e.g. date constructed, date active, date
        closed, etc.) within the{' '}
        <a data-meta="primary" href="https://uic-inventory.utah.gov/">
          UIC Web Application
        </a>{' '}
        (https://uic-inventory.utah.gov/). The well is currently entered as{' '}
        <span className="text-gray-900">{wellStatus}</span>. You must update the well operating status within the{' '}
        <a data-meta="primary" href="https://uic-inventory.utah.gov/">
          UIC Web Application
        </a>{' '}
        (https://uic-inventory.utah.gov/) if the well status changes.
      </p>
      <p>
        This facility has been assigned a Utah UIC Facility Identification Number:{' '}
        <Note>The facility id will not be created yet. Do we need something new/different?</Note>. Please use this
        identification number when submitting any further information and correspondence regarding injection wells at
        this facility.
      </p>
      <p className="font-bold uppercase italic">PROHIBITION OF UNAUTHORIZED INJECTION</p>
      <p>
        <span className="font-bold">Responsibility of the Utah Division of Water Quality</span> According to the Utah
        UIC Program Rules, Class V injection wells are Authorized by Rule provided inventory information is submitted
        before injection commences. The Utah UIC Program Rules prohibit authorization of underground injections “which
        would allow movement of fluid containing any contaminant into underground sources of drinking water if the
        presence of that contaminant may cause a violation of any primary drinking water regulation (40 CFR Part 141 and
        Utah Public Drinking Water Rules R309-200), or which may adversely affect the health of persons” or which “may
        cause a violation of any ground water quality rules that may be promulgated by the Utah Water Quality Board
        R317-6.”
      </p>
      <p>
        If at any time the Director of the Utah Division of Water Quality determines that a Class V well may cause a
        violation of primary drinking water rules, the Utah UIC Program Rules require the Director to take appropriate
        action to address such determination. The Director may require the injector to obtain an individual permit,
        require the injector to close the injection well, or take appropriate enforcement action including site
        remediation.
      </p>
      <p>
        Responsibility of the Operator Once approval has been given to operate a Class V injection well under
        Authorization by Rule, it is the responsibility of the operator of the Class V injection well to implement
        appropriate Best Management Practices (BMPs) to ensure that the authorized injectate does not contain any
        contaminant that would cause a violation of any primary drinking water regulation or ground water quality rule
        or would otherwise adversely affect the health of persons. Additionally, no injectate other than that for which
        the well is authorized should be allowed to enter the well.
      </p>
      <p>If you have any questions or comments, please feel free to contact us.</p>
      <Sincerely authInfo={authInfo} />
      <div className="flex justify-between">
        Courtesy Copy Recipients:
        <ul>
          <li>[ First Name, Last Name, Organization ]</li>
          <li>[ First Name, Last Name, Organization ]</li>
        </ul>
      </div>
    </>
  );
}

const chooseContactByType = (contacts) => {
  let contact = contacts.find((c) => c.contactType === 'facility_owner');
  if (contact) {
    return contact;
  }

  contact = contacts.find((c) => c.contactType === 'owner_operator');
  if (contact) {
    return contact;
  }

  contact = contacts.find((c) => c.contactType === 'legal_rep');
  if (contact) {
    return contact;
  }

  return { firstName: '', lastName: '', organization: '', mailingAddress: '', city: '', state: '', zip: '' };
};

const ContactDetails = ({ siteId }) => {
  const { status, data } = useQuery({
    queryKey: ['primary-contact', siteId],
    queryFn: async () => {
      const response = await ky.get(`/api/site/${siteId}/contacts`).json();

      return chooseContactByType(response.contacts);
    },
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding the contacts.'),
  });

  if (status === 'loading') {
    return <List />;
  }

  return (
    <>
      <ul>
        <li>{`${data.firstName} ${data.lastName}`}</li>
        <li>{data.organization}</li>
        <li>{data.mailingAddress}</li>
        <li>{data.city && `${data.city}, ${data.state} ${data.zipCode}`}</li>
      </ul>
      <p>Dear {`${data.firstName} ${data.lastName}`}</p>
    </>
  );
};

const SubjectDetails = ({ inventory }) => {
  return (
    <div className="grid grid-cols-4">
      Subject:
      <ul className="col-span-3">
        <li>Approval of Class V Injection Well Authorization by Rule</li>
        <li>
          {wellTypes.find((item) => item.value === inventory.subClass).label} – EPA Well Code – {inventory.subClass}
        </li>
        <li>{inventory.site.name}</li>
        <li>{inventory.site.address}</li>
        <li>
          Utah UIC Facility Identification Number:{' '}
          <Note>
            Will not be known until UIC database row creation and separate from this app. Can this be removed?
          </Note>
        </li>
      </ul>
    </div>
  );
};

const SurfaceWaterProtection = ({ wells }) => {
  const filtered = wells
    .filter((well) => well.surfaceWaterProtection[0] === 'Y')
    .map((well) => {
      return {
        name: well.wellName,
        contacts: well.waterSystemContacts,
      };
    });
  const within = filtered.length > 0;

  // const nameMapping = wells.reduce(
  //   (acc, { name, waterSystemContacts }) => ({ ...acc, [name]: waterSystemContacts.join(', ') }),
  //   {}
  // );

  return (
    <>
      {within && (
        <p>
          The injection wells are located within groundwater-based source water protection zones{' '}
          <Note>We are not storing `SYSNUMBER` currently</Note> for the{' '}
          <span className="font-bold">{filtered.map((well) => well.name).join(', ')}</span> Well in the{' '}
          <Note>How should this read for multiple wells</Note>. The operation of the injection wells may be subject to
          additional requirements and/or restrictions established by local ordinances and/or a Source Water Protection
          Plan.
        </p>
      )}
      {!within && (
        <p>
          The injection well{wells.length > 1 ? 's are' : ' is'} not located within groundwater-based source water
          protection zones 1-4 but is located within an aquifer discharge area. The operation of the injection wells may
          be subject to additional requirements and/or restrictions established by local ordinances and/or a Source
          Water Protection Plan.
        </p>
      )}
    </>
  );
};

const Sincerely = ({ authInfo }) => {
  const profileId = authInfo.id;
  const { status, data } = useQuery({
    queryKey: ['profile', profileId],
    queryFn: () => ky.get(`/api/account/${profileId}`).json(),
    enabled: profileId ? true : false,
    onError: (error) => onRequestError(error, 'We had some trouble finding your profile.'),
  });

  if (status === 'loading') {
    return <List />;
  }
  return (
    <>
      <p>Sincerely,</p>
      <ul>
        <li>{`${authInfo.userData.firstName} ${authInfo.userData.lastName}`}</li>
        <li>{data.organization}</li>
        <li>{data.phoneNumber}</li>
        <li>{data.email}</li>
      </ul>
    </>
  );
};

const Note = ({ children }) => (
  <span className="mx-2 rounded font-bold text-yellow-500 outline outline-offset-4 outline-yellow-500">{children}</span>
);
