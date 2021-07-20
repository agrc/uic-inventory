import { useEffect, useState } from 'react';

export function useViewPointZooming(mapView) {
  const [viewPoint, setViewPoint] = useState(null);

  useEffect(() => {
    if (viewPoint) {
      mapView.current.goTo(viewPoint).catch(console.error);
    }
  }, [viewPoint, mapView]);

  return { viewPoint, setViewPoint };
}
