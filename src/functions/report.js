import { http } from "@google-cloud/functions-framework";
import { appendPdfPages, createPdfDocument, getBinaryPdfs } from "./pdfHelpers.js";
import { generateInventoryReportPdfDefinition } from "./inventoryPdf.js";
import { generateAuthorizationByRule, getMostImportantContact } from "./authorizationByRulePdf.js";
import { getPrintMapImageAsync } from "./printService.js";
import { Storage } from "@google-cloud/storage";

const storage = new Storage();
const bucket = storage.bucket(process.env.BUCKET);
const watermark = process.env.WATERMARK === "true";

const symbol = {
  type: "CIMSymbolReference",
  symbol: {
    type: "CIMPointSymbol",
    symbolLayers: [
      {
        type: "CIMVectorMarker",
        enable: true,
        anchorPoint: {
          x: 0,
          y: -2.296875,
        },
        anchorPointUnits: "Relative",
        dominantSizeAxis3D: "Y",
        size: 6,
        billboardMode3D: "FaceNearPlane",
        frame: {
          xmin: -5,
          ymin: -5,
          xmax: 5,
          ymax: 5,
        },
        markerGraphics: [
          {
            type: "CIMMarkerGraphic",
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
              type: "CIMPolygonSymbol",
              symbolLayers: [
                {
                  type: "CIMSolidStroke",
                  enable: true,
                  capStyle: "Round",
                  joinStyle: "Round",
                  lineStyle3D: "Strip",
                  miterLimit: 10,
                  width: 2,
                  color: [251, 191, 36, 255],
                  primitiveName: "selected-stroke",
                },
                {
                  primitiveName: "selected",
                  type: "CIMSolidFill",
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
        type: "CIMVectorMarker",
        enable: true,
        anchorPoint: {
          x: 0,
          y: -0.5,
        },
        anchorPointUnits: "Relative",
        dominantSizeAxis3D: "Y",
        size: 18.5,
        billboardMode3D: "FaceNearPlane",
        frame: {
          xmin: 0,
          ymin: 0,
          xmax: 21,
          ymax: 21,
        },
        markerGraphics: [
          {
            type: "CIMMarkerGraphic",
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
              type: "CIMPolygonSymbol",
              symbolLayers: [
                {
                  type: "CIMSolidStroke",
                  enable: true,
                  capStyle: "Round",
                  joinStyle: "Round",
                  lineStyle3D: "Strip",
                  miterLimit: 10,
                  width: 1,
                  color: [251, 251, 251, 128],
                },
                {
                  primitiveName: "complete",
                  type: "CIMSolidFill",
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
    angleAlignment: "Display",
    version: "2.0.0",
    build: "8933",
  },
  angle: 0,
  xoffset: 0,
  yoffset: 0,
  size: 20,
  style: "esriSMSCircle",
  outline: {
    type: "esriSLS",
    color: [251, 191, 36, 255],
    width: 2.5,
    style: "esriSLSSolid",
  },
};

http("generate", async (req, res) => {
  const { contacts, inventory, cloudFiles, approver } = req.body;

  if (!contacts || !inventory) {
    res.status(400).send("Missing required data");

    return;
  }

  const wellGraphics = inventory.wells.map((well) => {
    return {
      geometry: JSON.parse(well.geometry),
      attributes: {
        name: well.name,
      },
      symbol,
    };
  });

  const siteGraphic = {
    geometry: JSON.parse(inventory.site.geometry),
    attributes: {
      name: inventory.site.name,
    },
    symbol: {
      type: "esriSFS",
      color: [88, 89, 91, 64],
      outline: {
        type: "esriSLS",
        color: [67, 56, 202, 255],
        width: 2,
        style: "esriSLSSolid",
        cap: "square",
      },
      style: "esriSFSDiagonalCross",
    },
  };

  const [files, image] = await Promise.all([
    getBinaryPdfs(bucket, cloudFiles),
    getPrintMapImageAsync(siteGraphic, wellGraphics),
  ]);

  let abrPdf;
  let inventoryPdf;

  const definition = generateInventoryReportPdfDefinition(inventory, contacts, image, watermark);

  // 4 === Approved
  if (inventory.status >= 4) {
    console.debug("creating abr pdf", inventory.subClass);

    const abrDefinition = generateAuthorizationByRule(
      inventory,
      getMostImportantContact(contacts),
      approver,
      watermark,
    );

    abrPdf = await createPdfDocument(abrDefinition);

    console.debug("abr finished");
  }

  console.debug("creating inventory pdf");
  inventoryPdf = await createPdfDocument(definition);
  console.debug("inventory pdf finished");

  let pdf;

  if (abrPdf) {
    console.debug("appending inventory pdf and appendix items", files.length);

    pdf = await appendPdfPages(abrPdf, [inventoryPdf, ...files]);
  } else {
    console.debug("appending appendix items", files.length);

    pdf = await appendPdfPages(inventoryPdf, files);
  }

  res.contentType("application/pdf");
  res.send(Buffer.from(pdf, "binary"));
});
