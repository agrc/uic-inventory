import { ToWords } from "to-words";

const toWords = new ToWords({
  localeCode: "en-US",
  converterOptions: {
    currency: false,
    ignoreDecimal: true,
    ignoreZeroCurrency: true,
    doNotAddOnly: true,
  },
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "numeric",
  day: "numeric",
  year: "numeric",
  hour12: false,
});

const contactPreference = ["facility_owner", "owner_operator", "legal_rep"];

const getSubject = (type) => {
  switch (type) {
    case -1:
      return "Class V Wells";
    case 5047:
      return "Storm Water Drainage";
    case 5101:
      return "Large Underground Waste Disposal System";
    case 5026:
      return "Veterinary, Kennel, Pet Grooming Wastewater Disposal Systems";
    case 5002:
      return "Subsurface Environmental Remediation Wells";
  }
};

const addIntro = (date, inventory, contact) => {
  const addSubject = (subClass) => {
    switch (subClass) {
      case -1:
        return `General - EPA Well Code - NO CODE`;
      case 5047:
        return "Storm Water Drainage Wells - EPA Well Code - 5H1";
      case 5101:
        return "Large Underground Waste Disposal System - EPA Well Code - 5F";
      case 5026:
        return "Veterinary, Kennel, Pet Grooming Wastewater Disposal Systems - EPA Well Code - 5A15";
      case 5002:
        return "Subsurface Environmental Remediation Wells - EPA Well Code - 5B6";
      default:
        return "unknown type";
    }
  };

  const site = inventory.site;

  return [
    `Date: ${dateFormatter.format(date)}\n\n`,
    `${contact.firstName} ${contact.lastName}`,
    contact.organization,
    contact.address,
    `${contact.city}, ${contact.state} ${contact.zipCode}\n\n`,
    `Dear ${contact.firstName} ${contact.lastName}\n\n`,
    {
      columns: [
        {
          width: "auto",
          text: "Subject",
        },
        {
          stack: [
            "Approval of Class V Injection Well Authorization by Rule",
            addSubject(inventory.subClass),
            site.name,
            `${site.address}; Utah`,
            `Utah UIC Site ID: ${site.siteId}\n\n`,
          ],
        },
      ],
    },
  ];
};

const getApprovalText = (subClass, wellCount) => {
  const getBasicApprovalText = (wellCount) => {
    return [
      {
        text: [
          `Approval is hereby granted to construct and operate ${toWords
            .convert(wellCount)
            .toLowerCase()} (${wellCount}) Class V well(s) under Authorization by Rule according to the Administrative Rules for the Utah UIC Program (Utah UIC Program Rules), `,
          {
            text: "R317-7",
            link: "http://rules.utah.gov/publicat/code/r317/r317-007.htm",
            decoration: "underline",
          },
          ".\n\n",
        ],
      },
    ];
  };

  switch (subClass) {
    case -1: {
      return [
        ...getBasicApprovalText(wellCount),
        `The Class V well(s) associated with this authorization are authorized as ${subClass}. The subject site is authorized to dispose of wastewater in accordance with the activities defined in the submitted well inventory application associated with this Authorization by Rule approval.\n\n`,
      ];
    }
    case 5047: {
      return [
        ...getBasicApprovalText(wellCount),
        "The Class V well(s) associated with this authorization are authorized as Stormwater Drainage Wells to manage stormwater for the subject property.\n\n",
        "The construction and operation of any storm water drainage wells at this site may be subject to additional requirements established by local ordinances and/or a Storm Water Pollution Prevention Plan (SWPPP), if applicable.\n\n",
      ];
    }
    case 5026: {
      return [
        ...getBasicApprovalText(wellCount),
        "The Class V well(s) associated with this authorization are authorized as Veterinary, Kennel, Pet Grooming Wastewater Disposal System to dispose of wastewater from the subject property.\n\n",
      ];
    }
    case 5002: {
      return [
        ...getBasicApprovalText(wellCount),
        "The Class V well(s) associated with this authorization are authorized as Subsurface Environmental Remediation Wells for remediation of the subject property as defined in the submitted well inventory application associated with this Authorization by Rule approval.\n\n",
        "If the SER Wells are more than 29 feet deep, the operator must meet the requirements of the Division of Water Rights. Please contact the Division of Water Rights at (801) 538-7240 or waterrights@utah.gov for further information.\n\n",
        "The construction and operation of any injection wells at this site for subsurface environmental remediation may be subject to additional requirements established by the Utah Division of Environmental Response and Remediation (DERR) or The Utah Division of Waste Management and Radiation Control (WMRC).\n\n",
      ];
    }
    case 5101: {
      return [
        "This Large Underground Wastewater Disposal System is authorized by rule under the Utah 1422 UIC Program provided it remains in compliance with the construction and operating permits issued by the Division of Water Quality. However, if any noncompliance with these permits results in the potential for or demonstration of actual exceedance of any Utah Maximum Contaminant Levels (MCLs) in a receiving ground water, the noncompliance will also be a violation of the Utah UIC administrative rules and therefore be subject to enforcement action. It is therefore important to service, maintain, and operate this system within the requirements of the construction and operating permits. Periodic maintenance will keep the system in optimal operating condition thereby reducing unnecessary expenses and possible enforcement penalties.\n\n",
        "The Class V well(s) associated with this authorization are authorized as Large Onsite Underground Disposal System (LUWDS) to dispose of wastewater from the subject property.\n\n",
      ];
    }
  }
};

export const getMostImportantContact = (contacts) => {
  if (contacts?.length === 1) {
    return contacts[0];
  }

  contacts.sort((a, b) => {
    const indexA = contactPreference.indexOf(a.contactType);
    const indexB = contactPreference.indexOf(b.contactType);

    if (indexA < indexB) {
      return -1;
    }

    if (indexA > indexB) {
      return 1;
    }

    return 0;
  });

  return contacts[0];
};

export const generateAuthorizationByRule = (inventory, contact, approver) => {
  const definition = {
    info: {
      title: "Utah Underground Injection Control (UIC) Authorization By Rule Letter",
      author: "Utah Geospatial Resource Center (UGRC)",
      subject: getSubject(inventory.subClass),
      keywords: "uic utah inventory application",
    },
    pageOrientation: "LETTER",
    content: [
      ...addIntro(Date.now(), inventory, contact),
      {
        stack: [
          {
            text: "APPROVAL AND AUTHORIZATION\n",
            style: ["bold", "italic", "text-lg"],
          },
          "The Division of Water Quality (DWQ) has reviewed the information submitted on the Utah Underground Injection Control (UIC) Inventory Information form along with any additional details that may have been provided pertaining to the proposed Class V well(s) at the subject property.\n\n",
          getApprovalText(
            inventory.subClass,
            inventory.wells.reduce((sum, well) => sum + well.count, 0)
          ),
          "If any of the injection wells in your well inventory application are within an aquifer recharge discharge area or one or more groundwater-based source water protection zones, the well(s) may be subject to additional requirements and/or restrictions established by local ordinances and/or a Source Water Protection Plan. Please refer to the Location Details section within the following Inventory Review Report link for a summary of any wells that are within an aquifer recharge discharge area or a source water protection zone. Wells in an aquifer recharge discharge area will be indicated by a green “ARDA” box. Wells in a source water protection zone will be indicated by a green “GWZ” box and include the associated Water System contact person.\n\n",
          {
            text: "**NOTICE - You are required to report any changes related to the site and/or associated well inventories. See the “Class V Forms and Applications” section on the UIC web page (link below) to report changes to well operating status (e.g., date constructed, date active, date closed, etc.), add new wells to the site, or report changes to site contacts.\n",
            style: ["rose-700", "bold"],
          },
          {
            text: "https://deq.utah.gov/water-quality/forms-and-applications-utah-underground-injection-control-uic-program\n\n",
            link: "https://deq.utah.gov/water-quality/forms-and-applications-utah-underground-injection-control-uic-program",
            decoration: "underline",
          },
          `This site has been assigned a Utah UIC Site ID: ${inventory.site.siteId}. Please use this identification number when submitting any further information and correspondence regarding injection wells at this site.\n\n`,
          {
            text: "PROHIBITION OF UNAUTHORIZED INJECTION\n",
            style: ["bold", "italic", "text-lg"],
          },
          {
            text: "Responsibility of the Utah Division of Water Quality",
            style: ["bold"],
          },
          {
            text: [
              "According to the Utah UIC Program Rules, Class V injection wells are Authorized by Rule provided inventory information is submitted before injection commences. The Utah UIC Program Rules prohibit authorization of underground injections “which would allow movement of fluid containing any contaminant into underground sources of drinking water if the presence of that contaminant may cause a violation of any primary drinking water regulation (",
              {
                text: "40 CFR Part 141",
                link: "https://www.ecfr.gov/cgi-bin/text-idx?SID=483d7540db6060f4f10e3628813c670a&mc=true&node=pt40.25.141&rgn=div5",
                decoration: "underline",
              },
              " and Utah Public Drinking Water Rules ",
              {
                text: "R309-200",
                link: "http://rules.utah.gov/publicat/code/r309/r309-200.htm",
                decoration: "underline",
              },
              "), or which may adversely affect the health of persons” or which “may cause a violation of any ground water quality rules that may be promulgated by the Utah Water Quality Board ",
              {
                text: "R317-6",
                link: "http://rules.utah.gov/publicat/code/r317/r317-006.htm",
                decoration: "underline",
              },
              ".”\n\n",
            ],
          },
          "If at any time the Director of the Utah Division of Water Quality determines that a Class V well may cause a violation of primary drinking water rules, the Utah UIC Program Rules require the Director to take appropriate action to address such determination. The Director may require the injector to obtain an individual permit, require the injector to close the injection well, or take appropriate enforcement action including site remediation.\n\n",
          {
            text: "Responsibility of the Operator",
            style: ["bold"],
          },
          "Once approval has been given to operate a Class V injection well under Authorization by Rule, it is the responsibility of the operator of the Class V injection well to implement appropriate Best Management Practices (BMPs) to ensure that the authorized injectate does not contain any contaminant that would cause a violation of any primary drinking water regulation or ground water quality rule or would otherwise adversely affect the health of persons. Additionally, no injectate other than that for which the well is authorized should be allowed to enter the well.\n\n",
          "If you have any questions or comments, please feel free to contact us.\n\n",
          "Sincerely,\n\n",
          `${approver.firstName} ${approver.lastName}`,
          approver.organization,
          approver.phoneNumber,
          approver.email,
        ],
      },
    ],
    defaultStyle: {
      font: "Roboto",
      columnGap: 20,
      lineHeight: 1.1,
      color: "#1e293b",
    },
    styles: {
      "text-lg": {
        fontSize: 14,
      },
      "rose-700": {
        color: "#be123c",
      },
      bold: {
        bold: true,
      },
      italic: {
        italics: true,
      },
      underline: {
        decoration: "underline",
      },
    },
    watermark: {
      text: "draft",
      color: "#94a3b8",
      opacity: 0.7,
      bold: true,
    },
  };

  return definition;
};
