import ky from "ky";
import * as geometryEngine from "@arcgis/core/geometry/geometryEngine.js";

import Polygon from "@arcgis/core/geometry/Polygon.js";
import Point from "@arcgis/core/geometry/Point.js";

const headers = {
  Referer: "https://www.arcgis.com/apps/mapviewer/index.html?webmap=80c26c2104694bbab7408a4db4ed3382",
};
const timeout = 60000;

export const getPrintMapImageAsync = async (site, wells = []) => {
  const body = new URLSearchParams();
  const outputSize = [850, 1200];

  body.append(
    "Web_Map_as_JSON",
    JSON.stringify({
      operationalLayers: [
        {
          type: "wmts",
          customLayerParameters: null,
          customParameters: null,
          format: "image/png",
          layer: "terrain_basemap",
          style: "default",
          tileMatrixSet: "0to19",
          url: "https://discover.agrc.utah.gov/login/path/sector-snake-paradox-reply/wmts",
          id: "WebTiled_9936",
          title: "Utah Terrain Basemap (WMTS)",
          opacity: 1,
          minScale: 591658710.9094299,
          maxScale: 1128.4994333389607,
        },
        {
          id: "179a0f89200-layer-1",
          title: "Utah Statewide Parcels",
          opacity: 1,
          minScale: 10489.342087,
          maxScale: 0,
          url: "https://services1.arcgis.com/99lidPhWCzftIe9K/arcgis/rest/services/UtahStatewideParcels/FeatureServer/0",
          layerType: "ArcGISFeatureLayer",
          layerDefinition: {
            definitionExpression: "",
            drawingInfo: {
              labelingInfo: [
                {
                  labelExpression: "[PARCEL_ID]",
                  labelExpressionInfo: {
                    expression: '$feature["PARCEL_ID"]',
                  },
                  labelPlacement: "esriServerPolygonPlacementAlwaysHorizontal",
                  labelPosition: "curved",
                  maxScale: 0,
                  minScale: 1392.060877,
                  repeatLabel: true,
                  symbol: {
                    type: "esriTS",
                    color: [105, 105, 105, 255],
                    font: {
                      family: "Arial",
                      size: 9.75,
                    },
                    horizontalAlignment: "center",
                    kerning: true,
                    haloColor: [211, 211, 211, 255],
                    haloSize: 1,
                    rotated: false,
                    text: "",
                    verticalAlignment: "baseline",
                    xoffset: 0,
                    yoffset: 0,
                    angle: 0,
                  },
                },
              ],
              renderer: {
                type: "simple",
                symbol: {
                  type: "esriSFS",
                  color: null,
                  outline: {
                    type: "esriSLS",
                    color: [224, 59, 153, 217],
                    width: 0.93,
                    style: "esriSLSSolid",
                  },
                  style: "esriSFSSolid",
                },
              },
            },
          },
          showLabels: true,
        },
        {
          featureCollection: {
            layers: [
              {
                layerDefinition: {
                  name: "Sites",
                  geometryType: "esriGeometryPolygon",
                },
                featureSet: {
                  geometryType: "esriGeometryPolygon",
                  features: [site],
                },
              },
            ],
          },
          id: "Sites",
          title: "Sites",
          opacity: 1,
          minScale: 0,
          maxScale: 0,
        },
        {
          featureCollection: {
            layers: [
              {
                layerDefinition: {
                  name: "Wells",
                  geometryType: "esriGeometryPoint",
                },
                featureSet: {
                  geometryType: "esriGeometryPoint",
                  features: wells,
                },
              },
            ],
          },
          id: "Wells",
          title: "Wells",
          opacity: 1,
          minScale: 0,
          maxScale: 0,
        },
      ],
      mapOptions: {
        extent: getExtent([
          new Polygon({
            type: "polygon",
            ...site.geometry,
          }),
          ...wells.map(
            (well) =>
              new Point({
                type: "point",
                ...well.geometry,
              }),
          ),
        ]),
        spatialReference: {
          wkid: 102100,
        },
        showAttribution: true,
      },
      exportOptions: {
        dpi: 96,
        outputSize,
      },
      layoutOptions: {
        titleText: "UIC Inventory",
        authorText: "",
        copyrightText: "",
        customTextElements: [],
        scaleBarOptions: {
          metricUnit: null,
          nonMetricUnit: null,
        },
        legendOptions: {
          operationalLayers: [],
        },
      },
    }),
  );
  body.append("Format", "JPG");
  body.append("Layout_Template", "MAP_ONLY");
  body.append("f", "json");

  console.log("map request started");

  const printJob = await ky
    .post(
      "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task/execute",
      { headers, body, timeout },
    )
    .json();

  const imageUrl = printJob.results[0].value.url;

  console.log("image location", imageUrl);

  const image = await ky(imageUrl, {
    headers,
  }).arrayBuffer();

  return `data:image/jpeg;base64,${Buffer.from(image).toString("base64")}`;
};

const getExtent = (geometries) => {
  const [hull] = geometryEngine.convexHull(geometries, true);
  const extent = hull.extent;
  const area = extent.width + extent.height / 2;
  let factor = 2;

  if (area < 100) {
    factor = 5;
  } else if (area < 1000) {
    factor = 4;
  } else if (area < 10000) {
    factor = 3;
  }

  return extent.expand(factor);
};
