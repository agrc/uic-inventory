import Graphic from '@arcgis/core/Graphic';
import Point from '@arcgis/core/geometry/Point';
import Polygon from '@arcgis/core/geometry/Polygon';
import { useEffect } from 'react';
import { useGraphicManager, useViewPointZooming } from '.';
import { PinSymbol, PolygonSymbol } from '../MapElements/MarkerSymbols';

export function useSitePolygon(mapView, site) {
  const { graphic, setGraphic } = useGraphicManager(mapView);
  const { setViewPoint } = useViewPointZooming(mapView);

  useEffect(() => {
    if (graphic || !site?.geometry) {
      return;
    }

    const shape = JSON.parse(site.geometry);
    const geometry = new Polygon({
      type: 'polygon',
      rings: shape.rings,
      spatialReference: shape.spatialReference,
    });

    setGraphic(
      new Graphic({
        geometry: geometry,
        attributes: {},
        symbol: PolygonSymbol,
      }),
    );

    setViewPoint(geometry.extent.expand(3));
  }, [site, graphic, setGraphic, setViewPoint]);

  return () => {
    setGraphic(null);
  };
}

export function useInventoryWells(mapView, wells, { includeComplete }) {
  const { graphic, setGraphic } = useGraphicManager(mapView);
  const { setViewPoint } = useViewPointZooming(mapView);

  useEffect(() => {
    const graphics = wells?.map(
      (well) =>
        new Graphic({
          geometry: new Point(JSON.parse(well.geometry)),
          attributes: { id: well.id, selected: false, complete: includeComplete ? well.wellDetailsComplete : false },
          symbol: PinSymbol,
        }),
    );

    setGraphic(graphics);
  }, [wells, setGraphic, setViewPoint, includeComplete]);

  return graphic;
}
