import Graphic from '@arcgis/core/Graphic';
import Viewpoint from '@arcgis/core/Viewpoint';
import '@arcgis/core/assets/esri/themes/light/main.css';
import Polygon from '@arcgis/core/geometry/Polygon';
import { difference, union } from '@arcgis/core/geometry/geometryEngine';
import { webMercatorToGeographic } from '@arcgis/core/geometry/support/webMercatorUtils';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useGraphicManager, useViewPointZooming, useWebMap } from '@ugrc/utilities/hooks';
import clsx from 'clsx';
import ky from 'ky';
import { useContext, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useImmerReducer } from 'use-immer';
import { AuthContext } from '../../../AuthContext';
import { ErrorMessage, ErrorMessageTag, GridHeading, Label, SiteLocationSchema as schema } from '../../FormElements';
import { enablePolygonDrawing } from '../../MapElements/Drawing';
import { PinSymbol, PolygonSymbol } from '../../MapElements/MarkerSymbols';
import {
  BackButton,
  Chrome,
  Geocode,
  OkNotToggle,
  PointIcon,
  PolygonIcon,
  SelectPolygonIcon,
  onRequestError,
  toast,
  useNavigate,
  useParams,
} from '../../PageElements';
import { getSites } from '../loaders';

const pureReducer = (draft, action) => {
  switch (action.type) {
    case 'initial-load': {
      if (action.payload.geometry) {
        const shape = JSON.parse(action.payload.geometry);

        draft.geometry = shape;
      }

      if (action.payload.address) {
        draft.address = action.payload.address;
      }

      break;
    }
    case 'geocode-success': {
      draft.address = action.payload.attributes.address;
      draft.formStatus = 'allow-site-boundary-from-click';

      break;
    }
    case 'skip-geocoding': {
      draft.formStatus = 'allow-site-address-from-click';

      break;
    }
    case 'activate-site-address-from-click': {
      if (draft.activeTool === 'site-address-click') {
        draft.activeTool = null;
      } else {
        draft.activeTool = 'site-address-click';
      }

      break;
    }
    case 'address-clicked': {
      const decimalDegrees = webMercatorToGeographic(action.payload.geometry);
      const decimalPlaces = 100000;

      draft.address = `${Math.round(decimalDegrees.x * decimalPlaces) / decimalPlaces}, ${
        Math.round(decimalDegrees.y * decimalPlaces) / decimalPlaces
      }`;
      draft.formStatus = 'allow-site-boundary-from-click';

      break;
    }
    case 'select-site-from-parcel': {
      if (draft.activeTool === 'selecting-a-parcel') {
        draft.activeTool = null;
      } else {
        draft.activeTool = 'selecting-a-parcel';
      }

      break;
    }
    case 'set-site-boundary': {
      draft.geometry = action.payload?.toJSON();

      if (action.meta === 'freehand-polygon-drawing') {
        draft.activeTool = null;
      }

      break;
    }
    case 'draw-site-boundary': {
      if (draft.activeTool === 'freehand-polygon-drawing') {
        draft.activeTool = null;
      } else {
        draft.activeTool = 'freehand-polygon-drawing';
      }

      break;
    }
  }
};

export function Component() {
  const { authInfo } = useContext(AuthContext);
  const { siteId } = useParams();
  const navigate = useNavigate();
  const mapDiv = useRef(null);
  const pointAddressClickEvent = useRef(null);
  const parcelClickEvent = useRef(null);
  const siteDrawingEvents = useRef(null);
  const parcelIds = useRef([]);
  const queryClient = useQueryClient();
  const { status, data } = useQuery(getSites(siteId));
  const { mutate } = useMutation({
    mutationFn: (input) => ky.put('/api/site', { json: input }).json(),
    onSuccess: () => {
      toast.success('Site location updated successfully!');
      navigate(`/site/${siteId}/inventory/create`);
      queryClient.invalidateQueries({ queryKey: ['site', siteId] });
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your site location.'),
  });
  const { formState, handleSubmit, reset, setValue } = useForm({ resolver: yupResolver(schema) });
  const { isDirty } = formState;
  const { viewRef } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  // zoom map on geocode
  const { setViewPoint } = useViewPointZooming(viewRef.current);
  // manage graphics
  const { setGraphic: setPolygonGraphic, graphic: sitePolygon } = useGraphicManager(viewRef.current);
  const { setGraphic: setPointGraphic } = useGraphicManager(viewRef.current);
  const { setGraphic: setDrawingGraphic } = useGraphicManager(viewRef.current);

  const [state, dispatch] = useImmerReducer(pureReducer, {
    address: undefined,
    geometry: undefined,
    activeTool: undefined,
    formStatus: undefined,
  });

  // hydrate form with existing data
  useEffect(() => {
    if (status === 'success') {
      dispatch({
        type: 'initial-load',
        payload: {
          geometry: data?.geometry,
          address: data?.address,
        },
      });

      if (data.geometry) {
        const shape = JSON.parse(data.geometry);

        const geometry = new Polygon({
          type: 'polygon',
          rings: shape.rings,
          spatialReference: shape.spatialReference,
        });

        setViewPoint(geometry.extent.expand(3));
      }

      reset({ geometry: JSON.parse(data?.geometry), address: data?.address });
    }
  }, [data, status, setViewPoint, dispatch, reset]);

  // synchronizes the form with the state for sites with a geometry
  useEffect(() => {
    setValue('geometry', state.geometry, { shouldDirty: true });

    if (state.geometry) {
      const geometry = new Polygon({
        type: 'polygon',
        rings: state.geometry.rings,
        spatialReference: state.geometry.spatialReference,
      });

      setPolygonGraphic(
        new Graphic({
          geometry: geometry,
          attributes: {},
          symbol: PolygonSymbol,
        }),
      );
    } else {
      setPolygonGraphic(null);
      parcelIds.current = [];
    }
  }, [state.geometry, setValue, setPolygonGraphic, setViewPoint]);

  // synchronizes the form with the state for sites with an address
  useEffect(() => {
    setValue('address', state.address, { shouldDirty: true });
  }, [setValue, state.address]);

  // activate point clicking for selecting an address
  useEffect(() => {
    // if the tool was changed clear existing events
    if (state.activeTool !== 'site-address-click') {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    } else {
      viewRef.current.focus();

      // enable clicking on the map to set the address
      pointAddressClickEvent.current = viewRef.current.on('immediate-click', (event) => {
        const graphic = new Graphic({
          geometry: event.mapPoint,
          attributes: {},
          symbol: PinSymbol,
        });

        dispatch({ type: 'address-clicked', payload: graphic });
        setPointGraphic(graphic);

        if (viewRef.current.scale > 10489.34) {
          viewRef.current.goTo(new Viewpoint({ targetGeometry: graphic.geometry, scale: 10480 }));
        }
      });
    }

    return () => {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    };
  }, [state.activeTool, viewRef, setPointGraphic, dispatch]);

  // activate parcel hit test clicking
  useEffect(() => {
    // clean up events when disabled
    if (state.activeTool !== 'selecting-a-parcel') {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;
    } else {
      viewRef.current.focus();

      parcelClickEvent.current = viewRef.current.on('click', (event) => {
        //! stop popup from displaying
        event.preventDefault();
        event.stopPropagation();

        const parcelLayerIndex = viewRef.current.map.layers.items[0];

        viewRef.current
          .hitTest(event, {
            include: parcelLayerIndex,
          })
          .then((test) => {
            if ((test.results?.length ?? 0) < 1) {
              return;
            }

            const graphic = test.results[0].graphic;
            const parcel = graphic.attributes.OBJECTID;

            let geometry;
            if (parcelIds.current.includes(parcel)) {
              geometry = difference(sitePolygon.geometry, graphic.geometry);
              parcelIds.current = parcelIds.current.filter((id) => id !== parcel);
            } else {
              if (sitePolygon) {
                geometry = union([sitePolygon.geometry, graphic.geometry]);
              } else {
                geometry = graphic.geometry;
              }

              parcelIds.current.push(parcel);
            }

            dispatch({ type: 'set-site-boundary', payload: geometry, meta: 'selecting-a-parcel' });
          });
      });
    }

    return () => {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;
    };
  }, [state.activeTool, viewRef, sitePolygon, dispatch]);

  // activate polygon site drawing
  useEffect(() => {
    if (state.activeTool !== 'freehand-polygon-drawing') {
      for (let index = 0; index < siteDrawingEvents.current?.length; index++) {
        const event = siteDrawingEvents.current[index];

        event.remove();
      }

      siteDrawingEvents.current = null;
    } else {
      viewRef.current.focus();

      const [drawAction, drawingEvent] = enablePolygonDrawing(viewRef.current, setDrawingGraphic);

      const finishEvent = drawAction.on(['draw-complete'], (event) => {
        dispatch({
          type: 'set-site-boundary',
          payload: new Polygon({
            type: 'polygon',
            rings: event.vertices,
            spatialReference: viewRef.current.spatialReference,
          }),
          meta: 'freehand-polygon-drawing',
        });
      });

      siteDrawingEvents.current = [drawingEvent, finishEvent];
    }
  }, [state.activeTool, setDrawingGraphic, viewRef, dispatch]);

  // clear polygons when drawing tool changes
  useEffect(() => {
    if (['freehand-polygon-drawing', 'selecting-a-parcel'].includes(state.activeTool)) {
      dispatch({ type: 'set-site-boundary', payload: null });
    }
  }, [state.activeTool, dispatch]);

  const geocode = (result) => {
    if (!result) {
      return geocodeError('No match found');
    }

    dispatch({ type: 'geocode-success', payload: result });
    setValue('address', result.attributes.address, { shouldDirty: true });
    setPointGraphic(new Graphic(result));
    setViewPoint(new Viewpoint({ targetGeometry: result.geometry, scale: 1500 }));
  };

  const geocodeError = () => dispatch({ type: 'skip-geocoding', payload: false });

  const addSiteLocation = async (formData) => {
    if (!isDirty) {
      return (await navigate(1)) || (await navigate(`/site/${siteId}/inventory/create`));
    }

    const input = {
      id: parseInt(authInfo.id),
      siteId: parseInt(siteId),
      ...formData,
      geometry: JSON.stringify(formData.geometry),
    };

    mutate(input);
  };

  return (
    <main>
      <Chrome>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <GridHeading text="Site Location" subtext="Set the address and polygon for your site" site={data}>
            <p className="mb-3">
              First, find your site location by it&apos;s address. If you don&apos;t have an address{' '}
              <button data-style="link" onClick={() => dispatch({ type: 'skip-geocoding', payload: null })}>
                skip
              </button>{' '}
              this step.
            </p>
            <div
              className={clsx('ml-4 rounded border px-4 py-5 transition hover:opacity-100', {
                'opacity-25': state.formStatus === 'allow-site-address-from-click' || state.address,
              })}
            >
              <Geocode
                pointSymbol={PinSymbol}
                events={{ success: geocode, error: geocodeError }}
                apiKey={import.meta.env.VITE_API_KEY}
              />
            </div>
            {state.formStatus !== 'allow-site-address-from-click' ? null : (
              <>
                <p className="my-3">
                  The site address was not found, select a point for the site instead with the tool below.
                </p>
                <div
                  className={clsx('ml-4 flex justify-center rounded border px-4 py-5 transition hover:opacity-100', {
                    'opacity-25': state.formStatus !== 'allow-site-address-from-click',
                  })}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      data-style="tool"
                      className={clsx({
                        'border-amber-900 bg-amber-800 text-white': state.activeTool === 'site-address-click',
                      })}
                      onClick={() => dispatch({ type: 'activate-site-address-from-click', payload: '' })}
                    >
                      <PointIcon classes="h-6 w-6 text-white fill-current" />
                    </button>
                    <span className="block text-xs text-gray-500">Choose site point</span>
                  </div>
                </div>
              </>
            )}
            {state.formStatus === 'allow-site-boundary-from-click' || state.address ? (
              <>
                <p className="my-3">
                  Next, click a tool below to either select a parcel on the map as the site area, or draw the site area.
                </p>
                <div className="ml-4 flex justify-around rounded border px-4 py-5">
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      data-style="tool"
                      className={clsx({
                        'border-amber-900 bg-amber-800 text-white': state.activeTool === 'selecting-a-parcel',
                      })}
                      onClick={() => dispatch({ type: 'select-site-from-parcel', payload: '' })}
                    >
                      <SelectPolygonIcon classes="h-6 w-6 text-white fill-current" />
                    </button>
                    <span className="block text-xs text-gray-500">Select Parcels</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      data-style="tool"
                      className={clsx({
                        'border-amber-900 bg-amber-800 text-white': state.activeTool === 'freehand-polygon-drawing',
                      })}
                      onClick={() => dispatch({ type: 'draw-site-boundary', payload: '' })}
                    >
                      <PolygonIcon classes="h-6 w-6 text-white fill-current" />
                    </button>
                    <span className="block text-xs text-gray-500">Draw Site</span>
                  </div>
                </div>
              </>
            ) : null}
          </GridHeading>
          <div className="md:col-span-2 md:mt-0">
            <div className="mt-6 overflow-hidden shadow sm:rounded-md">
              <div className="bg-white">
                <div className="grid grid-cols-6">
                  <div className="col-span-6">
                    <div className="h-96 w-full" ref={mapDiv}></div>
                    <form className="border-t-2 border-gray-50" onSubmit={handleSubmit(addSiteLocation)}>
                      <div className="px-4 py-3">
                        <div className="flex justify-around">
                          <div className="flex flex-col justify-items-center">
                            <Label id="address" />
                            <OkNotToggle classes="h-12" status={state.address} />
                            <ErrorMessage name="address" errors={formState.errors} as={ErrorMessageTag} />
                          </div>
                          <div className="flex flex-col justify-items-center">
                            <Label id="site" text="Site Location" />
                            <OkNotToggle classes="h-12" status={state.geometry} />
                            <ErrorMessage name="geometry" errors={formState.errors} as={ErrorMessageTag} />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between bg-gray-100 px-4 py-3 text-right sm:px-6">
                        <BackButton />
                        <button type="submit" data-style="primary" disabled={!state.formStatus === 'complete'}>
                          Next
                        </button>
                      </div>
                    </form>
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
