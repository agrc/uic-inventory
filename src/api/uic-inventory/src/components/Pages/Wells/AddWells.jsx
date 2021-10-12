import { Fragment, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTable } from 'react-table';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import ky from 'ky';
import { ErrorMessage } from '@hookform/error-message';
import { Dialog, Transition } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/outline';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import Viewpoint from '@arcgis/core/Viewpoint';
import clsx from 'clsx';
import Tippy from '@tippyjs/react/headless';
import {
  BackButton,
  Chrome,
  toast,
  useParams,
  OkNotToggle,
  onRequestError,
  PointIcon,
  useHistory,
} from '../../PageElements';
import { Label, GridHeading, WellLocationSchema as schema, SelectInput, TextInput } from '../../FormElements';
import { PinSymbol, PolygonSymbol } from '../../MapElements/MarkerSymbols';
import { AuthContext } from '../../../AuthProvider';
import { useWebMap, useViewPointZooming, useGraphicManager } from '../../Hooks';
import { useOpenClosed } from '../../Hooks/useOpenClosedHook';
import ErrorMessageTag from '../../FormElements/ErrorMessage';
import { Tooltip } from '../../PageElements';

import '@arcgis/core/assets/esri/themes/light/main.css';

const operatingStatus = [
  { value: 'AC', label: 'Active' },
  { value: 'PA', label: 'Abandoned ‐ Approved' },
  { value: 'TA', label: 'Abandoned ‐ Temporary' },
  { value: 'AN', label: 'Abandoned ‐ Not Approved' },
  { value: 'PW', label: 'Proposed Under Permit Application' },
  { value: 'PR', label: 'Proposed Under Authorization By Rule' },
  { value: 'PI', label: 'Post Injection CO2 Well' },
  { value: 'OT', label: 'Other' },
];

const remediationType = [
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

function AddWells() {
  const { authInfo } = useContext(AuthContext);
  const { siteId, inventoryId } = useParams();
  const queryClient = useQueryClient();
  const history = useHistory();
  const mapDiv = useRef(null);
  const drawingEvent = useRef();
  const [activeTool, setActiveTool] = useState();

  const { status, data } = useQuery(
    ['inventory', inventoryId],
    () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    {
      enabled: siteId > 0,
      onError: (error) => onRequestError(error, 'We had some trouble finding your wells.'),
    }
  );
  const { mutate: addWell } = useMutation((json) => ky.post('/api/well', { json }).json(), {
    onSuccess: () => {
      toast.success('Well added successfully!');
      queryClient.invalidateQueries(['inventory', inventoryId]);

      setPointGraphic();
    },
    onError: (error) => onRequestError(error, 'We had some trouble adding your well.'),
  });

  const { handleSubmit, register, formState, reset, setValue, unregister, watch } = useForm({
    resolver: yupResolver(schema),
    context: { subClass: data?.subClass },
    mode: 'onChange',
  });

  const watchStatus = watch('status');
  const watchRemediationType = watch('remediationType');
  const watchGeometry = watch('geometry');

  //! pull value from form state to activate proxy
  const { isDirty, isValid } = formState;

  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  // zoom map on geocode
  const { setViewPoint } = useViewPointZooming(mapView);
  // manage graphics
  const { graphic, setGraphic: setPolygonGraphic } = useGraphicManager(mapView);
  const { setGraphic: setExistingPointGraphics } = useGraphicManager(mapView);
  const { setGraphic: setPointGraphic } = useGraphicManager(mapView);

  useEffect(() => {
    register('geometry');
  }, [register]);

  //* decouple reset from handleSubmit because we use formState and they both act on it
  useEffect(() => {
    if (!formState.isSubmitSuccessful) {
      return;
    }

    reset();
  }, [formState, register, reset, setValue]);

  // place site polygon
  useEffect(() => {
    if (status !== 'success' || graphic) {
      return;
    }

    const shape = JSON.parse(data.site.geometry);
    const geometry = new Polygon({
      type: 'polygon',
      rings: shape.rings,
      spatialReference: shape.spatialReference,
    });

    setPolygonGraphic(
      new Graphic({
        geometry: geometry,
        attributes: {},
        symbol: PolygonSymbol,
      })
    );

    setViewPoint(geometry.extent.expand(3));
  }, [data, status]);

  // place site wells
  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    const wells = data.wells.map(
      (well) =>
        new Graphic({
          geometry: new Point(JSON.parse(well.geometry)),
          attributes: {},
          symbol: PinSymbol,
        })
    );

    setExistingPointGraphics(wells);
  }, [data, status]);

  // handle conditional control registration
  useEffect(() => {
    if (data?.subClass === 5002) {
      register('remediationType', { required: true });
    } else {
      unregister('remediationType');
    }
  }, [data, register, unregister]);

  // handle conditional control registration
  useEffect(() => {
    if (watchStatus === 'OT') {
      register('description', { required: true });
    } else {
      unregister('description');
    }
  }, [watchStatus, register, unregister]);

  // add and remove controls for SER well form
  useEffect(() => {
    if (watchRemediationType === '999') {
      register('remediationDescription', { required: true });
    } else {
      unregister('remediationDescription');
    }
  }, [watchRemediationType, register, unregister]);

  // activate point clicking for selecting a well location
  useEffect(() => {
    // if the tool was changed clear existing events
    if (activeTool !== 'draw-well') {
      drawingEvent.current?.remove();
      drawingEvent.current = null;

      return;
    }

    mapView.current.focus();

    // enable clicking on the map to set the well location
    drawingEvent.current = mapView.current.on('immediate-click', (event) => {
      const graphic = new Graphic({
        geometry: event.mapPoint,
        attributes: {},
        symbol: PinSymbol,
      });

      setPointGraphic(graphic);

      if (mapView.current.scale > 20000) {
        mapView.current.goTo(new Viewpoint({ targetGeometry: graphic.geometry, scale: 10480 }));
      }

      setValue('geometry', event.mapPoint.toJSON(), { shouldValidate: true });

      drawingEvent.current?.remove();
      drawingEvent.current = null;

      setActiveTool(null);
    });

    return () => {
      drawingEvent.current?.remove();
      drawingEvent.current = null;
    };
  }, [activeTool, setValue, setPointGraphic]);

  const addLocation = (formData) => {
    if (!isDirty) {
      return;
    }

    const input = {
      accountId: parseInt(authInfo.id),
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      ...formData,
      geometry: JSON.stringify(formData.geometry),
    };

    addWell(input);
  };

  return (
    <main>
      <Chrome>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <GridHeading
            text="Well Location"
            subtext="Enter well information then click `Draw` to add a well location on the map. If there are more than 10 wells for a single Well Operating Status, place a single point in a representative location and specify the number of wells."
            site={data?.site}
          >
            <p className="mb-3">Fill out the information below to activate drawing the well location on the map.</p>
            <form
              className="grid gap-2 px-4 py-5 shadow sm:rounded-md"
              onSubmit={handleSubmit((data) => addLocation(data))}
            >
              <TextInput
                id="construction"
                text="Well Construction/Name"
                register={register}
                errors={formState.errors}
              />
              <SelectInput id="status" items={operatingStatus} register={register} errors={formState.errors} />
              {watchStatus === 'OT' && <TextInput id="description" register={register} errors={formState.errors} />}
              {data?.subClass === 5002 && (
                <>
                  <SelectInput
                    id="remediationType"
                    items={remediationType}
                    register={register}
                    errors={formState.errors}
                  />
                  {watchRemediationType === '999' && (
                    <TextInput id="remediationDescription" register={register} errors={formState.errors} />
                  )}
                  <TextInput id="remediationProjectId" register={register} errors={formState.errors} />
                </>
              )}
              <TextInput id="quantity" type="number" register={register} errors={formState.errors} />
              <div className="flex justify-between">
                <Label id="wellLocation" />
                <OkNotToggle classes="h-12" status={watchGeometry} />
              </div>
              <ErrorMessage errors={formState.errors} name="geometry.x" as={ErrorMessageTag} />
              <div className="flex justify-between px-4 py-3">
                <Tippy
                  render={(attrs) => (
                    <Tooltip {...attrs}>
                      Click to activate drawing. Then click on the map to create or move a well location.
                    </Tooltip>
                  )}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      className={clsx({ 'bg-blue-800': activeTool === 'draw-well' })}
                      onClick={() => setActiveTool('draw-well')}
                    >
                      <PointIcon classes="h-6 text-white fill-current" />
                    </button>
                    <span className="block text-xs text-gray-500">Draw Well</span>
                  </div>
                </Tippy>
                <div className="flex flex-col items-center space-y-2">
                  <button type="submit" disabled={!isValid}>
                    Add
                  </button>
                </div>
              </div>
            </form>
          </GridHeading>
          <div className="md:mt-0 md:col-span-2">
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="bg-white">
                <div className="grid grid-cols-6">
                  <div className="col-span-6">
                    <div className="w-full h-96" ref={mapDiv}></div>
                    <WellTable wells={data?.wells} />
                    <div className="flex justify-between px-4 py-3 text-right bg-gray-100 sm:px-6">
                      <BackButton />
                      <button
                        type="submit"
                        onClick={() => history.push(`/site/${siteId}/inventory/${inventoryId}/add-well-details`)}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Chrome>
    </main>
  );
}

function WellTable({ wells = [] }) {
  const { inventoryId, siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const [isOpen, { open, close }] = useOpenClosed();
  const deleteWell = useRef();

  const { mutate } = useMutation((json) => ky.delete(`/api/well`, { json }), {
    onMutate: async (mutationData) => {
      await queryClient.cancelQueries(['inventory', inventoryId]);
      const previousValue = queryClient.getQueryData(['inventory', inventoryId]);

      queryClient.setQueryData(['inventory', inventoryId], (old) => {
        return {
          ...old,
          wells: old.wells.filter((x) => x.id !== mutationData.wellId),
        };
      });

      close();

      return previousValue;
    },
    onSuccess: () => {
      toast.success('This well was removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries(['inventory', inventoryId]);
    },
    onError: (error, previousValue) => {
      queryClient.setQueryData(['inventory', inventoryId], previousValue);
      onRequestError(error, 'We had some trouble deleting this well.');
    },
  });
  const columns = useMemo(
    () => [
      {
        accessor: 'id',
      },
      {
        accessor: 'wellName',
        Header: 'Construction',
      },
      {
        accessor: 'status',
        Header: 'Operating Status',
      },
      {
        Header: 'Count',
        accessor: 'count',
      },
      {
        id: 'action',
        Header: 'Action',
        Cell: function action(data) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="w-6 h-6 ml-1 text-red-600 cursor-pointer hover:text-red-900"
              onClick={() => {
                open();
                deleteWell.current = data.row.original.id;
              }}
            />
          );
        },
      },
    ],
    [open]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data: wells,
    initialState: {
      hiddenColumns: ['id'],
    },
  });

  const queryClient = useQueryClient();

  const remove = () =>
    mutate({
      inventoryId: parseInt(inventoryId),
      siteId: parseInt(siteId),
      accountId: parseInt(authInfo.id),
      wellId: deleteWell.current,
    });

  return wells?.length < 1 ? (
    <div className="flex flex-col items-center">
      <div className="px-5 py-4 m-6">
        <h2 className="mb-1 text-xl font-medium">Create your first well</h2>
        <p className="text-gray-700">Get started by filling out the form to add your first well.</p>
        <div className="mb-6 text-sm text-center text-gray-900"></div>
      </div>
    </div>
  ) : (
    <>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          open={isOpen}
          onClose={() => {
            close();
            deleteWell.current = null;
          }}
          className="fixed inset-0 z-10 overflow-y-auto"
        >
          <div className="min-h-screen px-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
            </Transition.Child>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block w-full max-w-md p-6 mx-auto my-48 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                <Dialog.Title className="text-lg font-medium leading-6 text-gray-900">
                  Well Deletion Confirmation
                </Dialog.Title>
                <Dialog.Description className="mt-1">This well will be permanently deleted</Dialog.Description>

                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this well? This action cannot be undone.
                </p>

                <div className="flex justify-around mt-6">
                  <button type="button" className="bg-indigo-900" onClick={remove}>
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      deleteWell.current = null;
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>

      <table {...getTableProps()} className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {headerGroups.map((headerGroup) => (
            <tr key={headerGroup.index} {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  key={`${headerGroup.index}-${column.id}`}
                  {...column.getHeaderProps()}
                  className="px-3 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase"
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-white divide-y divide-gray-200">
          {rows.map((row) => {
            prepareRow(row);

            return (
              <tr key={`${row.index}`} {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                    key={`${row.index}-${cell.column.id}`}
                    className={clsx(
                      {
                        'font-medium': ['action', 'id'].includes(cell.column.id),
                        'text-right whitespace-nowrap': cell.column.id === 'action',
                      },
                      'px-3 py-4'
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
    </>
  );
}

export default AddWells;
