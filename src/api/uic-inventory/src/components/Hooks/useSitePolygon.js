import { useEffect } from 'react';
import Graphic from '@arcgis/core/Graphic';
import Polygon from '@arcgis/core/geometry/Polygon';
import Point from '@arcgis/core/geometry/Point';
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
      })
    );

    setViewPoint(geometry.extent.expand(3));
  }, [site, graphic, setGraphic, setViewPoint]);

  return () => {
    setGraphic(null);
  };
}

export function useInventoryWells(mapView, wells) {
  const { graphic, setGraphic } = useGraphicManager(mapView);
  const { setViewPoint } = useViewPointZooming(mapView);

  useEffect(() => {
    if (graphic || !wells) {
      return;
    }

    const graphics = wells.map(
      (well) =>
        new Graphic({
          geometry: new Point(JSON.parse(well.geometry)),
          attributes: { id: well.id },
          symbol: PinSymbol,
        })
    );

    setGraphic(graphics);
  }, [wells, graphic, setGraphic, setViewPoint]);

  return () => {
    setGraphic(null);
  };
}
