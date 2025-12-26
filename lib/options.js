import { getCountries, getCountryCallingCode } from "libphonenumber-js/min";

export const ROLE_OPTIONS = [
  "Administrateur RP",
  "Administratrice RP",
  "Référent",
  "Référente",
  "Référent adjoint",
  "Référente adjointe",
  "Membre effectif"
];

export const ORG_OPTIONS = [
  { group: "Pôles", items: [
    "Pôle Technique",
    "Pôle Finances et Comptabilité",
    "Pôle Communication et Marketing",
    "Pôle Administration",
    "Pôle Gestion générale",
    "Pôle Ressources humaines"
  ]},
  { group: "Axes", items: [
    "Axe Culture",
    "Axe Éducation",
    "Axe Environnement",
    "Axe Sport"
  ]}
];

// Génère TOUS les pays supportés par libphonenumber-js
// Format attendu par ton <select>: { label, code }
function getRegionNameFr(iso2) {
  try {
    // FR = français. Si ton navigateur/Node ne supporte pas, fallback.
    const dn = new Intl.DisplayNames(["fr"], { type: "region" });
    return dn.of(iso2) || iso2;
  } catch {
    return iso2;
  }
}

export const COUNTRY_CODES = getCountries()
  .map((iso2) => {
    const code = String(getCountryCallingCode(iso2));
    const name = getRegionNameFr(iso2);
    return { label: `${name} (+${code})`, code };
  })
  // tri alphabétique sur le label (fr)
  .sort((a, b) => a.label.localeCompare(b.label, "fr"));
