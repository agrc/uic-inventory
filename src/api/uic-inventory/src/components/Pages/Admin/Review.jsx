import { Description, DialogTitle } from '@headlessui/react';
import { ExclamationCircleIcon, InformationCircleIcon } from '@heroicons/react/20/solid';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import clsx from 'clsx';
import ky from 'ky';
import throttle from 'lodash.throttle';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Code } from 'react-content-loader';
import { useImmerReducer } from 'use-immer';

import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import { AuthContext } from '../../../AuthProvider';
import { contactTypes, ownershipTypes, valueToLabel, wellTypes } from '../../../data/lookups';
import { FormGrid, ResponsiveGridColumn, SelectListbox } from '../../FormElements';
import {
  useEditableInput,
  useEditableSelect,
  useInventoryWells,
  useOpenClosed,
  useSitePolygon,
  useWebMap,
} from '../../Hooks';
import { Chrome, ConfirmationModal, Flagged, onRequestError, toast, useNavigate, useParams } from '../../PageElements';

import '@arcgis/core/assets/esri/themes/light/main.css';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric',
  hour12: true,
  hour: 'numeric',
  minute: 'numeric',
});

export function Component() {
  const { authInfo } = useContext(AuthContext);
  const navigate = useNavigate();
  const { inventoryId, siteId } = useParams();
  const queryClient = useQueryClient();
  const [isOpen, { open, close }] = useOpenClosed();
  const [approveIsOpen, { open: openApprove, close: closeApprove }] = useOpenClosed();
  const [reviewIsOpen, { open: openReview, close: closeReview }] = useOpenClosed();
  const [authorizeIsOpen, { open: openAuthorize, close: closeAuthorize }] = useOpenClosed();
  const [completeIsOpen, { open: openComplete, close: closeComplete }] = useOpenClosed();

  const queryKey = ['site', siteId, 'inventory', inventoryId];
  const { data } = useQuery({
    queryKey,
    queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
  });

  const { mutate: reviewMutation } = useMutation({
    mutationFn: (json) => ky.post('/api/inventory/review', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory updated successfully!');
      closeReview();
    },
    onError: (error) => onRequestError(error, 'We had some trouble approving this inventory.'),
  });

  const { mutate: approveMutation } = useMutation({
    mutationFn: (json) => ky.post('/api/inventory/approve', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory approved successfully!');
      closeApprove();
    },
    onError: (error) => {
      onRequestError(error, 'We had some trouble approving this inventory.');
      closeApprove();
    },
  });

  const { mutate: authorizeMutation } = useMutation({
    mutationFn: (json) => ky.post('/api/inventory/authorize', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory authorized successfully!');
      closeAuthorize();
    },
    onError: (error) => {
      onRequestError(error, 'We had some trouble authorizing this inventory.');
      closeAuthorize();
    },
  });

  const { mutate: completeMutation } = useMutation({
    mutationFn: (json) => ky.post('/api/inventory/complete', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory Completed successfully!');
      closeComplete();
    },
    onError: (error) => {
      onRequestError(error, 'We had some trouble authorizing this inventory.');
      closeComplete();
    },
  });

  const { mutate: rejectMutation } = useMutation({
    mutationFn: (json) => ky.delete('/api/inventory/reject', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory rejected successfully!');
      navigate('/', { replace: true });
    },
    onError: (error) => onRequestError(error, 'We had some trouble rejecting this inventory.'),
  });

  const { mutate: generate, status } = useMutation({
    mutationFn: (json) => ky.post(`/api/inventory/download`, { json, timeout: 90000 }),
    onSuccess: async (data) => {
      const blob = await data.blob();

      const url = URL.createObjectURL(blob);
      window.open(url);
      URL.revokeObjectURL(url);
    },
  });

  const download = () => {
    const input = {
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    generate(input);
  };

  const reject = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    rejectMutation(input);
  };

  const approve = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    approveMutation(input);
  };

  const authorize = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    authorizeMutation(input);
  };

  const complete = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    completeMutation(input);
  };

  const review = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    reviewMutation(input);
  };

  return (
    <>
      <>
        <ConfirmationModal isOpen={isOpen} onClose={close} onYes={reject}>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
            Reject Submission Confirmation
          </DialogTitle>
          <Description className="mt-1">This inventory will be permanently deleted</Description>
          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to reject this submission? This action cannot be undone...
          </p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={reviewIsOpen} onClose={closeReview} onYes={review}>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
            Review Submission Confirmation
          </DialogTitle>
          <Description>You will be responsible for reviewing and approving this inventory.</Description>
          <p className="mt-1 text-sm text-gray-500">
            Are you sure you want to assign yourself as the reviewer of this inventory?
          </p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={approveIsOpen} onClose={closeApprove} onYes={approve}>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
            Approve Submission Confirmation
          </DialogTitle>
          <Description>Has the inventory been reviewed and is it ready to be approved?</Description>
          <p className="mt-1 text-sm text-gray-500">Are you sure you want to approve this submission?</p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={authorizeIsOpen} onClose={closeAuthorize} onYes={authorize}>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
            Authorize Submission Confirmation
          </DialogTitle>
          <Description>Has the inventory information been entered into the UIC geodatabase?</Description>
          <p className="mt-1 text-sm text-gray-500">Are you sure you want to authorize this submission?</p>
        </ConfirmationModal>
        <ConfirmationModal isOpen={completeIsOpen} onClose={closeComplete} onYes={complete}>
          <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
            Complete Submission Confirmation
          </DialogTitle>
          <Description>
            Has the the Authorization by Rule (ABR) letter been sent and is the inventory processing complete?
          </Description>
          <p className="mt-1 text-sm text-gray-500">Are you sure you want to complete this submission?</p>
        </ConfirmationModal>
      </>
      <Chrome title="Inventory Review">
        <SiteAndInventoryDetails
          siteId={siteId}
          inventoryId={inventoryId}
          confirmations={{ openApprove, openReview, openAuthorize, openComplete }}
        />
        <LocationDetails siteId={siteId} inventoryId={inventoryId} />
        <ContactDetails siteId={siteId} />
        <WellDetails siteId={siteId} inventoryId={inventoryId} />
        <Section>
          <button
            onClick={open}
            disabled={data?.status == 'authorized'}
            data-style="primary"
            className="hover:bg-red-600 sm:col-span-6 md:col-span-2"
          >
            Reject
          </button>
          <button
            onClick={download}
            data-style="secondary"
            className="rounded border sm:col-span-6 md:col-span-2"
            disabled={status === 'pending'}
          >
            {status === 'pending' && (
              <svg
                className="-ml-1 mr-2 h-5 w-5 animate-spin motion-reduce:hidden"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            )}
            {status === 'error' && <ExclamationCircleIcon className="-ml-1 mr-2 h-5 w-5 text-red-500" />}
            Download
          </button>
          <button
            disabled={data?.status != 'underReview'}
            onClick={openApprove}
            type="button"
            data-style="primary"
            className="sm:col-span-6 md:col-span-2"
          >
            Approve
          </button>
        </Section>
      </Chrome>
    </>
  );
}

const Label = ({ children }) => <span className="block font-bold text-gray-700">{children}</span>;

const Value = ({ children, className }) => <span className={clsx('ml-2 block', className)}>{children}</span>;

const Section = ({ gray, children, title, height = 'max-h-96', className }) => (
  <div className={className}>
    <h1 className="mb-2 text-xl font-medium">{title}</h1>
    <div className={clsx('mb-3 ml-1 overflow-scroll border shadow sm:rounded-md', height)}>
      <div
        className={clsx(
          {
            'bg-gray-50': gray,
            'bg-white': !gray,
          },
          'h-full px-4 py-5 sm:p-6',
        )}
      >
        <FormGrid>{children}</FormGrid>
      </div>
    </div>
  </div>
);

const SiteAndInventoryDetails = ({ siteId, inventoryId, confirmations }) => {
  const { authInfo } = useContext(AuthContext);
  const queryKey = ['site', siteId, 'inventory', inventoryId];
  const { status, data } = useQuery({
    queryKey,
    queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
  });

  const queryClient = useQueryClient();

  const { mutate } = useMutation({
    mutationFn: (json) => ky.put('/api/inventory', { json }),
    onMutate: async (inventory) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        const updated = {
          ...old,
          site: { ...old.site },
          wells: [...old.wells],
        };

        if (inventory.subClass) {
          updated.subClass = inventory.subClass;
        }

        if (inventory.edocs) {
          updated.edocs = inventory.edocs;
        }

        if (inventory.orderNumber) {
          updated.orderNumber = inventory.orderNumber;
        }

        if (inventory.siteIdentifier) {
          updated.siteIdentifier = inventory.siteIdentifier;
        }

        return updated;
      });

      return { previousValue };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory updated successfully!');
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating this inventory.'),
  });

  const modify = ({ subClass, orderNumber, edocs, siteIdentifier }) => {
    const input = {
      accountId: parseInt(authInfo.id),
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      subClass,
      orderNumber,
      edocs,
      siteIdentifier,
    };

    mutate(input);
  };

  const siteIdentifierEditable = useEditableInput(data?.site?.siteId, (siteIdentifier) => modify({ siteIdentifier }));
  const edocsEditable = useEditableInput(data?.edocs, (edocs) => modify({ edocs }));
  const orderNumberEditable = useEditableInput(data?.orderNumber, (orderNumber) => modify({ orderNumber }));
  const subClassEditable = useEditableSelect(data?.subClass, wellTypes, (value) => modify({ subClass: value?.value }));

  if (status === 'pending') {
    return <Code />;
  }

  return (
    <>
      <div className="sticky top-4 z-10 flex items-start justify-between">
        <Status data={data} confirmations={confirmations} />
        <Flagged reason={data?.flagged} siteId={siteId} inventoryId={inventoryId} />
      </div>
      <Section title="Site Details">
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>Name</Label>
          <Value>{data?.site.name}</Value>
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>
            Id
            <button {...siteIdentifierEditable.getModifyButtonProps()} />
            {siteIdentifierEditable.isEditing && <button {...siteIdentifierEditable.getCancelButtonProps()} />}
          </Label>
          {siteIdentifierEditable.isEditing ? (
            <input value={data?.site.siteId ?? '-'} {...siteIdentifierEditable.getInputProps()} />
          ) : (
            <Value>{data?.site.siteId ?? '-'}</Value>
          )}
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>Location</Label>
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
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>
            Edocs #
            <button {...edocsEditable.getModifyButtonProps()} />
            {edocsEditable.isEditing && <button {...edocsEditable.getCancelButtonProps()} />}
          </Label>
          {edocsEditable.isEditing ? (
            <input value={data?.edocs} {...edocsEditable.getInputProps()} />
          ) : (
            <Value>{data?.edocs ?? '-'}</Value>
          )}
        </ResponsiveGridColumn>
      </Section>
      <Section title="Inventory Details">
        <ResponsiveGridColumn full={true} half={true}>
          <Label>
            Inventory Class
            <button {...subClassEditable.getModifyButtonProps()} />
            {subClassEditable.isEditing && <button {...subClassEditable.getCancelButtonProps()} />}
          </Label>
          {subClassEditable.isEditing ? (
            <div className="mt-1">
              <SelectListbox {...subClassEditable.getSelectProps()} />
            </div>
          ) : (
            <Value>{subClassEditable.label}</Value>
          )}
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true} third={true}>
          <Label>
            Order Number
            <button {...orderNumberEditable.getModifyButtonProps()} />
            {orderNumberEditable.isEditing && <button {...orderNumberEditable.getCancelButtonProps()} />}
          </Label>
          {orderNumberEditable.isEditing ? (
            <input value={data?.orderNumber} {...orderNumberEditable.getInputProps()} />
          ) : (
            <Value>{data?.orderNumber ?? '-'}</Value>
          )}
        </ResponsiveGridColumn>
        <ResponsiveGridColumn full={true} half={true}>
          <Label>Signed By</Label>
          <Value>{handleLink(data?.signature, siteId, inventoryId)}</Value>
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
  const { status, data } = useQuery({
    queryKey: ['contacts', siteId],
    queryFn: () => ky.get(`/api/site/${siteId}/contacts`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding the contacts.'),
  });

  if (status === 'pending') {
    return <Code />;
  }

  return (
    <Section gray={true} title="Site Contacts">
      {data?.contacts.map((contact) => (
        <Panel key={contact.id}>
          <ResponsiveGridColumn full={true} half={true}>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow">
              {valueToLabel(contactTypes, contact.contactType)}
            </Value>
          </ResponsiveGridColumn>
          <ResponsiveGridColumn full={true} half={true}>
            <Label>Name</Label>
            <Value>
              {contact.firstName} {contact.lastName}
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

const handleLink = (text, siteId, inventoryId, type = '') => {
  if (text?.startsWith('file::')) {
    return (
      <a
        data-style="link"
        href={text.replace('file::', `/api/site/${siteId}/inventory/${inventoryId}/${type}`).replaceAll('_', '/')}
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
  const queryKey = ['site', siteId, 'inventory', inventoryId];

  const { status, data } = useQuery({
    queryKey,
    queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
  });

  if (status === 'pending') {
    return <Code />;
  }

  return (
    <>
      <Section gray={true} title="Construction Details">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow">
              {well.status}
            </Value>
            <Label>Well Name</Label>
            <Value>{well.wellName}</Value>
            <Label>Construction</Label>
            <Value>{handleLink(well.constructionDetails, siteId, inventoryId, 'well/')}</Value>
            {well.subClass === 5002 && (
              <>
                <Label>Remediation</Label>
                <Value>
                  {well.remediationType} Project {well.remediationProjectId}
                </Value>
              </>
            )}
          </Panel>
        ))}
      </Section>
      <Section gray={true} title="Injectate Characterization">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow">
              {well.status}
            </Value>
            <Label>Well Name</Label>
            <Value>{well.wellName}</Value>
            <Label>Injectate Characterization</Label>
            <Value>{handleLink(well.injectateCharacterization, siteId, inventoryId, 'well/')}</Value>
          </Panel>
        ))}
      </Section>
      <Section gray={true} title="Hydrogeologic Characterization">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow">
              {well.status}
            </Value>
            <Label>Well Name</Label>
            <Value>{well.wellName}</Value>
            <Label>Hydrogeologic Characterization</Label>
            <Value>{well.hydrogeologicCharacterization}</Value>
          </Panel>
        ))}
      </Section>
    </>
  );
};

const Panel = ({ children }) => (
  <div className="relative col-span-6 max-h-72 overflow-auto rounded border bg-white px-3 py-2 shadow md:col-span-2">
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

const reducer = (draft, action) => {
  switch (action.type) {
    case 'set-hover-graphic': {
      if (action?.meta === 'toggle') {
        action.payload == draft.highlighted ? null : action.payload;
      }

      draft.highlighted = action.payload;

      break;
    }
  }
};

const LocationDetails = ({ siteId, inventoryId }) => {
  const hoverEvent = useRef();
  const mapDiv = useRef();
  const groundWaterProtectionZones = useRef(
    new FeatureLayer({
      url: 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Groundwater_Source_Protection_Zones/FeatureServer/4',
      opacity: 0.25,
    }),
  );
  const [state, dispatch] = useImmerReducer(reducer, {
    highlighted: undefined,
  });

  const queryKey = ['site', siteId, 'inventory', inventoryId];
  const { status, data } = useQuery({
    queryKey: queryKey,
    queryFn: () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding this inventory.'),
  });

  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  useSitePolygon(mapView, data?.site);
  const wells = useInventoryWells(mapView, data?.wells, { includeComplete: false });

  // add ground water protection zones
  useEffect(() => {
    mapView.current?.when(() => {
      if (!mapView.current.map.layers.includes(groundWaterProtectionZones.current)) {
        mapView.current.map.add(groundWaterProtectionZones.current);
      }
    });
  }, [mapView]);

  // hover well points
  useEffect(() => {
    mapView.current?.when(() => {
      if (hoverEvent.current) {
        return;
      }

      hoverEvent.current = mapView.current.on(
        'pointer-move',
        throttle((event) => {
          const options = {
            include: wells,
          };
          mapView.current.hitTest(event, options).then(({ results }) => {
            let id = 'empty';
            if (results.length > 0) {
              id = results[0].graphic.attributes.id;
            }

            dispatch({ type: 'set-hover-graphic', payload: id });
          });
        }, 100),
      );
    });

    return () => {
      hoverEvent.current?.remove();
    };
  }, [dispatch, mapView, wells]);

  // manage point highlighting
  useEffect(() => {
    mapView.current.graphics.items.forEach((graphic) => {
      if (graphic.getAttribute('id') === state.highlighted) {
        graphic.setAttribute('selected', true);
      } else {
        graphic.setAttribute('selected', false);
      }
    });
  }, [mapView, state.highlighted]);

  return (
    <Section title="Location Details">
      <div className="md:auto-rows-none col-span-6 grid grid-rows-[.5fr,1.5fr] items-start gap-5 lg:auto-cols-min lg:grid-cols-2 lg:grid-rows-none">
        <div className="w-full">
          {status === 'pending' ? <Code /> : <WellTable wells={data?.wells} state={state} dispatch={dispatch} />}
          <WaterSystemContacts wells={data?.wells} />
        </div>
        <div className="aspect-[17/22] w-full rounded border shadow" ref={mapDiv}></div>
      </div>
    </Section>
  );
};

const Pill = ({ children, status }) => {
  const classes = clsx('mx-1 rounded-lg border border-gray-400 px-2 py-1 text-xs font-medium shadow-md', {
    'bg-red-200': status === false,
    'bg-green-200': status === true,
    'bg-gray-100': status === undefined,
  });

  return <span className={classes}>{children}</span>;
};

const WellTable = ({ wells = [], state, dispatch }) => {
  const [highlighting, setHighlighting] = useState(false);
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
      },
      {
        header: 'Construction',
        accessorKey: 'wellName',
        cell: function id({ row }) {
          return (
            <div className="relative">
              <span
                title="Well count"
                className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border border-gray-800 text-xs font-bold text-gray-700"
              >
                {row.original.count}
              </span>
              {row.original.wellName}
            </div>
          );
        },
      },
      {
        header: 'Operating Status',
        accessorKey: 'status',
      },
      {
        header: 'Ground Water',
        accessorKey: 'surfaceWaterProtection',
        cell: function id({ row }) {
          switch (row.original.surfaceWaterProtection) {
            case 'Y+': {
              return (
                <>
                  <Pill status={true}>GWZ</Pill>
                  <Pill status={true}>ARDA</Pill>
                  <span>(Y)</span>
                </>
              );
            }
            case 'Y-': {
              return (
                <>
                  <Pill status={true}>GWZ</Pill>
                  <Pill status={false}>ARDA</Pill>
                  <span>(Y)</span>
                </>
              );
            }
            case 'S': {
              return (
                <>
                  <Pill status={false}>GWZ</Pill>
                  <Pill status={true}>ARDA</Pill>
                  <span>(S)</span>
                </>
              );
            }
            case 'N': {
              return (
                <>
                  <Pill status={false}>GWZ</Pill>
                  <Pill status={false}>ARDA</Pill>
                  <span>(N)</span>
                </>
              );
            }
            default: {
              return 'Unknown';
            }
          }
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: wells,
    getCoreRowModel: getCoreRowModel(),
    initialState: { columnVisibility: { id: false } },
  });

  return (
    <table className="w-full divide-y divide-gray-200 overflow-auto border">
      <thead className="bg-gray-50">
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {table.getRowModel().rows.map((row) => (
          <tr
            key={row.id}
            className={clsx(
              {
                'bg-blue-100': row.original.id === state.highlighted,
              },
              'hover:bg-blue-100',
            )}
            onPointerEnter={() => {
              setHighlighting(true);
              dispatch({ type: 'set-hover-graphic', payload: row.original.id });
            }}
            onPointerLeave={() => {
              setHighlighting(false);
              dispatch({ type: 'set-hover-graphic', payload: null });
            }}
            onClick={() => {
              if (highlighting) {
                return;
              }
              dispatch({ type: 'set-hover-graphic', payload: row.original.id, meta: 'toggle' });
            }}
          >
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                className={clsx(
                  {
                    'font-medium': ['action', 'id'].includes(cell.column.id),
                    'whitespace-nowrap text-right': cell.column.id === 'action',
                  },
                  'px-3 py-2',
                )}
              >
                <div className="text-sm text-gray-900">{flexRender(cell.column.columnDef.cell, cell.getContext())}</div>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const WaterSystemContacts = ({ wells = [] }) => {
  if (wells.length === 0) {
    return null;
  }

  let contacts = wells.reduce((a, b) => {
    return a.concat(b.waterSystemContacts);
  }, []);

  if (contacts.length === 0) {
    return null;
  }

  contacts = contacts.filter(
    (contact, index, self) =>
      index === self.findIndex((duplicate) => duplicate.system === contact.system && duplicate.email === contact.email),
  );

  return (
    <section>
      <h2 className="my-3 text-lg font-medium">Water System Information</h2>
      <div className="flex flex-wrap justify-between gap-2 text-sm">
        {contacts.map((contact) => (
          <WaterSystemContact key={contact.system + contact.email} contact={contact} />
        ))}
      </div>
    </section>
  );
};

const titleCase = (value) =>
  value
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

const WaterSystemContact = ({ contact }) => {
  return (
    <div className="grid grid-cols-[1fr,3fr] rounded-lg border px-3 py-1 leading-snug">
      <span className="text-right font-bold">Contact:</span> <span className="pl-1">{titleCase(contact.name)}</span>
      <span className="text-right font-bold">Email:</span> <span className="pl-1">{contact.email.toLowerCase()}</span>
      <span className="text-right font-bold">Name:</span> <span className="pl-1">{titleCase(contact.system)}</span>
    </div>
  );
};

const whatIsNeeded = (status) => {
  switch (status) {
    case 'submitted':
      return 'Submitted, needs review';
    case 'underReview':
      return 'Under review, awaiting approval';
    case 'approved':
      return 'Approved, needs authorization';
    case 'authorized':
      return 'Authorized, needs completion';
    case 'rejected':
      return 'Rejected';
    case 'completed':
      return 'Completed';
    default:
      return '';
  }
};

const Status = ({ data, confirmations }) => {
  const [isOpen, { toggle }] = useOpenClosed();

  return (
    <div className="mb-4 flex justify-start">
      {isOpen ? (
        <div className="flex gap-4 rounded border bg-white px-3 py-2 shadow">
          {['submitted', 'underReview'].includes(data?.status) && (
            <>
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <Label>Reviewer</Label>
                  <Value>
                    {data?.underReviewBy?.firstName ? (
                      <>
                        <div>{`${data?.underReviewBy?.firstName ?? 'Unknown'} ${data?.underReviewBy?.lastName ?? 'User'}`}</div>
                        <div>{data?.underReviewBy?.organization ?? 'Unknown'}</div>
                        <div>{data?.underReviewBy?.phoneNumber ?? 'Unknown'}</div>
                        <div>{data?.underReviewBy?.email ?? 'Unknown'}</div>
                      </>
                    ) : (
                      '-'
                    )}
                  </Value>
                </div>
                {['submitted', 'underReview'].includes(data?.status) && (
                  <button onClick={confirmations.openReview} data-style="primary">
                    Assign me
                  </button>
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <Label>Review started</Label>
                  <Value>{data?.underReviewOn ? dateFormatter.format(Date.parse(data.underReviewOn)) : '-'}</Value>
                </div>
                <button onClick={toggle} data-style="alternate">
                  close
                </button>
              </div>
            </>
          )}
          {data?.status === 'approved' && (
            <>
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <Label>Approver</Label>
                  <Value>
                    <div>{`${data?.approvedBy?.firstName ?? 'Unknown'} ${data?.approvedBy?.lastName ?? 'User'}`}</div>
                    <div>{data?.approvedBy?.organization ?? 'Unknown'}</div>
                    <div>{data?.approvedBy?.phoneNumber ?? 'Unknown'}</div>
                    <div>{data?.approvedBy?.email ?? 'Unknown'}</div>
                  </Value>
                </div>
                {data?.status === 'approved' && (
                  <button onClick={confirmations.openAuthorize} data-style="primary">
                    Authorize inventory
                  </button>
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <Label>Approval date</Label>
                  <Value>{dateFormatter.format(Date.parse(data.approvedOn))}</Value>
                </div>
                <button onClick={toggle} data-style="alternate">
                  close
                </button>
              </div>
            </>
          )}
          {data?.status === 'authorized' && (
            <>
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <Label>Authorizer</Label>
                  <Value>
                    <div>{`${data?.authorizedBy?.firstName ?? 'Unknown'} ${data?.authorizedBy?.lastName ?? 'User'}`}</div>
                    <div>{data?.authorizedBy?.organization ?? 'Unknown'}</div>
                    <div>{data?.authorizedBy?.phoneNumber ?? 'Unknown'}</div>
                    <div>{data?.authorizedBy?.email ?? 'Unknown'}</div>
                  </Value>
                </div>
                {data?.status === 'authorized' && (
                  <button onClick={confirmations.openComplete} data-style="primary">
                    Complete inventory
                  </button>
                )}
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <Label>Authorization date</Label>
                  <Value>{dateFormatter.format(Date.parse(data.authorizedOn))}</Value>
                </div>
                <button onClick={toggle} data-style="alternate">
                  close
                </button>
              </div>
            </>
          )}
          {data?.status === 'completed' && (
            <>
              <div className="flex flex-col justify-between">
                <div className="mb-4">
                  <Label>Completed by</Label>
                  <Value>
                    <div>{`${data?.completedBy?.firstName ?? 'Unknown'} ${data?.completedBy?.lastName ?? 'User'}`}</div>
                    <div>{data?.completedBy?.organization ?? 'Unknown'}</div>
                    <div>{data?.completedBy?.phoneNumber ?? 'Unknown'}</div>
                    <div>{data?.completedBy?.email ?? 'Unknown'}</div>
                  </Value>
                </div>
              </div>
              <div className="flex flex-col justify-between">
                <div>
                  <Label>Completion date</Label>
                  <Value>{dateFormatter.format(Date.parse(data.completedOn))}</Value>
                </div>
                <button onClick={toggle} data-style="alternate">
                  close
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <button
          onClick={toggle}
          className={clsx(
            'inline-flex select-none items-center justify-center self-center rounded rounded-l-md border border-transparent px-4 py-2 font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-offset-2',
            data?.status === 'submitted' && 'bg-blue-500 text-blue-100 hover:bg-blue-700',
            data?.status === 'underReview' && 'bg-amber-500 text-amber-100 hover:bg-amber-700',
            data?.status === 'approved' && 'bg-fuchsia-500 text-fuchsia-100 hover:bg-fuchsia-700',
            data?.status === 'authorized' && 'bg-emerald-500 text-emerald-100 hover:bg-emerald-700',
            data?.status === 'rejected' && 'bg-rose-500 text-rose-100 hover:bg-rose-700',
            data?.status === 'completed' && 'bg-sky-500 text-sky-100 hover:bg-sky-700',
          )}
        >
          <InformationCircleIcon className="-ml-1 mr-2 h-5 w-5 text-current" />
          {whatIsNeeded(data?.status)}
        </button>
      )}
    </div>
  );
};
