export const phonePattern = /^[0-9]{0,11}$/;
export const phoneError = "Phone number must contain up to 11 digits.";

export function limitPhoneDigits(value: string) {
  return value.replace(/[^0-9]/g, "").slice(0, 11);
}
