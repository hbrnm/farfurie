import { describe, expect, it } from "vitest";
import { translations } from "./i18n";

describe("i18n", () => {
  it("keeps RO and EN keys in sync", () => {
    expect(Object.keys(translations.en).sort()).toEqual(Object.keys(translations.ro).sort());
  });
});
