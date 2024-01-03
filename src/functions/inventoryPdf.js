import { valueToLabel, ownershipTypes, wellTypes, contactTypes } from "./lookups.js";
import {
  buildTableDefinitionFor,
  buildSubTableDefinitionFor,
  buildColumnDefinitionFor,
  constants,
  spacer,
} from "./pdfHelpers.js";
import startCase from "lodash.startcase";

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour12: false,
});

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

  const addRemediationType = (well) => {
    console.debug("well subclass for remediation", well);

    return well.subClass === 5002
      ? [
          {
            text: well.remediationType,
            style: constants.value,
          },
          {
            text: well.remediationProjectId,
            style: constants.value,
          },
        ]
      : [
          {
            text: "-",
            style: constants.value,
          },
          {
            text: "-",
            style: constants.value,
          },
        ];
  };

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
        widths: ["6%", "32%", "25%", "15%", "11%", "11%"],
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
            {
              text: "Rem Type",
              style: constants.label,
            },
            {
              text: "Rem Id",
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
              columnGap: 3,
            },
            ...addRemediationType(well),
          ]),
        ],
      },
    },
  ];
};

const addWaterSystemInformation = (data) => {
  console.debug("adding water system information");

  let distinctContacts = [...new Set(data.map((contact) => JSON.stringify(contact)))].map((contact) =>
    JSON.parse(contact)
  );

  let columnDefinitions = buildSubTableDefinitionFor(distinctContacts);

  if (columnDefinitions.length === 0) {
    console.debug("no water system information found");

    columnDefinitions = [
      "Not applicable. The well(s) in this inventory do not intersect a source water protection zone.",
    ];
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

export const generateInventoryReportPdfDefinition = (inventory, contacts, image, watermark) => {
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
        signedDate: dateFormatter.format(new Date(inventory.submittedOn)),
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
            remediationType: well?.remediationType,
            remediationProjectId: well?.remediationProjectId,
            subClass: well.subClass,
          };
        })
      ),
      addWaterSystemInformation(
        inventory.wells
          .map((well) => well.waterSystemContacts)
          .flat()
          .map((contact) => {
            return {
              name: startCase(contact.system.toLowerCase()),
              contact: startCase(contact.name.toLowerCase()),
              email: contact.email.toLowerCase(),
            };
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
