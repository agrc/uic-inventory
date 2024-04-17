import CIMSymbol from '@arcgis/core/symbols/CIMSymbol';

export const PinSymbol = new CIMSymbol({
  data: {
    type: 'CIMSymbolReference',
    symbol: {
      type: 'CIMPointSymbol',
      symbolLayers: [
        {
          type: 'CIMVectorMarker',
          enable: true,
          anchorPoint: {
            x: 0,
            y: -2.296875,
          },
          anchorPointUnits: 'Relative',
          dominantSizeAxis3D: 'Y',
          size: 6,
          billboardMode3D: 'FaceNearPlane',
          frame: {
            xmin: -5,
            ymin: -5,
            xmax: 5,
            ymax: 5,
          },
          markerGraphics: [
            {
              type: 'CIMMarkerGraphic',
              geometry: {
                rings: [
                  [
                    [0, 5],
                    [0.87, 4.92],
                    [1.71, 4.7],
                    [2.5, 4.33],
                    [3.21, 3.83],
                    [3.83, 3.21],
                    [4.33, 2.5],
                    [4.7, 1.71],
                    [4.92, 0.87],
                    [5, 0],
                    [4.92, -0.87],
                    [4.7, -1.71],
                    [4.33, -2.5],
                    [3.83, -3.21],
                    [3.21, -3.83],
                    [2.5, -4.33],
                    [1.71, -4.7],
                    [0.87, -4.92],
                    [0, -5],
                    [-0.87, -4.92],
                    [-1.71, -4.7],
                    [-2.5, -4.33],
                    [-3.21, -3.83],
                    [-3.83, -3.21],
                    [-4.33, -2.5],
                    [-4.7, -1.71],
                    [-4.92, -0.87],
                    [-5, 0],
                    [-4.92, 0.87],
                    [-4.7, 1.71],
                    [-4.33, 2.5],
                    [-3.83, 3.21],
                    [-3.21, 3.83],
                    [-2.5, 4.33],
                    [-1.71, 4.7],
                    [-0.87, 4.92],
                    [0, 5],
                  ],
                ],
              },
              symbol: {
                type: 'CIMPolygonSymbol',
                symbolLayers: [
                  {
                    type: 'CIMSolidStroke',
                    enable: true,
                    capStyle: 'Round',
                    joinStyle: 'Round',
                    lineStyle3D: 'Strip',
                    miterLimit: 10,
                    width: 2,
                    color: [251, 191, 36, 255],
                    primitiveName: 'selected-stroke',
                  },
                  {
                    primitiveName: 'selected',
                    type: 'CIMSolidFill',
                    enable: true,
                    color: [255, 255, 255, 255],
                  },
                ],
              },
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
        {
          type: 'CIMVectorMarker',
          enable: true,
          anchorPoint: {
            x: 0,
            y: -0.5,
          },
          anchorPointUnits: 'Relative',
          dominantSizeAxis3D: 'Y',
          size: 18.5,
          billboardMode3D: 'FaceNearPlane',
          frame: {
            xmin: 0,
            ymin: 0,
            xmax: 21,
            ymax: 21,
          },
          markerGraphics: [
            {
              type: 'CIMMarkerGraphic',
              geometry: {
                rings: [
                  [
                    [16.06, 5.58],
                    [10.5, 0],
                    [4.94, 5.58],
                    [4.94, 16.73],
                    [5.03, 17.69],
                    [5.3, 18.54],
                    [5.75, 19.27],
                    [6.37, 19.88],
                    [7.17, 20.37],
                    [8.14, 20.72],
                    [9.25, 20.93],
                    [10.5, 21],
                    [11.75, 20.93],
                    [12.86, 20.72],
                    [13.83, 20.37],
                    [14.63, 19.88],
                    [15.25, 19.27],
                    [15.7, 18.54],
                    [15.97, 17.69],
                    [16.06, 16.73],
                    [16.06, 5.58],
                  ],
                ],
              },
              symbol: {
                type: 'CIMPolygonSymbol',
                symbolLayers: [
                  {
                    type: 'CIMSolidStroke',
                    enable: true,
                    capStyle: 'Round',
                    joinStyle: 'Round',
                    lineStyle3D: 'Strip',
                    miterLimit: 10,
                    width: 1,
                    color: [251, 251, 251, 128],
                  },
                  {
                    primitiveName: 'complete',
                    type: 'CIMSolidFill',
                    enable: true,
                    color: [31, 41, 55, 255],
                  },
                ],
              },
            },
          ],
          scaleSymbolsProportionally: true,
          respectFrame: true,
        },
      ],
      haloSize: 1,
      scaleX: 1,
      angleAlignment: 'Display',
      version: '2.0.0',
      build: '8933',
    },
    primitiveOverrides: [
      {
        type: 'CIMPrimitiveOverride',
        primitiveName: 'complete',
        propertyName: 'Color',
        valueExpressionInfo: {
          type: 'CIMExpressionInfo',
          title: 'Color of pin based on completeness',
          expression:
            'iif(hasKey($feature, "complete") && $feature.complete, "rgba(31, 41, 55, 0.25)", "rgba(31, 41, 55, 1)");',
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
          expression:
            'iif(hasKey($feature, "selected") && $feature.selected, "rgba(147, 197, 253, 1)", "rgba(251, 251, 251, 1)");',
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
          expression:
            'iif(hasKey($feature, "selected") && $feature.selected, "rgba(255, 255, 255, 1)", "rgba(251, 191, 36, 1)");',
          returnType: 'Default',
        },
      },
    ],
  },
});

export const IncompletePolygonSymbol = {
  type: 'simple-fill',
  color: [255, 255, 255, 0.5],
  style: 'diagonal-cross',
  outline: {
    style: 'short-dash',
    cap: 'square',
    join: 'round',
    color: [31, 41, 55, 1],
    width: 1,
  },
};

export const PolygonSymbol = {
  type: 'simple-fill',
  color: [88, 89, 91, 0.25],
  style: 'diagonal-cross',
  outline: {
    style: 'solid',
    cap: 'square',
    join: 'round',
    color: [67, 56, 202, 1],
    width: 2,
  },
};

export const InvalidPolygonSegmentSymbol = {
  type: 'simple-line',
  style: 'dash',
  cap: 'square',
  join: 'round',
  width: 3,
  color: [220, 38, 38, 1],
};
