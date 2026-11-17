import { describe, expect, it } from "vitest";
import { limitPhoneDigits } from "@/lib/phone";

describe("phone input", () => {
  it("keeps the leading zero and limits formatted input to 11 digits", () => {
    expect(limitPhoneDigits("0912 345-6789 ext. 2")).toBe("09123456789");
    expect(limitPhoneDigits("")).toBe("");
  });
});
