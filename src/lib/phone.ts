export const PHONE_HINT = "e.g. 0771234567";
export const PHONE_ERROR = "Please enter a valid Sri Lankan phone number, like 0771234567.";

// Sri Lankan numbers only. 0771234567, 077-123 4567, +94771234567 and 94771234567 all become "94771234567".
// Returns null when the number is not a valid Sri Lankan mobile or landline number.
export function normalizePhone(input: string) {
  if (!/^\+?[\d\s-]+$/.test(input.trim())) return null;
  const digits = input.replace(/\D/g, "");
  const national = digits.startsWith("94") ? digits.slice(2) : digits.startsWith("0") ? digits.slice(1) : null;
  return national && /^[1-9]\d{8}$/.test(national) ? `94${national}` : null;
}
