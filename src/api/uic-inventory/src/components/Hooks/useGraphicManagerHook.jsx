import { useEffect, useRef, useState } from 'react';

export function useGraphicManager(mapView) {
  const [graphic, setGraphic] = useState();
  const previousGraphic = useRef();

  useEffect(() => {
    if (previousGraphic.current) {
      if (Array.isArray(previousGraphic.current)) {
        previousGraphic.current.forEach((x) => mapView.current.graphics.remove(x));
      } else {
        mapView.current.graphics.remove(previousGraphic.current);
      }
    }

    if (graphic) {
      previousGraphic.current = graphic;
    }

    if (Array.isArray(graphic)) {
      return mapView.current.graphics.addMany(graphic);
    }

    mapView.current.graphics.add(graphic);
  }, [graphic, mapView]);

  return { graphic, setGraphic };
}
