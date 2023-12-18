import { Buffer } from "buffer";
import path from "path";
import { PDFDocument } from "pdf-lib";
import PdfPrinter from "pdfmake";
import { fileURLToPath } from "url";
import startCase from "lodash.startcase";
import { valueToLabel, ownershipTypes, wellTypes, contactTypes } from "./lookups.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const empty = {};
const span = (int) => Array(int).fill(empty);

const printer = new PdfPrinter({
  Roboto: {
    normal: __dirname + "/fonts/Roboto-Regular.ttf",
    bold: __dirname + "/fonts/Roboto-Medium.ttf",
    italics: __dirname + "/fonts/Roboto-Italic.ttf",
    bolditalics: __dirname + "/fonts/Roboto-MediumItalic.ttf",
  },
});

export const getBinaryPdfs = async (bucket, pdfPaths) => {
  const promises = [];

  for (let i = 0; i < pdfPaths.length; i++) {
    const result = await getFiles(bucket.getFilesStream({ prefix: pdfPaths[i] }));

    const file = result[0];
    console.debug("downloading appendix", file.metadata.name);

    promises.push(getPdfData(file.createReadStream()));
  }

  const results = await Promise.all(promises);

  return results;
};

const getPdfData = (stream) => {
  const chunks = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (err) => {
      console.debug("getPdfData error", err, { structuredData: true });

      return reject(err);
    });
  });
};

const getFiles = (stream) => {
  const files = [];

  return new Promise((resolve, reject) => {
    stream.on("data", (file) => files.push(file));
    stream.on("end", () => resolve(files));
    stream.on("error", (err) => {
      console.debug("getFiles error", err, { structuredData: true });

      return reject(err);
    });
  });
};

const spacer = (size = 10) => {
  return { margin: [0, size], text: "" };
};

const buildTableDefinitionFor = (title, data, options) => {
  const tableDefinition = {
    table: {
      widths: [title?.length > 0 ? "20%" : "25%", "*"],
      headerRows: 1,
      body: [],
    },
  };

  if (title?.length > 0) {
    tableDefinition.table.body.push([
      { text: title, style: constants.tableHeading, colSpan: 2, alignment: "center" },
      ...span(1),
    ]);
  }

  tableDefinition.table.body.push(
    ...Object.entries(data).map(([key, value]) => [
      {
        text: startCase(key),
        style: constants.label,
      },
      {
        text: value,
        style: constants.value,
      },
    ])
  );

  if (options?.skipSpacer) {
    return tableDefinition;
  }

  return [spacer(), tableDefinition];
};

const buildSubTableDefinitionFor = (data, columnSize = 2) => {
  let columnDefinitions = [];
  let columns = [];

  data?.forEach((item) => {
    columns.push(buildTableDefinitionFor(null, item, { skipSpacer: true }));

    if (columns.length === columnSize) {
      columnDefinitions.push({
        columns,
        columnGap: 10,
      });
      columnDefinitions.push(spacer(2.5));

      // reset
      columns = [];
    }
  });

  if (columns.length > 0) {
    columnDefinitions.push({
      columns,
      columnGap: 10,
    });
  }

  return columnDefinitions;
};

const buildColumnDefinitionFor = (data) => {
  var tableDefinition = {
    table: {
      dontBreakRows: true,
      keepWithHeaderRows: true,
      pageBreak: "before",
      headerRows: 1,
      widths: ["*"],
      body: [],
    },
  };

  data.forEach((item) => {
    const items = [];
    Object.entries(item).forEach(([key, value]) => {
      items.push({
        text: `${startCase(key)}: `,
        style: ["text-normal", "bold"],
      });
      items.push({
        text: `${value}\n`,
        style: constants.value,
      });
    });

    tableDefinition.table.body.push([
      {
        text: items,
      },
    ]);
  });

  return tableDefinition;
};

const addSiteContacts = (data) => {
  console.debug("adding site contacts");
  const columnDefinitions = buildSubTableDefinitionFor(data);

  return [
    spacer(),
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Site Contacts", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    columnDefinitions,
  ];
};

const addLocationDetails = () => {
  console.debug("adding location details");

  return [
    spacer(2.5),
    {
      table: {
        dontBreakRows: true,
        keepWithHeaderRows: true,
        pageBreak: "before",
        widths: ["*"],
        headerRows: 1,
        body: [
          [{ text: "Location Details", style: constants.tableHeading, alignment: "center" }],
          [
            {
              image: "map",
              width: 500,
            },
          ],
        ],
      },
    },
    {
      ...spacer(0),
      pageBreak: "after",
    },
  ];
};

const addWellInformation = (data) => {
  console.debug("adding well information");

  return [
    spacer(),
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Well Information", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    {
      table: {
        dontBreakRows: true,
        keepWithHeaderRows: true,
        pageBreak: "before",
        widths: ["10%", "35%", "30%", "25%"],
        headerRows: 1,
        body: [
          [
            {
              text: "Count",
              style: constants.label,
            },
            {
              text: "Construction",
              style: constants.label,
            },
            {
              text: "Operating Status",
              style: constants.label,
            },
            {
              text: "Ground Water",
              style: constants.label,
            },
          ],
          ...data.map((well) => [
            {
              text: well.count,
              style: constants.value,
            },
            {
              text: well.construction,
              style: constants.value,
            },
            {
              text: well.operatingStatus,
              style: constants.value,
            },
            {
              columns: [
                {
                  text: "GWZ",
                  style: ["text-normal", well.groundWater?.startsWith("Y") ? "emerald-700" : "rose-700"],
                },
                {
                  text: "ARDA",
                  style: ["text-normal", ["Y+", "S"].includes(well.groundWater) ? "emerald-700" : "rose-700"],
                },
                {
                  text: well.groundWater,
                  style: ["text-normal"],
                },
              ],
            },
          ]),
        ],
      },
    },
  ];
};

const addWaterSystemInformation = (data) => {
  console.debug("adding water system information");

  const columnDefinitions = buildSubTableDefinitionFor(data);

  if (columnDefinitions.length === 0) {
    console.debug("no water system information found");

    return [];
  }

  return [
    spacer(),
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Water System Information", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    columnDefinitions,
  ];
};

const addConstructionDetails = (data) => {
  console.debug("adding construction details");

  const columnDefinitions = buildColumnDefinitionFor(data);

  if (columnDefinitions.table.body.length === 0) {
    console.debug("no construction details found");

    return [];
  }

  return [
    {
      ...spacer(),
      pageBreak: "after",
    },
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Construction Details", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    columnDefinitions,
  ];
};

const addInjectateCharacterization = (data) => {
  console.debug("adding injectate characterization");

  const columnDefinitions = buildColumnDefinitionFor(data);

  if (columnDefinitions.table.body.length === 0) {
    console.debug("no injectate characterization found");

    return [];
  }

  return [
    {
      ...spacer(),
      pageBreak: "after",
    },
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Injectate Characterization", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    columnDefinitions,
  ];
};

const addHydrogeologicCharacterization = (data) => {
  console.debug("adding hydrogeologic characterization");

  const columnDefinitions = buildColumnDefinitionFor(data);

  if (columnDefinitions.table.body.length === 0) {
    console.debug("no hydrogeologic characterization found");

    return [];
  }

  return [
    {
      ...spacer(),
      pageBreak: "after",
    },
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Hydrogeologic Characterization", style: constants.tableHeading, alignment: "center" }]],
      },
    },
    spacer(2.5),
    columnDefinitions,
  ];
};

const addAppendixItems = () => {
  console.debug("adding appendix items");

  return [
    {
      ...spacer(0),
      pageBreak: "after",
    },
    {
      table: {
        widths: ["*"],
        body: [[{ text: "Appendix", style: constants.tableHeading, alignment: "center" }]],
        pageBreak: "before",
      },
    },
  ];
};

export const generatePdfDefinition = (inventory, contacts, image, watermark) => {
  const definition = {
    info: {
      title: "Utah Underground Injection Control (UIC) Class V Inventory Information Report",
      author: "Utah Geospatial Resource Center (UGRC)",
      subject: `Inventory Information Report for inventory ${inventory.id} from site ${inventory.site.id}`,
      keywords: "uic utah inventory application",
    },
    pageOrientation: "LETTER",
    defaultStyle: {
      font: "Roboto",
    },
    header: {
      text: "Utah Underground Injection Control",
      style: constants.header,
    },
    content: [
      { text: `Class V Inventory Information Report`, style: constants.subHeader },
      buildTableDefinitionFor("Site Details", {
        name: inventory.site.name,
        location: inventory.site.address,
        landOwnership: valueToLabel(ownershipTypes, inventory.site.ownership),
        NAICS: `${inventory.site.naicsPrimary} - ${inventory.site.naicsTitle}`,
        EDOCS: inventory.edocs,
        siteId: inventory.site.siteId,
      }),
      buildTableDefinitionFor("Inventory Details", {
        inventoryClass: valueToLabel(wellTypes, inventory.subClass),
        orderNumber: inventory.orderNumber,
        signedBy: inventory.signature,
        signedDate: inventory.submittedOn, // TODO: requires formatting
      }),
      addSiteContacts(
        contacts.map((contact) => {
          return {
            name: `${contact.firstName} ${contact.lastName}`,
            organization: contact.organization,
            contactType: valueToLabel(contactTypes, contact.contactType),
            email: contact.email,
            phone: contact.phoneNumber,
            address: `${contact.mailingAddress}\n${contact.city}, ${contact.state} ${contact.zipCode}`,
          };
        })
      ),
      addLocationDetails(),
      addWellInformation(
        inventory.wells.map((well) => {
          return {
            count: well.count,
            construction: well.wellName,
            operatingStatus: well.status,
            groundWater: well.surfaceWaterProtection,
          };
        })
      ),
      addWaterSystemInformation(
        inventory.wells
          .map((well) => well.waterSystemContacts)
          .flat()
          .map((contact) => {
            return { name: contact.system, contact: contact.name, email: contact.email };
          })
      ),
      addConstructionDetails(
        inventory.wells
          .filter((well) => well.constructionDetails)
          .map((well) => {
            return {
              name: well.wellName,
              constructionDetails: well.constructionDetails.startsWith("file::")
                ? "(See Appendix)"
                : well.constructionDetails,
            };
          })
      ),
      addInjectateCharacterization(
        inventory.wells
          .filter((well) => well.injectateCharacterization)
          .map((well) => {
            return {
              name: well.wellName,
              injectateCharacterization: well.injectateCharacterization.startsWith("file::")
                ? "(See Appendix)"
                : well.injectateCharacterization,
            };
          })
      ),
      addHydrogeologicCharacterization(
        inventory.wells
          .filter((well) => well.hydrogeologicCharacterization)
          .map((well) => {
            return {
              name: well.wellName,
              hydrogeologicCharacterization: well.hydrogeologicCharacterization.startsWith("file::")
                ? "(See Appendix)"
                : well.hydrogeologicCharacterization,
            };
          })
      ),
    ],
    footer: [
      {
        style: constants.footer,
        margin: [45, 2, 40, 0],
        text: "The State of Utah makes no guarantees, representations, or warranties of any kind, expressed or implied, as to the content, accuracy, timeliness, or completeness of any of the data. Unless otherwise noted all images are oriented North and are not to scale. The data is provided on an “as is, where is” basis. The State assumes no obligation or liability for its use by any persons. Identified inaccuracies can be reported to uic-inventory@utah.gov.",
      },
      {
        qr: `https://uic-inventory.dev.utah.gov/review/site/${inventory.site.id}/inventory/${inventory.id}`,
        fit: 50,
        absolutePosition: { x: 7, y: 0 },
        foreground: constants.sky500,
      },
    ],
    styles: {
      "text-xl": {
        fontSize: 34,
      },
      "text-lg": {
        fontSize: 21,
      },
      "text-normal": {
        fontSize: 10,
      },
      "text-sm": {
        fontSize: 8,
      },
      "text-white": {
        color: "#ffffff",
      },
      "slate-800": {
        color: "#1e293b",
      },
      "sky-800": {
        color: "#075985",
      },
      "sky-50": {
        color: "#f0f9ff",
      },
      "rose-700": {
        color: "#be123c",
      },
      "emerald-700": {
        color: "#047857",
      },
      "bg-sky-600": {
        fillColor: "#3B84A0",
      },
      "bg-sky-800": {
        fillColor: "#1C4860",
      },
      bold: {
        bold: true,
      },
      italic: {
        italics: true,
      },
      center: {
        alignment: "center",
      },
    },
    images: {
      map: image,
    },
  };

  if (watermark) {
    definition.watermark = {
      text: "draft",
      color: "#94a3b8",
      opacity: 0.7,
      bold: true,
    };
  }

  return definition;
};

export const createPdfDocument = async (definition, extraPdfPages) => {
  const partialPdf = await new Promise((resolve, reject) => {
    const chunks = [];
    const stream = printer.createPdfKitDocument(definition);

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
    stream.end();
  });

  console.debug("saved report. appending appendix items", extraPdfPages.length);
  const pdf = await appendPdfPages(partialPdf, extraPdfPages);

  return pdf;
};

export const appendPdfPages = async (original, pdfs) => {
  if (pdfs.length === 0) {
    return original;
  }

  const source = await PDFDocument.load(original, { throwOnInvalidObject: true });

  for (let i = 0; i < pdfs.length; i++) {
    const appendix = await PDFDocument.load(pdfs[i], { throwOnInvalidObject: true });
    console.debug("appending appendix", i, appendix.getPageIndices());
    const copiedPages = await source.copyPages(appendix, appendix.getPageIndices());

    copiedPages.forEach((page) => {
      source.addPage(page);
    });
  }

  const complete = await source.save();
  console.debug("saved");

  return complete;
};

const constants = {
  grid: ["40%", "10%", "10%", "10%", "10%", "10%", "10%"],
  half: "50%",
  sky500: "#0ea5e9",
  tableHeading: ["text-lg", "bold", "center", "bg-sky-800", "text-white"],
  label: ["text-normal", "bold", "bg-sky-600", "sky-50"],
  value: ["text-normal", "slate-800"],
  subLabel: ["text-normal", "slate-800", "bold"],
  header: ["text-xl", "bold", "center", "sky-800"],
  subHeader: ["text-lg", "bold", "center", "sky-800"],
  footer: ["text-sm", "italic", "justify", "rose-700"],
};
