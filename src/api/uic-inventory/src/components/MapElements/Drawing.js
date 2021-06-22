import { geodesicArea, geodesicLength, crosses } from '@arcgis/core/geometry/geometryEngine';
import Graphic from '@arcgis/core/Graphic';
import { PolygonSymbol, IncompletePolygonSymbol, InvalidPolygonSegmentSymbol } from './MarkerSymbols';
import Draw from '@arcgis/core/views/draw/Draw';

const roundedNumbers = new Intl.NumberFormat({
  maximumFractionDigits: 3,
});

export const enablePolygonDrawing = (view) => {
  const draw = new Draw({
    view: view,
  });

  const action = draw.create('polygon', { mode: 'click' });

  const event = action.on(['vertex-add', 'vertex-remove', 'cursor-update', 'redo', 'undo', 'draw-complete'], (event) =>
    drawPolygon(event, view)
  );

  view.focus();

  return [action, event];
};

const drawPolygon = (event, view) => {
  if (event.vertices.length < 1) {
    return;
  }

  const result = createGraphic(event, view);

  //! if the last vertex is making the line intersects itself,
  //! prevent the events from firing
  if (result.selfIntersects) {
    event.preventDefault();
  }
};

const createGraphic = (event, view) => {
  const rings = event.vertices;
  let symbol;

  switch (event.type) {
    case 'draw-complete': {
      symbol = PolygonSymbol;
      break;
    }
    default: {
      symbol = IncompletePolygonSymbol;
      break;
    }
  }

  const site = new Graphic({
    geometry: {
      type: 'polygon',
      rings,
      spatialReference: view.spatialReference,
    },
    symbol,
  });

  const intersectingSegment = getIntersectingSegment(site.geometry);

  view.graphics.removeAll();

  if (intersectingSegment) {
    site.symbol = IncompletePolygonSymbol;
    view.graphics.addMany([site, intersectingSegment]);
  } else {
    let text = '';

    if (site.geometry.type === 'polygon') {
      text = `${roundedNumbers.format(geodesicArea(site.geometry, 'acres'))} ac`;
    } else {
      text = `${roundedNumbers.format(geodesicLength(site.geometry, 'meters'))} m`;
    }

    view.graphics.addMany([
      site,
      new Graphic({
        geometry: site.geometry.centroid,
        symbol: {
          type: 'text',
          text,
          color: 'black',
          haloColor: 'white',
          haloSize: 1,
          font: {
            size: 16,
          },
        },
      }),
    ]);
  }

  return {
    selfIntersects: intersectingSegment,
  };
};

const isSelfIntersecting = (polygon) => {
  if (polygon.rings[0].length < 3) {
    return false;
  }

  const poly = polygon.clone();

  const lastSegment = getLastSegment(polygon);
  poly.removePoint(0, poly.rings[0].length - 1);

  return crosses(lastSegment, poly) || poly.isSelfIntersecting;
};

const getIntersectingSegment = (polygon) => {
  if (isSelfIntersecting(polygon)) {
    return new Graphic({
      geometry: getLastSegment(polygon),
      symbol: InvalidPolygonSegmentSymbol,
    });
  }

  return null;
};

const getLastSegment = (polygon) => {
  const poly = polygon.clone();
  const lastXYPoint = poly.removePoint(0, poly.rings[0].length - 1);
  const existingLineFinalPoint = poly.getPoint(0, poly.rings[0].length - 1);

  return {
    type: 'polyline',
    spatialReference: polygon.spatialReference,
    paths: [
      [
        [existingLineFinalPoint.x, existingLineFinalPoint.y],
        [lastXYPoint.x, lastXYPoint.y],
      ],
    ],
  };
};
