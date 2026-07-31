/**
 * Facility intake wizard — declarative schema.
 *
 * Three tiers:
 *   1. Facility Identity (always)
 *   2. Applicability (always — drives which supplements appear)
 *   3+ Per-binder supplements, shown only when relevant.
 *
 * HARD PRIVACY RULE: no field may ask for resident-identifiable data.
 * Resident-related questions are counts or aggregate descriptions only.
 */

export type Answers = Record<string, string | string[] | undefined>;

export type FieldType =
  | "text"
  | "tel"
  | "email"
  | "date"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkboxes";

export interface Option {
  value: string;
  label: string;
}

export interface FieldDef {
  id: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: Option[];
  /** Adds an "Other" free-text companion field (id + "Other"). */
  allowOther?: boolean;
  hint?: string;
  placeholder?: string;
  /** Within-step conditional (e.g. generator details only if generator = Yes). */
  showIf?: (a: Answers) => boolean;
}

export interface FieldGroup {
  title?: string;
  fields: FieldDef[];
}

export interface StepDef {
  id: string;
  title: string;
  shortTitle: string;
  desc: string;
  groups: FieldGroup[];
  /** Step-level conditional — supplements only. */
  visible?: (a: Answers) => boolean;
}

export const PRIVACY_NOTE =
  "Do not include resident names or any resident health information anywhere in this form. Resident-related questions ask for counts only.";

const YES_NO: Option[] = [
  { value: "Yes", label: "Yes" },
  { value: "No", label: "No" },
];

const opt = (v: string): Option => ({ value: v, label: v });

/* Which "binders in your order" selections make each supplement relevant.
   Bundles are expanded to the binders they contain. */
const EP_TRIGGERS = [
  "ep-binder-small",
  "ep-binder-large",
  "license-essentials",
  "complete-compliance-library",
  "all",
];
const SURVEY_MASTER_TRIGGERS = [
  "survey-master-binder",
  "survey-ready-core",
  "license-essentials",
  "complete-compliance-library",
  "all",
];
const KITCHEN_TRIGGERS = [
  "kitchen-survey-binder",
  "complete-compliance-library",
  "all",
];

function ordered(a: Answers, triggers: string[]): boolean {
  const sel = a.bindersOrdered;
  if (!Array.isArray(sel)) return false;
  return sel.some((id) => triggers.includes(id));
}

export const BINDER_ORDER_OPTIONS: Option[] = [
  { value: "policy-procedures-manual", label: "Policy & Procedures Manual" },
  { value: "forms-manual", label: "Forms Manual" },
  { value: "survey-master-binder", label: "Survey Master Binder" },
  { value: "ep-binder-small", label: "Emergency Preparedness Binder — Small Operation (1–5 beds)" },
  { value: "ep-binder-large", label: "Emergency Preparedness Binder — Large Operation" },
  { value: "qapi-binder", label: "QAPI Binder" },
  { value: "hipaa-binder", label: "HIPAA Compliance Binder" },
  { value: "facility-operations-binder", label: "Facility Operations Binder" },
  { value: "contracts-vendor-binder", label: "Contracts & Vendor Binder" },
  { value: "kitchen-survey-binder", label: "Kitchen Survey Binder" },
  { value: "fsep", label: "Fire Safety & Evacuation Plan (FSEP)" },
  { value: "nursing-survey-binder", label: "Nursing Survey Binder" },
  { value: "resident-binder-system", label: "Resident Binder System" },
  { value: "personnel-binder-system", label: "Personnel Binder System" },
  { value: "training-competency-binder", label: "Training & Competency Binder" },
  { value: "dementia-care-addon", label: "Dementia Care Add-On" },
  { value: "customized-living-layer", label: "Customized Living (CL) Layer" },
  { value: "survey-ready-core", label: "Bundle: Survey-Ready Core" },
  { value: "license-essentials", label: "Bundle: License Essentials" },
  { value: "complete-compliance-library", label: "Bundle: Complete Compliance Library" },
  { value: "all", label: "All binders / not sure of exact list yet" },
];

export const steps: StepDef[] = [
  /* ── Step 1 · Facility Identity ───────────────────────────────── */
  {
    id: "identity",
    title: "Facility Identity",
    shortTitle: "Facility",
    desc: "The legal identity that appears on your license — this is what gets printed into every binder.",
    groups: [
      {
        fields: [
          { id: "legalName", label: "Legal facility name", type: "text", required: true },
          { id: "hfid", label: "HFID", type: "text", required: true, hint: "Your MDH Health Facility ID." },
          { id: "streetAddress", label: "Street address", type: "text", required: true, placeholder: "Street, city, state, ZIP" },
          { id: "facilityPhone", label: "Facility phone", type: "tel", required: true },
          { id: "licenseNumber", label: "License number", type: "text", required: true },
          {
            id: "licenseCategory",
            label: "License category",
            type: "select",
            required: true,
            options: [
              opt("Assisted Living"),
              opt("Assisted Living with Dementia Care"),
            ],
          },
          { id: "licenseExpiration", label: "License expiration date", type: "date", required: true },
          { id: "licensedCapacity", label: "Licensed capacity", type: "number", required: true, hint: "Number of licensed beds/units." },
          {
            id: "effectiveDate",
            label: "Requested binder effective date",
            type: "date",
            required: true,
            hint: "The date your binders should show as in effect.",
          },
        ],
      },
      {
        title: "Key people",
        fields: [
          { id: "alDirector", label: "Assisted Living Director", type: "text", required: true },
          { id: "clinicalNurseSupervisor", label: "Clinical Nurse Supervisor", type: "text", required: true },
          { id: "cnsRnLicense", label: "Clinical Nurse Supervisor — RN license #", type: "text", required: true },
          { id: "privacyOfficer", label: "Privacy Officer", type: "text", required: true },
          { id: "securityOfficer", label: "Security Officer", type: "text", required: true },
          { id: "complaintHandler", label: "Complaint Handler", type: "text", required: true },
          { id: "qapiChair", label: "QAPI Chair", type: "text", required: true },
        ],
      },
    ],
  },

  /* ── Step 2 · Applicability ───────────────────────────────────── */
  {
    id: "applicability",
    title: "Applicability",
    shortTitle: "Applicability",
    desc: "These answers decide which supplement pages appear next — you'll only be asked about what applies to you.",
    groups: [
      {
        fields: [
          {
            id: "operationSize",
            label: "Operation size",
            type: "radio",
            required: true,
            options: [opt("1–5 beds"), opt("6+ beds")],
          },
          {
            id: "servicesOffered",
            label: "Services offered",
            type: "checkboxes",
            required: true,
            allowOther: true,
            options: [
              opt("ADL assistance"),
              opt("Medication management"),
              opt("Health-related services"),
              opt("Meals"),
              opt("Housekeeping"),
              opt("Transportation"),
              opt("Activities"),
            ],
          },
          {
            id: "bindersOrdered",
            label: "Binders in your order",
            type: "checkboxes",
            required: true,
            options: BINDER_ORDER_OPTIONS,
            hint: "Check everything you've ordered (or plan to). This decides which supplement questions appear.",
          },
          {
            id: "dhsBilling",
            label: "Do you bill DHS for Customized Living?",
            type: "radio",
            required: true,
            options: YES_NO,
          },
          {
            id: "dementiaLicense",
            label: "Do you hold a dementia care license?",
            type: "radio",
            required: true,
            options: YES_NO,
          },
        ],
      },
      {
        title: "Languages",
        fields: [
          {
            id: "preferredLanguages",
            label: "Preferred working language(s) for documents",
            type: "checkboxes",
            required: true,
            allowOther: true,
            options: [
              opt("English"),
              opt("Somali"),
              opt("Spanish"),
              opt("Hmong"),
              opt("Oromo"),
            ],
          },
          {
            id: "employeeLanguages",
            label: "Languages spoken by 5+ employees",
            type: "text",
            placeholder: "e.g. English, Somali",
          },
          {
            id: "residentLanguages",
            label: "Primary languages of residents/families",
            type: "text",
            hint: "Languages only — no names.",
          },
        ],
      },
    ],
  },

  /* ── EP supplement ────────────────────────────────────────────── */
  {
    id: "ep",
    title: "Emergency Preparedness Supplement",
    shortTitle: "Emergency Prep",
    desc: "Your emergency plan is populated to your actual building. Describe locations in plain words — no drawings needed.",
    visible: (a) => ordered(a, EP_TRIGGERS),
    groups: [
      {
        title: "Building & evacuation",
        fields: [
          { id: "buildingLayout", label: "Building floors / layout notes", type: "textarea", required: true, placeholder: "e.g. Single story, two wings, 12 units, sprinklered throughout" },
          { id: "evacuationPrimary", label: "Primary evacuation route", type: "textarea", required: true, placeholder: "Describe in words — exits used, direction of travel" },
          { id: "evacuationSecondary", label: "Secondary evacuation route", type: "textarea", required: true },
          { id: "assemblyPoint", label: "Outdoor assembly point", type: "text", required: true },
          { id: "relocationSite", label: "Temporary relocation site", type: "text", required: true },
          { id: "transferPartner", label: "Transfer agreement partner", type: "text", hint: "The organization you have (or plan to have) a relocation agreement with." },
          { id: "transportation", label: "Transportation arrangement", type: "text", required: true, hint: "How residents would be moved in a relocation." },
        ],
      },
      {
        title: "Utilities & equipment",
        fields: [
          { id: "utilityGas", label: "Gas shutoff location", type: "text", required: true },
          { id: "utilityWater", label: "Water shutoff location", type: "text", required: true },
          { id: "utilityElectric", label: "Electric shutoff location", type: "text", required: true },
          { id: "generator", label: "Generator on site?", type: "radio", required: true, options: YES_NO },
          {
            id: "generatorDetails",
            label: "Generator details",
            type: "text",
            hint: "Type, what it powers, fuel.",
            showIf: (a) => a.generator === "Yes",
          },
          { id: "oxygenCount", label: "Residents using oxygen (count)", type: "number", required: true, hint: "A number only — no names." },
          { id: "powerEquipCount", label: "Residents with power-dependent equipment (count)", type: "number", required: true, hint: "A number only — no names." },
          { id: "mobilityConsiderations", label: "Mobility considerations", type: "textarea", hint: "In general terms — e.g. number of residents needing evacuation assistance. No names." },
        ],
      },
      {
        title: "Staffing & notification",
        fields: [
          { id: "overnightStaffing", label: "Overnight staffing pattern", type: "text", required: true, placeholder: "e.g. 1 awake staff, 1 on-call" },
          { id: "notificationTree", label: "Emergency notification tree — who calls whom", type: "textarea", required: true, placeholder: "e.g. On-shift staff calls the AL Director, who calls the owner and families' contacts" },
          { id: "countyEmContact", label: "County emergency management contact (if known)", type: "text" },
        ],
      },
    ],
  },

  /* ── Survey Master supplement ─────────────────────────────────── */
  {
    id: "surveyMaster",
    title: "Survey Master Supplement",
    shortTitle: "Survey Master",
    desc: "Your survey-day command binder is built around your survey history and who does what when MDH arrives.",
    visible: (a) => ordered(a, SURVEY_MASTER_TRIGGERS),
    groups: [
      {
        title: "Survey history",
        fields: [
          { id: "lastSurveyDate", label: "Most recent MDH survey date", type: "date", hint: "Leave blank if you haven't been surveyed yet." },
          { id: "deficienciesCount", label: "Deficiencies cited (count)", type: "number" },
          {
            id: "pocClosed",
            label: "Plan of correction closed?",
            type: "radio",
            options: [...YES_NO, { value: "N/A", label: "Not applicable" }],
          },
        ],
      },
      {
        title: "Survey-day role assignments",
        fields: [
          { id: "surveyLead", label: "Survey lead", type: "text", required: true },
          { id: "clinicalLiaison", label: "Clinical liaison", type: "text", required: true },
          { id: "recordsRole", label: "Records", type: "text", required: true },
          { id: "escortRole", label: "Escort", type: "text", required: true },
          { id: "documenterRole", label: "Documenter", type: "text", required: true },
        ],
      },
      {
        fields: [
          { id: "mockSurveyPractice", label: "Do you practice with mock surveys?", type: "radio", required: true, options: YES_NO },
          {
            id: "mockSurveyLastDate",
            label: "Last mock survey date",
            type: "date",
            showIf: (a) => a.mockSurveyPractice === "Yes",
          },
        ],
      },
    ],
  },

  /* ── CL Layer supplement ──────────────────────────────────────── */
  {
    id: "cl",
    title: "Customized Living Supplement",
    shortTitle: "CL Layer",
    desc: "Because you bill DHS for Customized Living, your set includes the CL documentation layer.",
    visible: (a) => a.dhsBilling === "Yes",
    groups: [
      {
        fields: [
          { id: "dhsEnrollmentId", label: "DHS provider enrollment ID", type: "text", required: true },
          { id: "enrollmentEffectiveDate", label: "Enrollment effective date", type: "date" },
          {
            id: "waivers",
            label: "Waivers contracted",
            type: "checkboxes",
            required: true,
            options: [
              opt("EW"),
              opt("CADI"),
              opt("BI"),
              opt("Housing Support"),
            ],
          },
          {
            id: "clType",
            label: "Customized Living type",
            type: "radio",
            required: true,
            options: [
              opt("Standard CL"),
              opt("24-hour CL"),
              opt("Both"),
            ],
          },
          { id: "waiverCensus", label: "Approximate waiver census (count)", type: "number", hint: "A number only — no names." },
          { id: "billingSoftware", label: "Billing software", type: "text" },
          { id: "billingBaa", label: "BAA on file with billing software vendor?", type: "radio", options: YES_NO },
          { id: "clCounties", label: "Primary counties & case-manager agencies", type: "textarea" },
          { id: "pastAudits", label: "Past DHS audits?", type: "radio", required: true, options: YES_NO },
        ],
      },
    ],
  },

  /* ── Kitchen supplement ───────────────────────────────────────── */
  {
    id: "kitchen",
    title: "Kitchen Supplement",
    shortTitle: "Kitchen",
    desc: "Two details your Kitchen Survey Binder is built around.",
    visible: (a) => ordered(a, KITCHEN_TRIGGERS),
    groups: [
      {
        fields: [
          { id: "cfpmName", label: "Certified food protection manager — name", type: "text", required: true },
          { id: "cfpmCertDate", label: "Certification date", type: "date", required: true },
          { id: "menuCycleLength", label: "Menu cycle length", type: "text", required: true, placeholder: "e.g. 4 weeks" },
        ],
      },
    ],
  },

  /* ── Dementia supplement ──────────────────────────────────────── */
  {
    id: "dementia",
    title: "Dementia Care Supplement",
    shortTitle: "Dementia Care",
    desc: "Because you hold a dementia care license, a couple of unit details are needed.",
    visible: (a) => a.dementiaLicense === "Yes",
    groups: [
      {
        fields: [
          { id: "securedUnit", label: "Secured unit?", type: "radio", required: true, options: YES_NO },
          {
            id: "unitCapacity",
            label: "Unit capacity",
            type: "number",
            required: true,
            hint: "Number of beds/units — no names.",
            showIf: (a) => a.securedUnit === "Yes",
          },
        ],
      },
    ],
  },
];

/** The steps visible for a given answer set (order preserved). */
export function visibleSteps(a: Answers): StepDef[] {
  return steps.filter((s) => !s.visible || s.visible(a));
}

/** Fields of a step visible for a given answer set. */
export function visibleFields(step: StepDef, a: Answers): FieldDef[] {
  return step.groups
    .flatMap((g) => g.fields)
    .filter((f) => !f.showIf || f.showIf(a));
}

/** Validate one step. Returns { fieldId: message }. */
export function validateStep(step: StepDef, a: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const f of visibleFields(step, a)) {
    const v = a[f.id];
    const empty =
      v === undefined ||
      v === "" ||
      (Array.isArray(v) && v.length === 0);
    if (f.required && empty) {
      errors[f.id] = "This field is required.";
      continue;
    }
    if (!empty && f.type === "number" && typeof v === "string") {
      if (!/^\d+$/.test(v.trim())) {
        errors[f.id] = "Please enter a whole number (0 or more).";
      }
    }
  }
  return errors;
}

/** Human-readable label for a stored value (resolves option ids). */
export function displayValue(field: FieldDef, a: Answers): string {
  const v = a[field.id];
  if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) {
    return "—";
  }
  const resolve = (x: string) =>
    field.options?.find((o) => o.value === x)?.label ?? x;
  let out = Array.isArray(v) ? v.map(resolve).join(", ") : resolve(v);
  if (field.allowOther) {
    const other = a[field.id + "Other"];
    if (typeof other === "string" && other.trim() !== "") {
      out += Array.isArray(v) && v.length > 0 ? `, Other: ${other}` : `Other: ${other}`;
    }
  }
  return out;
}

/**
 * Build the structured submission object: step title → field label → value.
 * Only visible steps/fields are included.
 */
export function buildSubmission(a: Answers): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const step of visibleSteps(a)) {
    const section: Record<string, string> = {};
    for (const f of visibleFields(step, a)) {
      section[f.label] = displayValue(f, a);
    }
    out[step.title] = section;
  }
  return out;
}

/** Plain-text summary for download/print. */
export function buildSummaryText(a: Answers): string {
  const lines: string[] = [
    "ASCEND SENIOR CONSULTING — FACILITY INTAKE SUMMARY",
    `Generated: ${new Date().toLocaleString("en-US")}`,
    "",
  ];
  for (const step of visibleSteps(a)) {
    lines.push(step.title.toUpperCase());
    lines.push("-".repeat(step.title.length));
    for (const f of visibleFields(step, a)) {
      lines.push(`${f.label}: ${displayValue(f, a)}`);
    }
    lines.push("");
  }
  lines.push(
    "Note: this intake contains no resident names or resident health information.",
  );
  return lines.join("\n");
}
