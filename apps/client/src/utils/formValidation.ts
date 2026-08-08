// Checks a set of labeled form values and alerts the user with exactly which
// fields are missing, instead of silently doing nothing on submit. Returns
// true (and shows the alert) when something is missing, so callers can
// `if (alertMissingFields(...)) return;`.
export function alertMissingFields(fields: Record<string, string | number | null | undefined>): boolean {
  const missing = Object.entries(fields)
    .filter(([, value]) => value === "" || value == null)
    .map(([label]) => label);

  if (missing.length === 0) return false;

  alert(`Please fill in: ${missing.join(", ")}`);
  return true;
}
