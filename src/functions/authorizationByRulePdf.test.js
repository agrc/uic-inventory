import { expect, test } from "vitest";
import { getMostImportantContact } from "./authorizationByRulePdf";

test("should choose facility owner over other contact types", () => {
  const primary_contact = getMostImportantContact([
    { contactType: 0 },
    { contactType: 2 },
    { contactType: 3 },
    { contactType: 5 },
    { contactType: 6 },
    { contactType: 7 },
    { contactType: 8 },
    { contactType: 9 },
    { contactType: 10 },
    { contactType: 1 },
    { contactType: 4 },
    { contactType: 11 },
  ]);

  expect(primary_contact.contactType).toBe(1);
});

test("should choose owner operator when facility owner is not available", () => {
  const primary_contact = getMostImportantContact([
    { contactType: 2 },
    { contactType: 3 },
    { contactType: 5 },
    { contactType: 6 },
    { contactType: 0 },
    { contactType: 7 },
    { contactType: 8 },
    { contactType: 9 },
    { contactType: 10 },
    { contactType: 4 },
    { contactType: 11 },
  ]);

  expect(primary_contact.contactType).toBe(0);
});

test("should choose legal rep when facility owner and owner operator is not available", () => {
  const primary_contact = getMostImportantContact([
    { contactType: 2 },
    { contactType: 3 },
    { contactType: 5 },
    { contactType: 6 },
    { contactType: 7 },
    { contactType: 8 },
    { contactType: 9 },
    { contactType: 10 },
    { contactType: 4 },
    { contactType: 11 },
  ]);

  expect(primary_contact.contactType).toBe(4);
});

test("should pick correct contact", () => {
  const primary_contact = getMostImportantContact([
    { contactType: 11, firstName: "David" },
    { contactType: 2, firstName: "Ryan" },
    { contactType: 1, firstName: "Jeff" },
  ]);

  expect(primary_contact.firstName).toBe("Jeff");
});
