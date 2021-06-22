import '@arcgis/core/assets/esri/themes/light/main.css';
import { Chrome, PolygonIcon, OkNotToggle, PointIcon, SelectPolygonIcon } from '../../PageElements';
import { GridHeading, Label, SiteLocationSchema as schema } from '../../FormElements';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import MapView from '@arcgis/core/views/MapView';
import WebMap from '@arcgis/core/WebMap';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Viewpoint from '@arcgis/core/Viewpoint';
import { TailwindDartboard } from '../../Dartboard/Dartboard';
import { useRef, useState, useEffect } from 'react';
import clsx from 'clsx';
import { PinSymbol, PolygonSymbol } from '../../MapElements/MarkerSymbols';
import { enablePolygonDrawing } from '../../MapElements/Drawing';

function AddSiteLocation() {
  const mapDiv = useRef(null);
  const webMap = useRef(null);
  const mapView = useRef(null);
  const pointAddressClickEvent = useRef(null);
  const parcelClickEvent = useRef(null);
  const siteDrawingEvents = useRef(null);
  const [viewPoint, setViewPoint] = useState(null);
  const [graphic, setGraphic] = useState(null);
  const [geocodeSuccess, setGeocodeSuccess] = useState(undefined);
  const [address, setAddress] = useState(false);
  const [siteGeometry, setSiteGeometry] = useState(false);
  const [pointAddressClickEnabled, setPointAddressClickEnabled] = useState(false);
  const [parcelClickEnabled, setParcelClickEnabled] = useState(false);
  const [siteDrawingEnabled, setSiteDrawingEnabled] = useState(false);
  const { handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  // set up map effect
  useEffect(() => {
    if (mapDiv.current) {
      webMap.current = new WebMap({
        portalItem: {
          id: '80c26c2104694bbab7408a4db4ed3382',
        },
      });

      mapView.current = new MapView({
        container: mapDiv.current,
        map: webMap.current,
      });
    }

    return () => {
      mapView.current.destroy();
      webMap.current.destroy();
    };
  }, []);

  // zoom map on geocode
  useEffect(() => {
    if (viewPoint) {
      mapView.current.goTo(viewPoint).catch(console.error);
    }
  }, [viewPoint]);

  // manage graphics
  useEffect(() => {
    mapView.current.graphics.removeAll();
    mapView.current.graphics.add(graphic);
  }, [graphic]);

  // activate point clicking for selecting an address
  useEffect(() => {
    // if geocoding was successful then skip choosing the address by a point method
    if (geocodeSuccess) {
      return setPointAddressClickEnabled(false);
    }

    // if the event was disabled clear any existing events
    if (!pointAddressClickEnabled) {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;

      mapView.current.graphics.removeAll();

      return;
    }

    setParcelClickEnabled(false);
    setSiteDrawingEnabled(false);

    mapView.current.focus();

    // enable clicking on the map to set the address
    pointAddressClickEvent.current = mapView.current.on('immediate-click', (event) => {
      setGraphic(
        new Graphic({
          geometry: event.mapPoint,
          attributes: {},
          symbol: PinSymbol,
        })
      );

      setValue('address', `${Math.round(event.mapPoint.x)}, ${Math.round(event.mapPoint.y)}`);
      setAddress(true);

      if (mapView.current.scale > 10489.34) {
        mapView.current.goTo(new Viewpoint({ targetGeometry: event.mapPoint, scale: 10480 }));
      }
    });

    return () => {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    };
  }, [geocodeSuccess, pointAddressClickEnabled, setValue]);

  // activate parcel hit test clicking
  useEffect(() => {
    // clean up events when disabled
    if (!parcelClickEnabled) {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;

      setGraphic(null);

      setValue('geometry', null);
      setSiteGeometry(false);

      return;
    }

    // trigger other effects to clean up their events
    setPointAddressClickEnabled(false);
    setSiteDrawingEnabled(false);

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
            return setGraphic(null);
          }

          const parcelGraphic = test.results[0].graphic;
          parcelGraphic.symbol = PolygonSymbol;

          setGraphic(parcelGraphic);
          setValue('geometry', JSON.stringify(parcelGraphic.geometry.toJSON()));
          setSiteGeometry(true);
        });
    });

    return () => {
      parcelClickEvent.current?.remove();
      parcelClickEvent.current = null;
    };
  }, [parcelClickEnabled, pointAddressClickEnabled, setValue]);

  // activate polygon site drawing
  useEffect(() => {
    if (!siteDrawingEnabled || siteDrawingEnabled === 'complete') {
      for (let index = 0; index < siteDrawingEvents.current?.length; index++) {
        const event = siteDrawingEvents.current[index];

        event.remove();
      }

      siteDrawingEvents.current = null;

      if (siteDrawingEnabled !== 'complete') {
        mapView.current.graphics.removeAll();

        setValue('geometry', null);
        setSiteGeometry(false);
      }

      return;
    }

    setPointAddressClickEnabled(false);
    setParcelClickEnabled(false);

    const [drawAction, drawingEvent] = enablePolygonDrawing(mapView.current);

    const finishEvent = drawAction.on(['draw-complete'], (event) => {
      setSiteDrawingEnabled('complete');

      setValue(
        'geometry',
        JSON.stringify(
          new Polygon({
            type: 'polygon',
            rings: event.vertices,
            spatialReference: mapView.current.spatialReference,
          }).toJSON()
        )
      );

      setSiteGeometry(true);
    });

    siteDrawingEvents.current = [drawingEvent, finishEvent];

    // return () => {
    //   for (let index = 0; index < siteDrawingEvents.current?.length; index++) {
    //     const event = siteDrawingEvents.current[index];

    //     event.remove();
    //   }

    //   siteDrawingEvents.current = null;
    // };
  }, [siteDrawingEnabled, setValue]);

  const geocode = (result) => {
    if (!result) {
      return geocodeError('No match found');
    }

    setGeocodeSuccess(true);
    setValue('address', result.attributes.InputAddress);
    setAddress(true);

    setGraphic(new Graphic(result));
    setViewPoint(new Viewpoint({ targetGeometry: result.geometry, scale: 1500 }));
  };

  const geocodeError = () => {
    mapView.current.graphics.remove(graphic);

    setGeocodeSuccess(false);
    setViewPoint(null);
    mapView.current.graphics.removeAll();

    setValue('address', null);
    setAddress(false);
  };

  return (
    <main>
      <Chrome>
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <GridHeading text="Site Location" subtext="Set the address and polygon for your site">
            <p className="mb-3">First, find your site location by it's address.</p>
            <div
              className={clsx('px-4 py-5 ml-4 border rounded transition hover:opacity-100', {
                'opacity-25': address,
              })}
            >
              <TailwindDartboard
                pointSymbol={PinSymbol}
                events={{ success: geocode, error: geocodeError }}
                apiKey={import.meta.env.VITE_API_KEY}
                format="esrijson"
              />
            </div>
            {geocodeSuccess === undefined || geocodeSuccess === true ? null : (
              <>
                <p className="my-3">
                  The site address was not found, select a point for the site instead with the tool below.
                </p>
                <div
                  className={clsx('px-4 py-5 ml-4 border flex justify-center rounded transition hover:opacity-100', {
                    'opacity-25': parcelClickEnabled || siteDrawingEnabled,
                  })}
                >
                  <button
                    type="button"
                    className={clsx({ 'bg-blue-800': pointAddressClickEnabled })}
                    onClick={() => setPointAddressClickEnabled(!pointAddressClickEnabled)}
                  >
                    <PointIcon classes="h-6 text-white fill-current" />
                  </button>
                </div>
              </>
            )}
            {geocodeSuccess || address ? (
              <>
                <p className="my-3">
                  Next, select a parcel as the site polygon or draw the site polygon if the parcel cannot be used.
                </p>
                <div className="flex justify-around px-4 py-5 ml-4 border rounded">
                  <button
                    type="button"
                    className={clsx({ 'bg-blue-800': parcelClickEnabled })}
                    onClick={() => setParcelClickEnabled(!parcelClickEnabled)}
                  >
                    <SelectPolygonIcon classes="h-6 text-white fill-current" />
                  </button>
                  <button
                    type="button"
                    className={clsx({ 'bg-blue-800': siteDrawingEnabled })}
                    onClick={() => setSiteDrawingEnabled(!siteDrawingEnabled)}
                  >
                    <PolygonIcon classes="h-6 text-white fill-current" />
                  </button>
                </div>
              </>
            ) : null}
          </GridHeading>
          <div className="md:mt-0 md:col-span-2">
            <div className="mt-6 overflow-hidden shadow sm:rounded-md">
              <div className="bg-white">
                <div className="grid grid-cols-6">
                  <div className="col-span-6">
                    <div className="w-full h-96" ref={mapDiv}></div>
                    <form className="border-t-2 border-gray-50" onSubmit={handleSubmit((data) => console.log(data))}>
                      <div className="px-4 py-3">
                        <div className="flex justify-around">
                          <div className="flex flex-col justify-items-center">
                            <Label id="address" />
                            <OkNotToggle classes="h-12" status={address} />
                          </div>
                          <div className="flex flex-col justify-items-center">
                            <Label id="site" text="Site Location" />
                            <OkNotToggle classes="h-12" status={siteGeometry} />
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                        <button type="submit" disabled={!(address && siteGeometry)}>
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
