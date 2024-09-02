import { Buffer } from "buffer";
import path from "path";
import { PDFDocument } from "pdf-lib";
import PdfPrinter from "pdfmake";
import { fileURLToPath } from "url";
import startCase from "lodash.startcase";

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

export const spacer = (size = 10) => {
  return { margin: [0, size], text: "" };
};

export const buildTableDefinitionFor = (title, data, options) => {
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
    ]),
  );

  if (options?.skipSpacer) {
    return tableDefinition;
  }

  return [spacer(), tableDefinition];
};

export const buildSubTableDefinitionFor = (data, columnSize = 2) => {
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

export const buildColumnDefinitionFor = (data) => {
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

export const createPdfDocument = async (definition) => {
  const pdf = await new Promise((resolve, reject) => {
    const chunks = [];
    const stream = printer.createPdfKitDocument(definition);

    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", (error) => reject(error));
    stream.end();
  });

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

export const constants = {
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
