import { useContext, useRef } from 'react';
import { useQuery } from 'react-query';
import ky from 'ky';
import clsx from 'clsx';

import { AuthContext } from '../../../AuthProvider';
import { FormGrid, ResponsiveGridColumn } from '../../FormElements';
import { Chrome, useParams, onRequestError } from '../../PageElements';
import { ownershipTypes, wellTypes, contactTypes, valueToLabel } from '../../../data/lookups';
import { useWebMap, useViewPointZooming, useGraphicManager } from '../../Hooks';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
});

export default function Review() {
  const { inventoryId, siteId } = useParams();
  const { authInfo } = useContext(AuthContext);

  return (
    <Chrome title="Inventory Review">
      <SiteAndInventoryDetails siteId={siteId} inventoryId={inventoryId} />
      <LocationDetails />
      <ContactDetails siteId={siteId} />
      <WellDetails siteId={siteId} inventoryId={inventoryId} />
      <Section>
        <button className="inline-flex justify-center px-4 py-2 font-medium text-white bg-gray-800 border border-transparent rounded-md shadow-sm md:col-span-2 sm:col-span-6 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800 disabled:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed">
          Reject
        </button>
        <button meta="primary" className="border rounded md:col-span-2 sm:col-span-6">
          Print
        </button>
        <button meta="default" className="md:col-span-2 sm:col-span-6">
          Approve
        </button>
      </Section>
    </Chrome>
  );
}

const Label = ({ children }) => <span className="block font-bold text-gray-700">{children}</span>;

const Value = ({ children, className }) => <span className={clsx('block ml-2', className)}>{children}</span>;

const Section = ({ gray, children, title }) => (
  <>
    <h1 className="mb-2 text-xl font-medium">{title}</h1>
    <div className="mb-3 ml-1 overflow-scroll border shadow sm:rounded-md max-h-96">
      <div
        className={clsx(
          {
            'bg-gray-50': gray,
            'bg-white': !gray,
          },
          'px-4 py-5 sm:p-6'
        )}
      >
        <FormGrid>{children}</FormGrid>
      </div>
    </div>
  </>
);

const SiteAndInventoryDetails = ({ siteId, inventoryId }) => {
  const { data } = useQuery(
    ['inventory', inventoryId],
    () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    {
      enabled: siteId > 0,
      onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
    }
  );

  return (
    <>
      <Section title="Site Details">
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>Name</Label>
          <Value>{data?.site.name}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>Address</Label>
          <Value>{data?.site.address}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>Land Ownership</Label>
          <Value>{valueToLabel(ownershipTypes, data?.site.ownership)}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>NAICS</Label>
          <Value>{`${data?.site.naicsPrimary} - ${data?.site.naicsTitle}`}</Value>
        </ResponsiveGridColumn>
      </Section>
      <Section title="Inventory Details">
        <ResponsiveGridColumn full={true} half={true}>
          <Label>Inventory Class</Label>
          <Value>{valueToLabel(wellTypes, data?.subClass)}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true}>
          <Label>Order Number</Label>
          <Value>{data?.orderNumber}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true}>
          <Label>Signed By</Label>
          <Value>{data?.signature}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true}>
          <Label>Signed On</Label>
          <Value>{data?.submittedOn && dateFormatter.format(Date.parse(data?.submittedOn))}</Value>
        </ResponsiveGridColumn>
      </Section>
    </>
  );
};

const ContactDetails = ({ siteId }) => {
  const { data } = useQuery(['contacts', siteId], () => ky.get(`/api/site/${siteId}/contacts`).json(), {
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding the contacts.'),
  });

  return (
    <Section gray={true} title="Site Contacts">
      {data?.contacts.map((contact) => (
        <Panel key={contact.id}>
          <ResponsiveGridColumn full={true} half={true}>
            <Value className="px-2 py-1 mb-3 -mx-3 font-bold text-center text-blue-700 bg-blue-200 border border-r-0 border-blue-500 shadow">
              {valueToLabel(contactTypes, contact.contactType)}
            </Value>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <Label>Name</Label>
            <Value>
              {contact.firstName} {contact.LastName}
            </Value>
            <Value>{contact.organization}</Value>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <Label>Contact</Label>
            <Value>{contact.email}</Value>
            <Value>{contact.phoneNumber}</Value>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <Label>Address</Label>
            <Address {...contact} />
          </ResponsiveGridColumn>
        </Panel>
      ))}
    </Section>
  );
};

const handleLink = (text) => {
  if (text?.startsWith('file::')) {
    return (
      <a
        meta="primary"
        href={text.replace('file::', '/api/file/').replaceAll('_', '/')}
        target="_blank"
        rel="noopener noreferrer"
      >
        attachment
      </a>
    );
  }

  return text;
};

const WellDetails = ({ siteId, inventoryId }) => {
  const { data } = useQuery(
    ['inventory', inventoryId],
    () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    {
      enabled: siteId > 0,
      onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
    }
  );

  return (
    <>
      <Section gray={true} title="Construction Details">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-700 border border-gray-800 rounded-full bg-white/90 inset-1"
            >
              {well.count}
            </div>
            <Value className="px-2 py-1 mb-3 -mx-3 font-bold text-center text-blue-700 bg-blue-200 border border-r-0 border-blue-500 shadow">
              {well.status}
            </Value>
            <Label>Construction</Label>
            <Value>{handleLink(well.constructionDetails)}</Value>
          </Panel>
        ))}
      </Section>
      <Section gray={true} title="Injectate Characterization">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inline-flex items-center justify-center w-8 h-8 text-xs font-bold text-gray-700 border border-gray-800 rounded-full bg-white/90 inset-1"
            >
              {well.count}
            </div>
            <Value className="px-2 py-1 mb-3 -mx-3 font-bold text-center text-blue-700 bg-blue-200 border border-r-0 border-blue-500 shadow">
              {well.status}
            </Value>
            <Label>Injectate Characterization</Label>
            <Value>{handleLink(well.injectateCharacterization)}</Value>
          </Panel>
        ))}
      </Section>
    </>
  );
};

const Panel = ({ children }) => (
  <div className="relative col-span-6 px-3 py-2 overflow-auto bg-white border rounded shadow max-h-72 md:col-span-2">
    {children}
  </div>
);

function Address({ mailingAddress, city, state, zipCode }) {
  return (
    <>
      <div>{mailingAddress}</div>
      <div>{city && `${city}, ${state} ${zipCode}`} </div>
    </>
  );
}

const LocationDetails = ({ siteId, inventoryId }) => {
  const mapDiv = useRef();
  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');

  return (
    <Section title="Location Details">
      <div className="col-span-6 min-h-profile" ref={mapDiv}></div>
    </Section>
  );
};
