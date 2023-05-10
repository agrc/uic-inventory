import { Dialog } from '@headlessui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import { useImmerReducer } from 'use-immer';
import ky from 'ky';
import throttle from 'lodash.throttle';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Code } from 'react-content-loader';
import { useTable } from 'react-table';

import { when } from '@arcgis/core/core/reactiveUtils';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer';

import { AuthContext } from '../../../AuthProvider';
import { contactTypes, ownershipTypes, valueToLabel, wellTypes } from '../../../data/lookups';
import { FormGrid, ResponsiveGridColumn, SelectListbox, useEditableInput, useEditableSelect } from '../../FormElements';
import { useInventoryWells, useOpenClosed, useSitePolygon, useWebMap } from '../../Hooks';
import {
  Chrome,
  ConfirmationModal,
  Flagged,
  Link,
  onRequestError,
  toast,
  useNavigate,
  useParams,
} from '../../PageElements';

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

  const { mutate } = useMutation({
    mutationFn: (json) => ky.delete('/api/inventory/reject', { json }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: 'sites' });
      queryClient.invalidateQueries({ queryKey: ['site-inventories', inventoryId] });
    },
    onSuccess: () => {
      toast.success('Inventory rejected successfully!');
      navigate('/', { replace: true });
    },
    onError: (error) => onRequestError(error, 'We had some trouble rejecting this inventory.'),
  });

  const reject = () => {
    const input = {
      accountId: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      inventoryId: parseInt(inventoryId),
    };

    mutate(input);
  };

  return (
    <>
      <ConfirmationModal isOpen={isOpen} onClose={close} onYes={reject}>
        <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
          Reject Submission Confirmation
        </Dialog.Title>
        <Dialog.Description className="mt-1">This inventory will be permanently deleted</Dialog.Description>
        <p className="mt-1 text-sm text-gray-500">
          Are you sure you want to reject this submission? This action cannot be undone...
        </p>
      </ConfirmationModal>
      <Chrome title="Inventory Review">
        <SiteAndInventoryDetails siteId={siteId} inventoryId={inventoryId} />
        <LocationDetails siteId={siteId} inventoryId={inventoryId} />
        <ContactDetails siteId={siteId} />
        <WellDetails siteId={siteId} inventoryId={inventoryId} />
        <Section className="print:hidden">
          <button onClick={open} data-style="primary" className="hover:bg-red-600 sm:col-span-6 md:col-span-2">
            Reject
          </button>
          <button data-style="secondary" onClick={window.print} className="rounded border sm:col-span-6 md:col-span-2">
            Print
          </button>
          <Link
            to={`/review/site/${siteId}/inventory/${inventoryId}/authorization`}
            type="button"
            data-style="primary"
            className="sm:col-span-6 md:col-span-2"
          >
            Approve
          </Link>
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
    <div
      className={clsx(
        'mb-3 ml-1 overflow-scroll border shadow sm:rounded-md print:max-h-full print:shadow-none',
        height
      )}
    >
      <div
        className={clsx(
          {
            'bg-gray-50 print:bg-white': gray,
            'bg-white': !gray,
          },
          'h-full px-4 py-5 sm:p-6'
        )}
      >
        <FormGrid>{children}</FormGrid>
      </div>
    </div>
  </div>
);

const SiteAndInventoryDetails = ({ siteId, inventoryId }) => {
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
      const previousValue = queryClient.getQueryData({ queryKey });

      queryClient.setQueryData({ queryKey }, (old) => {
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

        return updated;
      });

      return previousValue;
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onSuccess: () => {
      toast.success('Inventory updated successfully!');
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating this inventory.'),
  });

  const modify = ({ subClass, orderNumber, edocs }) => {
    const input = {
      accountId: parseInt(authInfo.id),
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      subClass,
      orderNumber,
      edocs,
    };

    mutate(input);
  };

  const edocsEditable = useEditableInput(data?.edocs, (edocs) => modify({ edocs }));
  const orderNumberEditable = useEditableInput(data?.orderNumber, (orderNumber) => modify({ orderNumber }));
  const subClassEditable = useEditableSelect(data?.subClass, wellTypes, (value) => modify({ subClass: value?.value }));

  if (status === 'loading') {
    return <Code />;
  }

  return (
    <>
      <Flagged reason={data?.flagged} siteId={siteId} inventoryId={inventoryId} />
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
            <input {...orderNumberEditable.getInputProps()} />
          ) : (
            <Value>{data?.orderNumber ?? '-'}</Value>
          )}
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
  const { status, data } = useQuery({
    queryKey: ['contacts', siteId],
    queryFn: () => ky.get(`/api/site/${siteId}/contacts`).json(),
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding the contacts.'),
  });

  if (status === 'loading') {
    return <Code />;
  }

  return (
    <Section gray={true} title="Site Contacts">
      {data?.contacts.map((contact) => (
        <Panel key={contact.id}>
          <ResponsiveGridColumn full={true} half={true}>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow print:mx-0 print:mb-1 print:border-0 print:bg-white print:px-0 print:text-left print:text-gray-800 print:shadow-none">
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

const handleLink = (text, siteId, inventoryId) => {
  if (text?.startsWith('file::')) {
    return (
      <a
        data-style="link"
        href={text.replace('file::', `/api/site/${siteId}/inventory/${inventoryId}/well/`).replaceAll('_', '/')}
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

  if (status === 'loading') {
    return <Code />;
  }

  return (
    <>
      <Section gray={true} title="Construction Details">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700 print:block print:border-0 print:bg-transparent"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow print:mx-0 print:mb-1 print:border-0 print:bg-white print:px-0 print:text-left print:text-gray-800 print:shadow-none">
              {well.status}
            </Value>
            <Label>Well Name</Label>
            <Value>{well.wellName}</Value>
            <Label>Construction</Label>
            <Value>{handleLink(well.constructionDetails, siteId, inventoryId)}</Value>
          </Panel>
        ))}
      </Section>
      <Section gray={true} title="Injectate Characterization">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700 print:block print:border-0 print:bg-transparent"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow print:mx-0 print:mb-1 print:border-0 print:bg-white print:px-0 print:text-left print:text-gray-800 print:shadow-none">
              {well.status}
            </Value>
            <Label>Well Name</Label>
            <Value>{well.wellName}</Value>
            <Label>Injectate Characterization</Label>
            <Value>{handleLink(well.injectateCharacterization, siteId, inventoryId)}</Value>
          </Panel>
        ))}
      </Section>
      <Section gray={true} title="Hydrogeologic Characterization">
        {data?.wells.map((well) => (
          <Panel key={well.id}>
            <div
              title="Well count"
              className="absolute inset-1 inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-800 bg-white/90 text-xs font-bold text-gray-700 print:block print:border-0 print:bg-transparent"
            >
              {well.count}
            </div>
            <Value className="-mx-3 mb-3 border border-r-0 border-blue-500 bg-blue-200 px-2 py-1 text-center font-bold text-blue-700 shadow print:mx-0 print:mb-1 print:border-0 print:bg-white print:px-0 print:text-left print:text-gray-800 print:shadow-none">
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
  <div className="relative col-span-6 max-h-72 overflow-auto rounded border bg-white px-3 py-2 shadow md:col-span-2 print:col-span-6 print:max-h-full print:shadow-none">
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
    case 'set-screenshot': {
      draft.screenshot = action.payload;

      break;
    }
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
      url: 'https://services2.arcgis.com/NnxP4LZ3zX8wWmP9/ArcGIS/rest/services/Utah_DDW_Groundwater_Source_Protection_Zones/FeatureServer/0',
      opacity: 0.25,
    })
  );
  const [state, dispatch] = useImmerReducer(reducer, {
    highlighted: undefined,
    screenshot: '',
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
        }, 100)
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

  // sync image for printing
  useEffect(() => {
    mapView.current?.when(() => {
      when(
        () => mapView.current.stationary === true,
        async () => {
          const screenshot = await mapView.current.takeScreenshot({ width: 850, height: 1100 });

          dispatch({ type: 'set-screenshot', payload: screenshot.dataUrl });
        }
      );
    });
  }, [dispatch, mapView]);

  return (
    <>
      <Section title="Location Details" height="print:h-auto" className="print:break-before-page">
        <div className="md:auto-rows-none col-span-6 grid grid-rows-[.5fr,1.5fr] items-start gap-5 lg:auto-cols-min lg:grid-cols-2 lg:grid-rows-none">
          <div className="w-full">
            {status === 'loading' ? <Code /> : <WellTable wells={data?.wells} state={state} dispatch={dispatch} />}
            <WaterSystemContacts wells={data?.wells} />
          </div>
          <div className="aspect-[17/22] w-full rounded border shadow print:hidden" ref={mapDiv}></div>
        </div>
      </Section>
      <img
        className="hidden aspect-[17/22] rounded border shadow print:block print:break-after-page"
        alt=""
        src={state.screenshot}
      />
    </>
  );
};

const Pill = ({ children, status }) => {
  const classes = clsx('text-xs font-medium mx-1 rounded-lg border border-gray-400 shadow-md px-2 py-1', {
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
        accessor: 'id',
      },
      {
        Header: 'Construction',
        accessor: 'wellName',
        Cell: function id({ row }) {
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
        Header: 'Operating Status',
        accessor: 'status',
      },
      {
        Header: 'Ground Water',
        accessor: 'surfaceWaterProtection',
        Cell: function id({ row }) {
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
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: wells,
    initialState: {
      hiddenColumns: ['id'],
    },
  });

  return (
    <table {...getTableProps()} className="w-full divide-y divide-gray-200 overflow-auto border">
      <thead className="bg-gray-50">
        {headerGroups.map((headerGroup) => (
          <tr key={headerGroup.index} {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                key={`${headerGroup.index}-${column.id}`}
                {...column.getHeaderProps()}
                className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
              >
                {column.render('Header')}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody {...getTableBodyProps()} className="divide-y divide-gray-200 bg-white">
        {rows.map((row) => {
          prepareRow(row);

          return (
            <tr
              className={clsx(
                {
                  'bg-blue-100': row.original.id === state.highlighted,
                },
                'hover:bg-blue-100'
              )}
              key={`${row.index}`}
              {...row.getRowProps()}
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
              {row.cells.map((cell) => (
                <td
                  key={`${row.index}-${cell.column.id}`}
                  className={clsx(
                    {
                      'font-medium': ['action', 'id'].includes(cell.column.id),
                      'whitespace-nowrap text-right': cell.column.id === 'action',
                    },
                    'px-3 py-2'
                  )}
                  {...cell.getCellProps()}
                >
                  <div className="text-sm text-gray-900">{cell.render('Cell')}</div>
                </td>
              ))}
            </tr>
          );
        })}
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
      index === self.findIndex((duplicate) => duplicate.system === contact.system && duplicate.email === contact.email)
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
    <div className="grid grid-cols-[1fr,3fr] rounded-lg border px-3 py-1 leading-snug print:border-none">
      <span className="text-right font-bold">Contact:</span> <span className="pl-1">{titleCase(contact.name)}</span>
      <span className="text-right font-bold">Email:</span> <span className="pl-1">{contact.email.toLowerCase()}</span>
      <span className="text-right font-bold">Name:</span> <span className="pl-1">{titleCase(contact.system)}</span>
    </div>
  );
};
