import '@arcgis/core/assets/esri/themes/light/main.css';
import {
  BackButton,
  Chrome,
  toast,
  useParams,
  PolygonIcon,
  OkNotToggle,
  onRequestError,
  PointIcon,
  SelectPolygonIcon,
  useNavigate,
} from '../../PageElements';
import { ErrorMessage, ErrorMessageTag, GridHeading, Label, SiteLocationSchema as schema } from '../../FormElements';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Viewpoint from '@arcgis/core/Viewpoint';
import { TailwindDartboard } from '../../Dartboard/Dartboard';
import { useContext, useEffect, useReducer, useRef } from 'react';
import clsx from 'clsx';
import { PinSymbol, PolygonSymbol } from '../../MapElements/MarkerSymbols';
import { enablePolygonDrawing } from '../../MapElements/Drawing';
import { AuthContext } from '../../../AuthProvider';
import { useWebMap, useViewPointZooming, useGraphicManager } from '../../Hooks';
import { useQuery, useMutation } from 'react-query';
import ky from 'ky';

function AddSiteLocation() {
  const { authInfo } = useContext(AuthContext);
  const { siteId } = useParams();
  const navigate = useNavigate();
  const mapDiv = useRef(null);
  const isDirty = useRef(false);
  const pointAddressClickEvent = useRef(null);
  const parcelClickEvent = useRef(null);
  const siteDrawingEvents = useRef(null);
  const { status, data } = useQuery(['site', siteId], () => ky.get(`/api/site/${siteId}`).json(), {
    enabled: siteId > 0,
    onError: (error) => onRequestError(error, 'We had some trouble finding your site location.'),
  });
  const { mutate } = useMutation((input) => ky.put('/api/site', { json: input }).json(), {
    onSuccess: () => {
      toast.success('Site location updated successfully!');
      navigate(`/site/${siteId}/inventory/create`);
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your site location.'),
  });
  const { formState, handleSubmit, setValue } = useForm({ resolver: yupResolver(schema) });
  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  // zoom map on geocode
  const { setViewPoint } = useViewPointZooming(mapView);
  // manage graphics
  const { setGraphic: setPolygonGraphic } = useGraphicManager(mapView);
  const { setGraphic: setPointGraphic } = useGraphicManager(mapView);

  const reducer = (state, action) => {
    switch (action.type) {
      case 'initial-load': {
        if (action.payload.geometry) {
          setValue('geometry', action.payload.geometry);
          state = { ...state, geometry: action.payload.geometry };

          const shape = JSON.parse(action.payload.geometry);
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
        }

        if (action.payload.address) {
          state = { ...state, address: action.payload.address };
          setValue('address', action.payload.address);
        }

        if (state.address && state.geometry) {
          state = { ...state };
        }

        isDirty.current = false;

        return state;
      }
      case 'geocode-success': {
        isDirty.current = true;
        setValue('address', action.payload.attributes.InputAddress);
        setPointGraphic(new Graphic(action.payload));
        setViewPoint(new Viewpoint({ targetGeometry: action.payload.geometry, scale: 1500 }));

        return {
          ...state,
          address: action.payload.attributes.InputAddress,
          formStatus: 'allow-site-boundary-from-click',
        };
      }
      case 'skip-geocoding': {
        return { ...state, formStatus: 'allow-site-address-from-click' };
      }
      case 'activate-site-address-from-click': {
        if (state.activeTool === 'site-address-click') {
          return { ...state, activeTool: null };
        }

        return { ...state, activeTool: 'site-address-click' };
      }
      case 'address-clicked': {
        const coordinates = `${Math.round(action.payload.geometry.x)}, ${Math.round(action.payload.geometry.y)}`;
        setValue('address', coordinates);
        isDirty.current = true;
        setPointGraphic(action.payload);

        if (mapView.current.scale > 10489.34) {
          mapView.current.goTo(new Viewpoint({ targetGeometry: action.payload.geometry, scale: 10480 }));
        }

        return { ...state, address: coordinates, formStatus: 'allow-site-boundary-from-click' };
      }
      case 'select-site-from-parcel': {
        if (state.activeTool === 'selecting-a-parcel') {
          return { ...state, activeTool: null };
        }

        return { ...state, activeTool: 'selecting-a-parcel' };
      }
      case 'draw-site-boundary': {
        if (state.activeTool === 'freehand-polygon-drawing') {
          return { ...state, activeTool: null };
        }

        return { ...state, activeTool: 'freehand-polygon-drawing' };
      }
      case 'set-site-boundary': {
        if (!action.payload) {
          setValue('geometry', null);
          setPolygonGraphic(null);

          return { ...state, geometry: null };
        }

        const geometry = JSON.stringify(action.payload.geometry.toJSON());
        setValue('geometry', geometry);
        isDirty.current = true;

        setPolygonGraphic(action.payload);

        return {
          ...state,
          geometry: geometry,
          activeTool: action.meta === 'freehand-polygon-drawing' ? null : state.activeTool,
        };
      }
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, {
    address: undefined,
    geometry: undefined,
    activeTool: undefined,
    formStatus: undefined,
  });

  // hydrate form with existing data
  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    dispatch({
      type: 'initial-load',
      payload: {
        geometry: data?.geometry,
        address: data?.address,
      },
    });
  }, [data, status]);

  // activate point clicking for selecting an address
  useEffect(() => {
    // if the tool was changed clear existing events
    if (state.activeTool !== 'site-address-click') {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;

      return;
    }

    mapView.current.focus();

    // enable clicking on the map to set the address
    pointAddressClickEvent.current = mapView.current.on('immediate-click', (event) => {
      const graphic = new Graphic({
        geometry: event.mapPoint,
        attributes: {},
        symbol: PinSymbol,
      });

      dispatch({ type: 'address-clicked', payload: graphic });
    });

    return () => {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    };
  }, [state.activeTool]);

  // activate parcel hit test clicking
  useEffect(() => {
    // clean up events when disabled
    if (state.activeTool !== 'selecting-a-parcel') {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;

      return;
    }

    mapView.current.focus();

    parcelClickEvent.current = mapView.current.on('click', (event) => {
      //! stop popup from displaying
      event.preventDefault();

      const parcelLayerIndex = mapView.current.map.layers.items[0];

      mapView.current
        .hitTest(event, {
          include: parcelLayerIndex,
        })
        .then((test) => {
          if (test.results.length < 1) {
            return dispatch({ type: 'set-site-boundary', payload: null, meta: 'selecting-a-parcel' });
          }

          const graphic = test.results[0].graphic;
          graphic.symbol = PolygonSymbol;

          dispatch({ type: 'set-site-boundary', payload: graphic, meta: 'selecting-a-parcel' });
        });
    });

    return () => {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;
    };
  }, [state.activeTool]);

  // activate polygon site drawing
  useEffect(() => {
    if (state.activeTool !== 'freehand-polygon-drawing') {
      for (let index = 0; index < siteDrawingEvents.current?.length; index++) {
        const event = siteDrawingEvents.current[index];

        event.remove();
      }

      siteDrawingEvents.current = null;

      return;
    }

    const [drawAction, drawingEvent] = enablePolygonDrawing(mapView.current, setPolygonGraphic);

    const finishEvent = drawAction.on(['draw-complete'], (event) => {
      dispatch({
        type: 'set-site-boundary',
        payload: new Graphic({
          geometry: new Polygon({
            type: 'polygon',
            rings: event.vertices,
            spatialReference: mapView.current.spatialReference,
          }),
          symbol: PolygonSymbol,
        }),
        meta: 'freehand-polygon-drawing',
      });
    });

    siteDrawingEvents.current = [drawingEvent, finishEvent];
  }, [state.activeTool, setPolygonGraphic]);

  const geocode = (result) => {
    if (!result) {
      return geocodeError('No match found');
    }

    dispatch({ type: 'geocode-success', payload: result });
  };

  const geocodeError = () => dispatch({ type: 'skip-geocoding', payload: false });

  const addSiteLocation = (formData) => {
    if (!isDirty.current) {
      return navigate(1) || navigate(`/site/${siteId}/inventory/create`);
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
              <button data-meta="primary" onClick={() => dispatch({ type: 'skip-geocoding', payload: null })}>
                skip
              </button>{' '}
              this step.
            </p>
            <div
              className={clsx('ml-4 rounded border px-4 py-5 transition hover:opacity-100', {
                'opacity-25': state.formStatus === 'allow-site-address-from-click' || state.address,
              })}
            >
              <TailwindDartboard
                pointSymbol={PinSymbol}
                events={{ success: geocode, error: geocodeError }}
                apiKey={import.meta.env.VITE_API_KEY}
                format="esrijson"
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
                  <button
                    type="button"
                    data-meta="default"
                    className={clsx({ 'bg-blue-800': state.activeTool === 'site-address-click' })}
                    onClick={() => dispatch({ type: 'activate-site-address-from-click', payload: '' })}
                  >
                    <PointIcon classes="h-6 text-white fill-current" />
                  </button>
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
                      data-meta="default"
                      className={clsx({ 'bg-blue-800': state.activeTool === 'selecting-a-parcel' })}
                      onClick={() => dispatch({ type: 'select-site-from-parcel', payload: '' })}
                    >
                      <SelectPolygonIcon classes="h-6 text-white fill-current" />
                    </button>
                    <span className="block text-xs text-gray-500">Select Parcel</span>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    <button
                      type="button"
                      data-meta="default"
                      className={clsx({ 'bg-blue-800': state.activeTool === 'freehand-polygon-drawing' })}
                      onClick={() => dispatch({ type: 'draw-site-boundary', payload: '' })}
                    >
                      <PolygonIcon classes="h-6 text-white fill-current" />
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
                        <button type="submit" disabled={!state.formStatus === 'complete'}>
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

export default AddSiteLocation;
