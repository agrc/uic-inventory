import { expect, test } from "vitest";
import { getMostImportantContact } from "./authorizationByRulePdf";

test("should choose facility owner over other contact types", () => {
  const primary_contact = getMostImportantContact([
    { contactType: "owner_operator" },
    { contactType: "facility_operator" },
    { contactType: "facility_manager" },
    { contactType: "official_rep" },
    { contactType: "contractor" },
    { contactType: "project_manager" },
    { contactType: "health_dept" },
    { contactType: "permit_writer" },
    { contactType: "developer" },
    { contactType: "facility_owner" },
    { contactType: "legal_rep" },
    { contactType: "other" },
  ]);

  expect(primary_contact.contactType).toBe("facility_owner");
});

test("should choose owner operator when facility owner is not available", () => {
  const primary_contact = getMostImportantContact([
    { contactType: "facility_operator" },
    { contactType: "facility_manager" },
    { contactType: "official_rep" },
    { contactType: "contractor" },
    { contactType: "owner_operator" },
    { contactType: "project_manager" },
    { contactType: "health_dept" },
    { contactType: "permit_writer" },
    { contactType: "developer" },
    { contactType: "legal_rep" },
    { contactType: "other" },
  ]);

  expect(primary_contact.contactType).toBe("owner_operator");
});

test("should choose legal rep when facility owner and owner operator is not available", () => {
  const primary_contact = getMostImportantContact([
    { contactType: "facility_operator" },
    { contactType: "facility_manager" },
    { contactType: "official_rep" },
    { contactType: "contractor" },
    { contactType: "project_manager" },
    { contactType: "health_dept" },
    { contactType: "permit_writer" },
    { contactType: "developer" },
    { contactType: "legal_rep" },
    { contactType: "other" },
  ]);

  expect(primary_contact.contactType).toBe("legal_rep");
});

test("should pick correct contact", () => {
  const primary_contact = getMostImportantContact([
    { contactType: "other", firstName: "David" },
    { contactType: "facility_operator", firstName: "Ryan" },
    { contactType: "facility_owner", firstName: "Jeff" },
  ]);

  expect(primary_contact.firstName).toBe("Jeff");
});
