import { useContext, useEffect, useRef, useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useQuery, useQueryClient, useMutation } from 'react-query';
import ky from 'ky';
import { ErrorMessage } from '@hookform/error-message';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
import Viewpoint from '@arcgis/core/Viewpoint';
import { PinSymbol, PolygonSymbol } from '../../MapElements/MarkerSymbols';
import { Chrome, onRequestError, toast, useParams } from '../../PageElements';
import { GridHeading, LimitedTextarea, LimitedDropzone, Label, WellDetailSchema as schema } from '../../FormElements';
import { useWebMap, useViewPointZooming, useGraphicManager } from '../../Hooks';
import { AuthContext } from '../../../AuthProvider';
import ErrorMessageTag from '../../FormElements/ErrorMessage';

import '@arcgis/core/assets/esri/themes/light/main.css';

const empty = (val) => {
  return val === undefined || val === null || val === '';
};

const CompletedWellsSymbol = PinSymbol.clone();
CompletedWellsSymbol.data.primitiveOverrides = [
  {
    type: 'CIMPrimitiveOverride',
    primitiveName: 'complete',
    propertyName: 'Color',
    valueExpressionInfo: {
      type: 'CIMExpressionInfo',
      title: 'Color of pin based on completeness',
      expression: 'iif($feature.complete, [31, 41, 55, .25], [31, 41, 55, 1]);',
      returnType: 'Default',
    },
  },
  {
    type: 'CIMPrimitiveOverride',
    primitiveName: 'selected',
    propertyName: 'Color',
    valueExpressionInfo: {
      type: 'CIMExpressionInfo',
      title: 'Color of pin based on selected status',
      expression: 'iif($feature.selected, [147, 197, 253, 1], [251, 251, 251, 1]);',
      returnType: 'Default',
    },
  },
  {
    type: 'CIMPrimitiveOverride',
    primitiveName: 'selected-stroke',
    propertyName: 'Color',
    valueExpressionInfo: {
      type: 'CIMExpressionInfo',
      title: 'Color of pin based on selected status',
      expression: 'iif($feature.selected, [255, 255, 255, 1], [251, 191, 36, 1]);',
      returnType: 'Default',
    },
  },
];

function AddWellDetails() {
  const { authInfo } = useContext(AuthContext);
  const { siteId, inventoryId } = useParams();
  const queryClient = useQueryClient();
  const mapDiv = useRef(null);
  const pointAddressClickEvent = useRef(null);
  const hoverEvent = useRef(null);
  const [selectedWells, setSelectedWells] = useState([]);
  const [wellsRemaining, setWellsRemaining] = useState(0);

  // get site and inventory data
  const { status, data } = useQuery(
    ['inventory', inventoryId],
    () => ky.get(`/api/site/${siteId}/inventory/${inventoryId}`).json(),
    {
      enabled: siteId > 0,
      onError: (error) => onRequestError(error, 'We had some trouble finding your wells.'),
    }
  );

  const { control, formState, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(schema),
    context: { subClass: data?.subClass },
  });

  const { isSubmitSuccessful } = formState;
  // update wells
  const { mutate } = useMutation((body) => ky.put('/api/well', { body }), {
    onSuccess: () => {
      toast.success('Wells updated successfully!');
      queryClient.invalidateQueries(['inventory', inventoryId]);
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your wells.'),
  });

  const { append, remove } = useFieldArray({ control, name: 'selectedWells', keyName: 'key' });

  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  // zoom map on geocode
  const { setViewPoint } = useViewPointZooming(mapView);
  // manage graphics
  const { graphic, setGraphic: setPolygonGraphic } = useGraphicManager(mapView);
  const { graphic: wellGraphics, setGraphic: setExistingPointGraphics } = useGraphicManager(mapView);

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

    setViewPoint(new Viewpoint({ targetGeometry: geometry.centroid, scale: 1500 }));
  }, [data, graphic, setPolygonGraphic, setViewPoint, status]);

  // place site wells
  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    const wells = data.wells.map(
      (well) =>
        new Graphic({
          geometry: new Point(JSON.parse(well.geometry)),
          attributes: { id: well.id, complete: well.wellDetailsComplete, selected: false },
          symbol: CompletedWellsSymbol,
        })
    );

    setWellsRemaining(wells?.filter((x) => !x.attributes.complete).length || 0);

    setExistingPointGraphics(wells);
  }, [data, setExistingPointGraphics, status]);

  useEffect(() => {
    if (pointAddressClickEvent.current || hoverEvent.current) {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;

      return;
    }
    const opts = {
      include: wellGraphics,
    };

    pointAddressClickEvent.current = mapView.current.on('immediate-click', (event) => {
      mapView.current.hitTest(event, opts).then((response) => {
        if (!response.results.length) {
          return;
        }

        const graphic = response.results[0].graphic;
        const index = selectedWells.findIndex((item) => item.id === graphic.attributes.id);

        if (index > -1) {
          graphic.attributes.selected = false;
          graphic.symbol = CompletedWellsSymbol.clone();

          remove(index);
          selectedWells.splice(index, 1);
          setSelectedWells([...selectedWells]);

          return;
        }

        graphic.attributes.selected = true;
        graphic.symbol = CompletedWellsSymbol.clone();

        setSelectedWells([...selectedWells, graphic.attributes]);

        append({ ...graphic.attributes, key: graphic.attributes.id });
      });
    });

    return () => {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    };
  }, [wellGraphics, append, remove, selectedWells]);

  useEffect(() => {
    if (isSubmitSuccessful) {
      setSelectedWells([]);
      remove();
      reset({
        selectedWells: [],
        hydrogeologicCharacterization: '',
        constructionDetails: '',
        injectateCharacterization: '',

        constructionDetailsFile: '',
        injectateCharacterizationFile: '',
      });
    }
  }, [isSubmitSuccessful, remove, reset]);

  const updateWells = (submittedData) => {
    const formData = new FormData();

    formData.append('accountId', parseInt(authInfo.id));
    formData.append('inventoryId', parseInt(inventoryId));
    formData.append('siteId', parseInt(siteId));
    submittedData.selectedWells?.forEach((item) => formData.append('selectedWells[]', item.id));

    formData.append('hydrogeologicCharacterization', submittedData.hydrogeologicCharacterization || null);

    if (submittedData.constructionDetails?.path) {
      formData.append('constructionDetailsFile', submittedData.constructionDetails);
    } else {
      formData.append('constructionDetails', submittedData.constructionDetails || null);
    }
    if (submittedData.injectateCharacterization?.path) {
      formData.append('injectateCharacterizationFile', submittedData.injectateCharacterization);
    } else {
      formData.append('injectateCharacterization', submittedData.injectateCharacterization || null);
    }

    mutate(formData);
  };

  return (
    <main>
      <Chrome>
        <div className="grid gap-4 md:grid md:grid-cols-3 md:gap-5">
          <GridHeading
            text="Add Well Details"
            subtext="Select the wells on the map to which the following descriptions apply. You must have a description for all submitted wells. Upload existing plan(s) or provide a narrative description."
            site={data?.site}
          >
            <div className="text-2xl">
              <div className="flex justify-around">
                <div className="flex flex-col text-center justify-items-center">
                  <Label id="wellsRemaining" />
                  <span className="text-5xl font-extrabold text-red-700">{wellsRemaining}</span>
                </div>
              </div>
            </div>
          </GridHeading>
          <div className="md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit(updateWells)}>
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white">
                  <div className="grid grid-cols-6">
                    <div className="col-span-6">
                      <div className="w-full border-b-2 h-96 border-gray-50" ref={mapDiv}></div>
                      <section className="flex flex-col gap-2 px-4 py-5">
                        <span className="text-2xl font-extrabold">
                          {selectedWells?.length ?? 0} wells selected
                          <span className="text-base border-gray-100">
                            <ErrorMessage errors={formState.errors} name="selectedWells" as={ErrorMessageTag} />
                          </span>
                        </span>
                        <Controller
                          control={control}
                          name="constructionDetails"
                          render={({ field, fieldState, formState }) => (
                            <LimitedDropzone
                              textarea={{
                                id: 'constructionDetails',
                                limit: 2500,
                                rows: '5',
                                placeholder: 'Type your response or upload a file',
                              }}
                              forms={{
                                errors: formState.errors,
                                field,
                                reset,
                                fieldState,
                                setValue,
                                formState,
                              }}
                              file={{
                                id: 'constructionDetailsFile',
                              }}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="injectateCharacterization"
                          render={({ field, fieldState, formState }) => (
                            <LimitedDropzone
                              textarea={{
                                id: 'injectateCharacterization',
                                limit: 2500,
                                rows: '5',
                                placeholder: 'Type your response or upload a file',
                              }}
                              forms={{
                                errors: formState.errors,
                                field,
                                reset,
                                fieldState,
                                setValue,
                                formState,
                              }}
                              file={{
                                id: 'injectateCharacterizationFile',
                              }}
                            />
                          )}
                        />
                        <div className="md:col-span-2">
                          <Label id="hydrogeologicCharacterization" />
                          <Controller
                            control={control}
                            name="hydrogeologicCharacterization"
                            render={({ field }) => (
                              <LimitedTextarea rows="5" maxLength={2500} field={field} errors={formState.errors} />
                            )}
                          />
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 text-right bg-gray-100 sm:px-6">
                  <button type="submit">Update</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Chrome>
    </main>
  );
}

export default AddWellDetails;
