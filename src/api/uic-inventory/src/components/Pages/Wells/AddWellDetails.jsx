import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import clsx from 'clsx';
import ky from 'ky';
import { useContext, useEffect, useRef } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useImmerReducer } from 'use-immer';
import { AuthContext } from '../../../AuthProvider';
import { GridHeading, Label, LimitedDropzone, LimitedTextarea, WellDetailSchema as schema } from '../../FormElements';
import { useInventoryWells, useSitePolygon, useWebMap } from '../../Hooks';
import { BackButton, Chrome, onRequestError, toast, useNavigate, useParams } from '../../PageElements';
import { getInventory } from '../loaders';

import '@arcgis/core/assets/esri/themes/light/main.css';

const reducer = (draft, action) => {
  switch (action.type) {
    case 'set-wells': {
      draft.wellsRemaining = action.payload?.filter((x) => !x.attributes.complete).length ?? 0;

      break;
    }
    case 'well-clicked': {
      if (draft.selectedWells.includes(action.payload)) {
        draft.selectedWells.splice(draft.selectedWells.indexOf(action.payload), 1);
      } else {
        draft.selectedWells.push(action.payload);
      }

      break;
    }
    case 'reset': {
      draft.selectedWells = [];

      break;
    }
  }
};

export function Component() {
  const { authInfo } = useContext(AuthContext);

  const navigate = useNavigate();
  const { siteId, inventoryId } = useParams();

  const [state, dispatch] = useImmerReducer(reducer, {
    graphics: [],
    selectedWells: [],
    wellsRemaining: 0,
  });

  const mapDiv = useRef(null);
  const pointAddressClickEvent = useRef(null);

  const queryClient = useQueryClient();
  const queryKey = ['site', siteId, 'inventory', inventoryId];
  // get site and inventory data
  const { status, data } = useQuery(getInventory(siteId, inventoryId));

  const { control, formState, handleSubmit, reset, setValue, getValues } = useForm({
    resolver: yupResolver(schema),
    context: { subClass: data?.subClass },
  });

  const { isSubmitSuccessful } = formState;
  // update wells
  const { mutate } = useMutation({
    mutationFn: (body) => ky.put('/api/well', { body, timeout: 600000 }),
    onSuccess: () => {
      toast.success('Wells updated successfully!');
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => onRequestError(error, 'We had some trouble updating your wells.'),
  });

  const { append, remove } = useFieldArray({ control, name: 'selectedWells', keyName: 'key' });

  const { mapView } = useWebMap(mapDiv, '80c26c2104694bbab7408a4db4ed3382');
  useSitePolygon(mapView, data?.site);
  // manage graphics
  const wellGraphics = useInventoryWells(mapView, data?.wells, { includeComplete: true });

  // update state with site wells
  useEffect(() => {
    if (status !== 'success') {
      return;
    }

    dispatch({ type: 'set-wells', payload: wellGraphics });
  }, [status, wellGraphics, dispatch]);

  // select well graphics
  useEffect(() => {
    const options = {
      include: wellGraphics,
    };

    pointAddressClickEvent.current = mapView.current.on('immediate-click', (event) => {
      mapView.current.hitTest(event, options).then(({ results }) => {
        if (!results.length) {
          return;
        }

        const id = results[0].graphic.attributes.id;
        dispatch({ type: 'well-clicked', payload: id });
      });
    });

    return () => {
      pointAddressClickEvent.current?.remove();
      pointAddressClickEvent.current = null;
    };
  }, [wellGraphics, mapView, dispatch]);

  // update form with selected wells
  useEffect(() => {
    mapView.current.graphics.items.forEach((graphic) => {
      if (state.selectedWells.includes(graphic.attributes.id)) {
        graphic.setAttribute('selected', true);
        append({ ...graphic.attributes, key: graphic.attributes.id });
      } else {
        graphic.setAttribute('selected', false);
        remove(graphic.attributes.id);
      }
    });
  }, [state.selectedWells, append, remove, mapView]);

  // form reset after submission
  useEffect(() => {
    if (isSubmitSuccessful) {
      dispatch({ type: 'reset' });
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
  }, [isSubmitSuccessful, remove, reset, dispatch]);

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
            <div className="text-2xl lg:mt-32">
              <div className="relative px-2 py-3 text-center">
                <div className="mb-6 font-medium text-gray-700">Wells remaining without details</div>
                <div
                  className={clsx(
                    {
                      'text-red-700': state.wellsRemaining !== 0,
                      'text-emerald-500': state.wellsRemaining === 0,
                    },
                    'inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-gray-200 text-5xl font-extrabold',
                  )}
                >
                  {state.wellsRemaining}
                </div>
              </div>
            </div>
          </GridHeading>
          <div className="md:col-span-2 md:mt-0">
            <form onSubmit={handleSubmit(updateWells)}>
              <div className="overflow-hidden shadow sm:rounded-md">
                <div className="bg-white">
                  <div className="grid grid-cols-6">
                    <div className="col-span-6">
                      <div className="h-96 w-full border-b-2 border-gray-50" ref={mapDiv}></div>
                      <section className="flex flex-col gap-2 px-4 py-5">
                        <span
                          className={clsx(
                            {
                              'text-red-700': state.selectedWells?.length < 1,
                              'text-emerald-500': state.selectedWells?.length > 0,
                            },
                            'text-2xl font-extrabold',
                          )}
                        >
                          {state.selectedWells?.length ?? 0} wells selected
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
                                getValues,
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
                              helpText="Name the fluids that will be entering the well, e.g. storm water runoff from parking area, car wash wastewater, etc."
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
                                getValues,
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
                <div className="flex justify-around bg-gray-100 px-4 py-3 text-right sm:px-6">
                  <BackButton />
                  <button type="submit" data-style="secondary" disabled={(state.selectedWells?.length ?? 0) === 0}>
                    Update
                  </button>
                  <button
                    type="button"
                    data-style="primary"
                    onClick={() => navigate(`/site/${siteId}/inventory/${inventoryId}/submit`)}
                    disabled={state.wellsRemaining > 0}
                  >
                    Next
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Chrome>
    </main>
  );
}
