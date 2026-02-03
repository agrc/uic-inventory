import Graphic from '@arcgis/core/Graphic';
import Viewpoint from '@arcgis/core/Viewpoint';
import { Description, Dialog, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { TrashIcon } from '@heroicons/react/24/outline';
import { ErrorMessage } from '@hookform/error-message';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import Tippy from '@tippyjs/react/headless';
import { useGraphicManager, useMapReady, useOpenClosed, useWebMap } from '@ugrc/utilities/hooks';
import clsx from 'clsx';
import ky from 'ky';
import throttle from 'lodash.throttle';
import PropTypes from 'prop-types';
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useImmerReducer } from 'use-immer';
import * as yup from 'yup';
import { AuthContext } from '../../../AuthContext';
import { operatingStatusTypes, remediationTypes, valueToLabel } from '../../../data/lookups';
import {
  EditableCellSelect,
  GridHeading,
  Label,
  SelectInput,
  TextInput,
  WellLocationSchema as schema,
} from '../../FormElements';
import ErrorMessageTag from '../../FormElements/ErrorMessage';
import { useInventoryWells, useSitePolygon } from '../../Hooks';
import { PinSymbol } from '../../MapElements/MarkerSymbols';
import {
  BackButton,
  Chrome,
  OkNotToggle,
  PointIcon,
  Tooltip,
  onRequestError,
  toast,
  useNavigate,
  useParams,
} from '../../PageElements';
import { getInventory } from '../loaders';

import '@arcgis/core/assets/esri/themes/light/main.css';

const reducer = (draft, action) => {
  switch (action.type) {
    case 'activate-tool': {
      draft.activeTool = action.payload;

      break;
    }
    case 'set-geometry-value': {
      draft.geometry = action.payload;

      break;
    }
    case 'set-hover-graphic': {
      if (action?.meta === 'toggle') {
        action.payload = draft.highlighted ? null : action.payload;
      }

      draft.highlighted = action.payload;

      break;
    }
  }
};

export function Component() {
  const { siteId, inventoryId } = useParams();
  const navigate = useNavigate();

  const [state, dispatch] = useImmerReducer(reducer, {
    geometry: undefined,
    activeTool: undefined,
    highlighted: undefined,
  });

  const { status, data } = useQuery(getInventory(siteId, inventoryId));

  return (
    <main>
      <Chrome loading={status === 'pending'}>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <GridHeading
            text="Well Location"
            subtext="Enter well information then click `Draw` to add a well location on the map. If there are more than 10 wells for a single Well Operating Status, place a single point in a representative location and specify the number of wells."
            site={data?.site}
          >
            <p className="mb-3">Fill out the information below to activate drawing the well location on the map.</p>
            <AddWellForm data={data} state={state} dispatch={dispatch} />
          </GridHeading>
          <div className="md:col-span-2 md:mt-0">
            <div className="overflow-hidden shadow sm:rounded-md">
              <div className="bg-white">
                <div className="grid grid-cols-6">
                  <div className="col-span-6">
                    <WellMap site={data?.site} wells={data?.wells} state={state} dispatch={dispatch} />
                    <WellTable wells={data?.wells} state={state} dispatch={dispatch} />
                    <div className="flex justify-between bg-gray-100 px-4 py-3 text-right sm:px-6">
                      <BackButton />
                      <button
                        type="submit"
                        data-style="primary"
                        onClick={() => navigate(`/site/${siteId}/inventory/${inventoryId}/add-well-details`)}
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

function AddWellForm({ data, state, dispatch }) {
  const { authInfo } = useContext(AuthContext);
  const { siteId, inventoryId } = useParams();
  const queryClient = useQueryClient();

  const { mutate: addWell } = useMutation({
    mutationFn: (json) => ky.post('/api/well', { json }).json(),
    onSuccess: () => {
      toast.success('Well added successfully!');
      queryClient.invalidateQueries({ queryKey: ['site', siteId, 'inventory', inventoryId] });
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

  useEffect(() => {
    register('geometry');
  }, [register]);

  //* decouple reset from handleSubmit because we use formState and they both act on it
  useEffect(() => {
    if (!formState.isSubmitSuccessful) {
      return;
    }

    reset();
    dispatch({ type: 'set-geometry-value', payload: null });
  }, [formState, register, reset, dispatch, setValue]);

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

  useEffect(() => {
    if (state.geometry) {
      setValue('geometry', state.geometry, { shouldValidate: true });
    }
  }, [state.geometry, setValue]);

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

  //! pull value from form state to activate proxy
  const { isDirty, isValid } = formState;

  return (
    <form className="grid gap-2 px-4 py-5 shadow sm:rounded-md" onSubmit={handleSubmit(addLocation)}>
      <TextInput id="construction" text="Well Construction/Name" register={register} errors={formState.errors} />
      <SelectInput id="status" items={operatingStatusTypes} register={register} errors={formState.errors} />
      {watchStatus === 'OT' && <TextInput id="description" register={register} errors={formState.errors} />}
      {data?.subClass === 5002 && (
        <>
          <SelectInput id="remediationType" items={remediationTypes} register={register} errors={formState.errors} />
          {watchRemediationType === '999' && (
            <TextInput id="remediationDescription" register={register} errors={formState.errors} />
          )}
          <TextInput id="remediationProjectId" register={register} errors={formState.errors} />
        </>
      )}
      <TextInput id="quantity" type="number" register={register} errors={formState.errors} />
      <div className="flex justify-between">
        <span className="font-medium text-gray-700">Well Location</span>
        <OkNotToggle classes="h-12" status={watchGeometry} />
      </div>
      <ErrorMessage errors={formState.errors} name="geometry.x" as={ErrorMessageTag} />
      <div className="flex justify-between px-4 py-3">
        <Tippy
          render={(attrs) => (
            <Tooltip {...attrs}>
              Click to activate drawing, then click on the map to create or move well location.
            </Tooltip>
          )}
        >
          <div className="flex flex-col items-center space-y-2">
            <button
              type="button"
              aria-label="Draw well location on map"
              data-style="tool"
              className={clsx({ 'border-amber-900 bg-amber-800 text-white': state.activeTool === 'draw-well' })}
              onClick={() => dispatch({ type: 'activate-tool', payload: 'draw-well' })}
            >
              <PointIcon classes="fill-current h-6 w-6" />
            </button>
            <span className="block text-xs text-gray-500">Draw Well</span>
          </div>
        </Tippy>
        <div className="flex flex-col items-center space-y-2">
          <button type="submit" data-style="secondary" disabled={!isValid}>
            Add
          </button>
        </div>
      </div>
    </form>
  );
}
AddWellForm.propTypes = {
  dispatch: PropTypes.func,
  state: PropTypes.object,
  data: PropTypes.object,
};
function WellMap({ site, wells, state, dispatch }) {
  const mapDiv = useRef(null);
  const drawingEvent = useRef();
  const hoverEvent = useRef();

  const { viewRef } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  const hitTestGraphics = useInventoryWells(viewRef.current, wells, { includeComplete: false });
  useSitePolygon(viewRef.current, site);
  // manage graphics
  const { setGraphic: setPointGraphic } = useGraphicManager(viewRef.current);
  const ready = useMapReady(viewRef.current);

  // activate point clicking for selecting a well location
  useEffect(() => {
    // if the tool was changed clear existing events
    if (state.activeTool !== 'draw-well') {
      drawingEvent.current?.remove();
      drawingEvent.current = null;

      return;
    }

    viewRef.current.focus();

    // enable clicking on the map to set the well location
    drawingEvent.current = viewRef.current.on('immediate-click', (event) => {
      const graphic = new Graphic({
        geometry: event.mapPoint,
        attributes: { id: 'temp', selected: false, complete: false },
        symbol: PinSymbol,
      });

      if (viewRef.current.scale > 20000) {
        viewRef.current.goTo(new Viewpoint({ targetGeometry: graphic.geometry, scale: 10480 }));
      }

      setPointGraphic(graphic);
      dispatch({ type: 'set-geometry-value', payload: event.mapPoint.toJSON() });

      drawingEvent.current?.remove();
      drawingEvent.current = null;

      dispatch({ type: 'activate-tool', payload: null });
    });

    return () => {
      drawingEvent.current?.remove();
      drawingEvent.current = null;
    };
  }, [state.activeTool, setPointGraphic, dispatch, viewRef]);

  // activate point hovering for viewing a well location in the table
  useEffect(() => {
    const options = {
      include: hitTestGraphics,
    };

    if (!ready) {
      return;
    }

    hoverEvent.current = viewRef.current.on(
      'pointer-move',
      throttle((event) => {
        viewRef.current.hitTest(event, options).then(({ results }) => {
          let id = 'empty';
          if (results.length > 0) {
            id = results[0].graphic.attributes.id;
          }

          dispatch({ type: 'set-hover-graphic', payload: id });
        });
      }, 100),
    );

    return () => {
      hoverEvent.current?.remove();
    };
  }, [ready, viewRef, dispatch, hitTestGraphics]);

  // clear temp point graphic when geometry is saved
  useEffect(() => {
    if (state.geometry) {
      return;
    }

    setPointGraphic(null);
  }, [setPointGraphic, state.geometry]);

  // manage point highlighting
  useEffect(() => {
    if (!ready) {
      return;
    }

    viewRef.current.graphics.items.forEach((graphic) => {
      if (graphic.getAttribute('id') === state.highlighted) {
        graphic.setAttribute('selected', true);
      } else {
        graphic.setAttribute('selected', false);
      }
    });
  }, [ready, viewRef, state.highlighted]);

  return <div className="h-96 w-full" ref={mapDiv}></div>;
}
WellMap.propTypes = {
  site: PropTypes.object,
  dispatch: PropTypes.func,
  state: PropTypes.object,
  wells: PropTypes.array,
};
function WellTable({ wells = [], state, dispatch }) {
  const { inventoryId, siteId } = useParams();
  const { authInfo } = useContext(AuthContext);
  const [isOpen, { open, close }] = useOpenClosed();
  const deleteWell = useRef();
  const queryKey = ['site', siteId, 'inventory', inventoryId];

  const { mutate } = useMutation({
    mutationFn: (json) => ky.delete(`/api/well`, { json }),
    onMutate: async (mutationData) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        return {
          ...old,
          wells: old.wells.filter((x) => x.id !== mutationData.wellId),
        };
      });

      close();

      return { previousValue };
    },
    onSuccess: () => {
      toast.success('This well was removed.');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error, _, context) => {
      queryClient.setQueryData(queryKey, context.previousValue);
      onRequestError(error, 'We had some trouble deleting this well.');
    },
  });
  const { mutate: update } = useMutation({
    mutationFn: (json) => ky.put(`/api/well`, { json }),
    onMutate: async (well) => {
      await queryClient.cancelQueries({ queryKey });
      const previousValue = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (old) => {
        const updatedWell = old.wells.find((w) => w.id === well.wellId);
        const originalWells = old.wells.filter((w) => w.id !== well.wellId);

        updatedWell.status = valueToLabel(operatingStatusTypes, well.status);

        const updated = {
          ...old,
          site: { ...old.site },
          wells: [...originalWells, updatedWell].sort((a, b) => a.id - b.id),
        };

        return updated;
      });

      return { previousValue };
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onSuccess: () => {
      toast.success('Well updated successfully!');
    },
    onError: (error, _, context) => {
      onRequestError(error, 'We had some trouble updating this well.');
      queryClient.setQueryData(queryKey, context.previousValue);
    },
  });

  const modify = useCallback(
    (well) => {
      const input = {
        accountId: parseInt(authInfo.id),
        inventoryId: parseInt(inventoryId),
        siteId: parseInt(siteId),
        wellId: parseInt(well.id),
        status: well.status,
        description: well.description,
      };

      update(input);
    },
    [authInfo, inventoryId, siteId, update],
  );
  const onMutate = useCallback((well) => modify(well), [modify]);
  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
      },
      {
        accessorKey: 'wellName',
        header: 'Construction',
      },
      {
        accessorKey: 'status',
        header: 'Operating Status',
        cell: ({ cell, row }) => {
          return (
            <EditableCellSelect
              wellId={row.getValue('id')}
              status={cell.getValue()}
              items={operatingStatusTypes}
              onMutate={onMutate}
              isValid={(data) =>
                yup
                  .object()
                  .shape({
                    status: yup.string().oneOf(['AC', 'PA', 'PR', 'OT'], 'A valid selection must be made').required(),
                    id: yup.number().positive().required(),
                    description: yup.string().when('status', {
                      is: 'OT',
                      then: () => yup.string().required().min(5).max(512),
                    }),
                  })
                  .validateSync(data)
              }
              tooltip={row.getValue('description')}
            />
          );
        },
      },
      {
        accessorKey: 'description',
      },
      {
        header: 'Count',
        accessorKey: 'count',
      },
      {
        id: 'action',
        header: 'Action',
        cell: function action(data) {
          return (
            <TrashIcon
              aria-label="delete site"
              className="ml-1 h-6 w-6 cursor-pointer text-red-600 hover:text-red-900"
              onClick={(event) => {
                open();

                deleteWell.current = data.row.original.id;
                event.stopPropagation();
              }}
            />
          );
        },
      },
    ],
    [open, onMutate],
  );

  const table = useReactTable({
    columns,
    data: wells,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      columnVisibility: { id: false, description: false },
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
      <div className="m-6 px-5 py-4">
        <h2 className="mb-1 text-xl font-medium">Create your first well</h2>
        <p className="text-gray-700">Get started by filling out the form to add your first well.</p>
        <div className="mb-6 text-center text-sm text-gray-900"></div>
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
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black opacity-30" />
            </TransitionChild>

            <span className="inline-block h-screen align-middle" aria-hidden="true">
              &#8203;
            </span>

            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="mx-auto my-48 inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle className="text-lg font-medium leading-6 text-gray-900">
                  Well Deletion Confirmation
                </DialogTitle>
                <Description className="mt-1">This well will be permanently deleted</Description>

                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete this well? This action cannot be undone.
                </p>

                <div className="mt-6 flex justify-around">
                  <button type="button" data-style="primary" className="bg-indigo-900" onClick={remove}>
                    Yes
                  </button>
                  <button
                    type="button"
                    data-style="primary"
                    onClick={() => {
                      close();
                      deleteWell.current = null;
                    }}
                  >
                    No
                  </button>
                </div>
              </div>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>

      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900"
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
              onMouseEnter={() => dispatch({ type: 'set-hover-graphic', payload: row.original.id })}
              onMouseLeave={() => dispatch({ type: 'set-hover-graphic', payload: null })}
              onClick={() => dispatch({ type: 'set-hover-graphic', payload: row.original.id, meta: 'toggle' })}
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className={clsx(
                    {
                      'font-medium': ['action', 'id'].includes(cell.column.id),
                      'whitespace-nowrap text-right': cell.column.id === 'action',
                    },
                    'px-3 py-4',
                  )}
                >
                  <div className="text-sm text-gray-900">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
WellTable.propTypes = {
  dispatch: PropTypes.func,
  state: PropTypes.object,
  wells: PropTypes.array,
};
