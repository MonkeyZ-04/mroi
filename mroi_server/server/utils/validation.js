export const isEmptyNumber = (val) => val === "" || val === null;
export const isEmpty = (val) =>
  val === undefined ||
  val === null ||
  val === NaN ||
  (typeof val === "object" && Object.keys(val).length === 0) ||
  (typeof val === "string" && val.trim().length === 0);

export const identityTypeCheck = (identity) => ["FACIAL", "FINGERPRINT", "RFID", "QR", "CARD"].includes(identity);
export const identityImageTypeCheck = (identity) => ["FACIAL"].includes(identity);
