import { describe, it, expect } from "vitest";
import {
  getProvinces,
  getCities,
  getBarangays,
  getPuroks,
  formatAddress,
  OTHER_PUROK_OPTION,
  DEFAULT_PUROKS,
  SPECIFIC_BARANGAY_PUROKS,
} from "@/lib/philippine-address";

describe("philippine-address", () => {
  it("returns sorted provinces including Davao del Norte and Cebu", () => {
    const provinces = getProvinces();
    expect(provinces).toContain("Davao del Norte");
    expect(provinces).toContain("Davao del Sur");
    expect(provinces).toContain("Cebu");
    expect(provinces).toContain("Metro Manila");
    expect(provinces).toEqual([...provinces].sort());
  });

  it("returns sorted cities for a valid province and empty array for invalid", () => {
    const davaoDelNorteCities = getCities("Davao del Norte");
    expect(davaoDelNorteCities).toContain("Panabo City");
    expect(davaoDelNorteCities).toContain("Tagum City");
    expect(davaoDelNorteCities).toContain("Carmen");
    expect(davaoDelNorteCities).toEqual([...davaoDelNorteCities].sort());

    expect(getCities(null)).toEqual([]);
    expect(getCities("Non-existent Province")).toEqual([]);
  });

  it("returns sorted barangays for Panabo City", () => {
    const barangays = getBarangays("Davao del Norte", "Panabo City");
    expect(barangays).toContain("Cagangohan");
    expect(barangays).toContain("San Pedro");
    expect(barangays).toContain("San Vicente");
    expect(barangays).toContain("J.P. Laurel");
    expect(barangays).toContain("San Francisco (Poblacion)");
    expect(barangays).toEqual([...barangays].sort());

    expect(getBarangays("Davao del Norte", null)).toEqual([]);
    expect(getBarangays(null, "Panabo City")).toEqual([]);
  });

  it("returns specific puroks for Cagangohan including Other (Specify)", () => {
    const puroks = getPuroks("Davao del Norte", "Panabo City", "Cagangohan");
    expect(puroks).toContain("Purok 1");
    expect(puroks).toContain("Purok Coastal");
    expect(puroks).toContain("Sitio Baybay");
    expect(puroks).toContain(OTHER_PUROK_OPTION);
    expect(puroks).toEqual([...SPECIFIC_BARANGAY_PUROKS["Cagangohan"]]);
  });

  it("returns specific puroks when barangay name has Barangay prefix or Poblacion suffix", () => {
    const withPrefix = getPuroks("Davao del Norte", "Panabo City", "Barangay Cagangohan");
    expect(withPrefix).toEqual([...SPECIFIC_BARANGAY_PUROKS["Cagangohan"]]);

    const sanFranciscoPob = getPuroks("Davao del Norte", "Panabo City", "San Francisco (Poblacion)");
    expect(sanFranciscoPob).toEqual([...SPECIFIC_BARANGAY_PUROKS["San Francisco"]]);
  });

  it("returns default puroks for barangays without custom lists", () => {
    const puroks = getPuroks("Davao del Norte", "Panabo City", "Buenavista");
    expect(puroks).toEqual([...DEFAULT_PUROKS]);
    expect(puroks).toContain(OTHER_PUROK_OPTION);
  });

  it("formats address correctly matching mobile app specification", () => {
    const formatted = formatAddress({
      province: "Davao del Norte",
      city: "Panabo City",
      barangay: "Cagangohan",
      purok: "Purok 2",
    });
    expect(formatted).toBe("Purok 2, Barangay Cagangohan, Panabo City, Davao del Norte");
  });

  it("formats address correctly when barangay already includes Barangay prefix", () => {
    const formatted = formatAddress({
      province: "Davao del Norte",
      city: "Panabo City",
      barangay: "Barangay San Pedro",
      purok: "Purok 5",
    });
    expect(formatted).toBe("Purok 5, Barangay San Pedro, Panabo City, Davao del Norte");
  });

  it("handles custom purok string correctly in address formatting", () => {
    const formatted = formatAddress({
      province: "Davao del Norte",
      city: "Panabo City",
      barangay: "Cagangohan",
      purok: "Purok 5A Extension",
    });
    expect(formatted).toBe("Purok 5A Extension, Barangay Cagangohan, Panabo City, Davao del Norte");
  });
});
