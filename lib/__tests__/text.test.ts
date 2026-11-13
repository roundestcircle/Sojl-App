import { aufnahmeTitle, count } from "@/lib/text";

describe("count", () => {
  it("uses the singular only for exactly one", () => {
    expect(count(1, "Horizont", "Horizonte")).toBe("1 Horizont");
    expect(count(0, "Horizont", "Horizonte")).toBe("0 Horizonte");
    expect(count(3, "Aufnahme ist", "Aufnahmen sind")).toBe("3 Aufnahmen sind");
  });
});

describe("aufnahmeTitle", () => {
  it("prefers the nummer and appends the name", () => {
    expect(aufnahmeTitle({ id: 17, nummer: 3, name: "WP12" })).toBe(
      "Aufnahme 3 – WP12",
    );
  });

  it("falls back to the id and omits an empty name", () => {
    expect(aufnahmeTitle({ id: 17, nummer: null, name: null })).toBe(
      "Aufnahme 17",
    );
    expect(aufnahmeTitle({ id: 17, nummer: 2, name: "" })).toBe("Aufnahme 2");
  });
});
