/**
 * The binder catalog. This is the single source of truth for products, prices,
 * and bundles — edit here and every page (shop grid, detail pages, order form,
 * intake) updates.
 *
 * Each product carries a stable `id` and a price in whole dollars so Stripe
 * Checkout can be swapped in later (map `id` → Stripe Price ID, price × 100 =
 * unit_amount in cents). The site currently ships with an order-request flow:
 * binders are populated to the facility, so every order begins with a
 * conversation and a facility intake, not an instant checkout.
 */

export type ProductSection =
  | "governance"
  | "operations"
  | "people"
  | "addons";

export interface Product {
  id: string;
  name: string;
  /** Short name used in tight spaces (cart rows, intake checklists). */
  shortName: string;
  price: number;
  section: ProductSection;
  /** One-line description used on the shop grid card. */
  blurb: string;
  /** Fuller description for the product detail page. */
  description: string[];
  /** What's inside — bullet list on the detail page. */
  contents: string[];
  /** TODO(owner): per-product copy for the two-column customization block. */
  customized: string[];
  maintained: string[];
  /** Which intake supplement(s) this product triggers, if any. */
  intakeSupplements?: ("ep" | "surveyMaster" | "kitchen")[];
}

export interface Bundle {
  id: string;
  name: string;
  price: number;
  alaCartePrice: number;
  blurb: string;
  description: string[];
  /** Display list for the card. */
  contents: string[];
  contentsNote?: string;
  /**
   * Product ids this bundle covers — used to warn when a cart holds both a
   * bundle and one of its component binders, and to scope the intake wizard's
   * supplements to a purchase. Where the bundle includes "an EP binder"
   * without fixing the size, both EP ids are listed.
   */
  componentIds: string[];
}

export const sectionMeta: Record<
  ProductSection,
  { title: string; note?: string }
> = {
  governance: { title: "Governance & Survey Readiness" },
  operations: { title: "Operations & Safety" },
  people: { title: "People & Records" },
  addons: {
    title: "Add-On Modules",
    note: "for facilities holding additional licenses or enrollments",
  },
};

/* TODO(owner): the `customized` / `maintained` lists below are structural
   placeholders. Replace each with the real per-product breakdown of what gets
   populated to the facility vs. what Ascend keeps statute-current. */
const CUSTOMIZED_TODO = [
  "TODO: List what gets populated to this facility — names, roles, license details, building specifics.",
];
const MAINTAINED_TODO = [
  "TODO: List what Ascend maintains — statute currency, form versions, regulatory updates.",
];

export const products: Product[] = [
  /* ── GOVERNANCE & SURVEY READINESS ─────────────────────────────── */
  {
    id: "policy-procedures-manual",
    name: "Policy & Procedures Manual",
    shortName: "Policy & Procedures",
    price: 949,
    section: "governance",
    blurb:
      "89 statute-current policies: governance, resident rights, admission→discharge, clinical care, medication management, HR, records, quality.",
    description: [
      "The backbone of your compliance program: 89 statute-current policies covering everything a surveyor expects to see, populated to your facility.",
      "Every policy is organized the way surveys actually run — so when a surveyor asks for your medication management policy, you open a tab, not a search window.",
    ],
    contents: [
      "Governance and administration",
      "Resident rights",
      "Admission through discharge",
      "Clinical care",
      "Medication management",
      "Human resources",
      "Records",
      "Quality",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "forms-manual",
    name: "Forms Manual",
    shortName: "Forms Manual",
    price: 795,
    section: "governance",
    blurb:
      "100+ operational forms: admission packet & contract exhibits, every required legal notice, clinical assessments, incident & medication forms, hiring stack.",
    description: [
      "More than 100 operational forms, ready to use the day the binder arrives — from the admission packet through the hiring stack.",
      "Every required legal notice is included, so nothing gets improvised when it matters.",
    ],
    contents: [
      "Admission packet & contract exhibits",
      "Every required legal notice",
      "Clinical assessments",
      "Incident & medication forms",
      "Hiring stack",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "survey-master-binder",
    name: "Survey Master Binder",
    shortName: "Survey Master",
    price: 695,
    section: "governance",
    blurb:
      "Survey-day command binder: cross-binder index, MDH worksheet crosswalks, mock-survey program, plan-of-correction tools, citation defenses.",
    description: [
      "The binder you hand your team on survey day. A cross-binder index and MDH worksheet crosswalks put every document a surveyor asks for one tab away.",
      "Includes a mock-survey program to practice with, plan-of-correction tools, and citation defenses.",
    ],
    contents: [
      "Cross-binder index",
      "MDH worksheet crosswalks",
      "Mock-survey program",
      "Plan-of-correction tools",
      "Citation defenses",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
    intakeSupplements: ["surveyMaster"],
  },

  /* ── OPERATIONS & SAFETY ───────────────────────────────────────── */
  {
    id: "ep-binder-small",
    name: "Emergency Preparedness Binder — Small Operation (1–5 beds)",
    shortName: "EP Binder (Small)",
    price: 649,
    section: "operations",
    blurb:
      "Complete emergency plan populated to your building: evacuation, relocation, MOUs, communication, drills, missing-resident plan.",
    description: [
      "A complete emergency plan populated to your building — not a template with blanks. Evacuation, relocation, MOUs, communication, drills, and the missing-resident plan, all specific to your address.",
      "Sized for small operations of one to five beds.",
    ],
    contents: [
      "Evacuation plan",
      "Relocation plan",
      "MOUs",
      "Communication plan",
      "Drill program",
      "Missing-resident plan",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
    intakeSupplements: ["ep"],
  },
  {
    id: "ep-binder-large",
    name: "Emergency Preparedness Binder — Large Operation",
    shortName: "EP Binder (Large)",
    price: 749,
    section: "operations",
    blurb:
      "Adds department leads and expanded coordination structure.",
    description: [
      "Everything in the Emergency Preparedness Binder, built for larger operations: adds department leads and an expanded coordination structure.",
    ],
    contents: [
      "Everything in the small-operation binder",
      "Department leads",
      "Expanded coordination structure",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
    intakeSupplements: ["ep"],
  },
  {
    id: "qapi-binder",
    name: "QAPI Binder",
    shortName: "QAPI",
    price: 395,
    section: "operations",
    blurb:
      "The mandated quality program ready to run: committee, cadence, trending logs, improvement projects.",
    description: [
      "The quality program the statute requires — assembled and ready to run. Committee structure, meeting cadence, trending logs, and improvement projects.",
    ],
    contents: [
      "Committee structure",
      "Meeting cadence",
      "Trending logs",
      "Improvement projects",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "hipaa-binder",
    name: "HIPAA Compliance Binder",
    shortName: "HIPAA",
    price: 445,
    section: "operations",
    blurb:
      "Complete privacy program: officers, risk analysis, notices, safeguards, breach response, BAA tracking.",
    description: [
      "A complete privacy program: designated officers, risk analysis, required notices, safeguards, breach response, and BAA tracking.",
    ],
    contents: [
      "Privacy & security officers",
      "Risk analysis",
      "Notices",
      "Safeguards",
      "Breach response",
      "BAA tracking",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "facility-operations-binder",
    name: "Facility Operations Binder",
    shortName: "Facility Operations",
    price: 395,
    section: "operations",
    blurb:
      "Life-safety inspection logs, OSHA 300, bloodborne pathogen plan, hazard communication, waste & water management.",
    description: [
      "The physical-plant side of compliance in one place: life-safety inspection logs, OSHA 300, the bloodborne pathogen plan, hazard communication, and waste & water management.",
    ],
    contents: [
      "Life-safety inspection logs",
      "OSHA 300",
      "Bloodborne pathogen plan",
      "Hazard communication",
      "Waste & water management",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "contracts-vendor-binder",
    name: "Contracts & Vendor Binder",
    shortName: "Contracts & Vendor",
    price: 295,
    section: "operations",
    blurb:
      "Vendor inventory, contract index, insurance & renewal tracking, emergency MOUs, pharmacy agreement.",
    description: [
      "Every agreement your facility depends on, indexed and tracked: vendor inventory, contract index, insurance & renewal tracking, emergency MOUs, and the pharmacy agreement.",
    ],
    contents: [
      "Vendor inventory",
      "Contract index",
      "Insurance & renewal tracking",
      "Emergency MOUs",
      "Pharmacy agreement",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "kitchen-survey-binder",
    name: "Kitchen Survey Binder",
    shortName: "Kitchen Survey",
    price: 449,
    section: "operations",
    blurb:
      "Food-code compliance: credentials, menus, therapeutic diets, temperature & sanitation logs, emergency food supply.",
    description: [
      "Food-code compliance from credentials to the emergency food supply: menus, therapeutic diets, and temperature & sanitation logs, organized for the kitchen walk-through.",
    ],
    contents: [
      "Credentials",
      "Menus",
      "Therapeutic diets",
      "Temperature & sanitation logs",
      "Emergency food supply",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
    intakeSupplements: ["kitchen"],
  },
  {
    id: "fsep",
    name: "Fire Safety & Evacuation Plan (FSEP)",
    shortName: "FSEP",
    price: 369,
    section: "operations",
    blurb:
      "The statutory fire plan: profile, written FSEP, diagrams, drill logs, training records, system service logs.",
    description: [
      "The statutory fire plan, complete: facility profile, the written FSEP, diagrams, drill logs, training records, and system service logs.",
    ],
    contents: [
      "Facility profile",
      "Written FSEP",
      "Diagrams",
      "Drill logs",
      "Training records",
      "System service logs",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },

  /* ── PEOPLE & RECORDS ──────────────────────────────────────────── */
  {
    id: "nursing-survey-binder",
    name: "Nursing Survey Binder",
    shortName: "Nursing Survey",
    price: 895,
    section: "people",
    blurb:
      "The clinical nurse supervisor's survey briefcase: staffing coverage, delegation, medication audits, controlled-substance archive, falls & wound QA.",
    description: [
      "The clinical nurse supervisor's survey briefcase. Staffing coverage, delegation, medication audits, the controlled-substance archive, and falls & wound QA — everything the clinical side of a survey reaches for.",
    ],
    contents: [
      "Staffing coverage",
      "Delegation",
      "Medication audits",
      "Controlled-substance archive",
      "Falls & wound QA",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "resident-binder-system",
    name: "Resident Binder System",
    shortName: "Resident Binders",
    price: 595,
    section: "people",
    blurb:
      "12-tab resident chart structure: master + five assembled shells (names and clinical content are added at your facility).",
    description: [
      "A 12-tab resident chart structure: one master plus five assembled shells, ready for your team to use.",
      "Names and clinical content are added at your facility — no resident information ever passes through Ascend.",
    ],
    contents: [
      "12-tab chart structure",
      "One master binder",
      "Five assembled shells",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "personnel-binder-system",
    name: "Personnel Binder System",
    shortName: "Personnel Binders",
    price: 495,
    section: "people",
    blurb:
      "13-tab employee file structure: master + five shells, aligned to the MDH personnel worksheet.",
    description: [
      "A 13-tab employee file structure aligned to the MDH personnel worksheet: one master plus five shells, so every file is survey-ready from day one.",
    ],
    contents: [
      "13-tab employee file structure",
      "One master binder",
      "Five assembled shells",
      "Aligned to the MDH personnel worksheet",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "training-competency-binder",
    name: "Training & Competency Binder",
    shortName: "Training & Competency",
    price: 445,
    section: "people",
    blurb:
      "Required-topics matrix, orientation curriculum, trackers, competency checklists, return-demonstration logs.",
    description: [
      "Training compliance you can show a surveyor: the required-topics matrix, orientation curriculum, trackers, competency checklists, and return-demonstration logs.",
    ],
    contents: [
      "Required-topics matrix",
      "Orientation curriculum",
      "Trackers",
      "Competency checklists",
      "Return-demonstration logs",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },

  /* ── ADD-ON MODULES ────────────────────────────────────────────── */
  {
    id: "dementia-care-addon",
    name: "Dementia Care Add-On",
    shortName: "Dementia Care Add-On",
    price: 495,
    section: "addons",
    blurb:
      "Secured-unit procedures, safety risk assessment, sprinkler-deadline tracking, enhanced training curriculum, disclosures.",
    description: [
      "For facilities holding the dementia care license: secured-unit procedures, safety risk assessment, sprinkler-deadline tracking, the enhanced training curriculum, and disclosures.",
    ],
    contents: [
      "Secured-unit procedures",
      "Safety risk assessment",
      "Sprinkler-deadline tracking",
      "Enhanced training curriculum",
      "Disclosures",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
  {
    id: "customized-living-layer",
    name: "Customized Living (CL) Layer",
    shortName: "CL Layer",
    price: 595,
    section: "addons",
    blurb:
      "For DHS waiver billers: enrollment records, authorization trackers, service log templates, billing reconciliation, DHS audit prep.",
    description: [
      "For facilities billing DHS for Customized Living: enrollment records, authorization trackers, service log templates, billing reconciliation, and DHS audit prep.",
    ],
    contents: [
      "Enrollment records",
      "Authorization trackers",
      "Service log templates",
      "Billing reconciliation",
      "DHS audit prep",
    ],
    customized: CUSTOMIZED_TODO,
    maintained: MAINTAINED_TODO,
  },
];

export const bundles: Bundle[] = [
  {
    id: "survey-ready-core",
    name: "Survey-Ready Core",
    price: 1995,
    alaCartePrice: 2439,
    blurb: "The three binders every survey opens with.",
    description: [
      "The governance backbone in one order: the Policy & Procedures Manual, the Forms Manual, and the Survey Master Binder.",
    ],
    contents: [
      "Policy & Procedures Manual",
      "Forms Manual",
      "Survey Master Binder",
    ],
    componentIds: [
      "policy-procedures-manual",
      "forms-manual",
      "survey-master-binder",
    ],
  },
  {
    id: "license-essentials",
    name: "License Essentials",
    price: 3795,
    alaCartePrice: 4823,
    blurb: "The Core plus the programs surveyors ask about by name.",
    description: [
      "Everything in the Survey-Ready Core, plus Emergency Preparedness, QAPI, HIPAA, the Nursing Survey Binder, and Training & Competency.",
    ],
    contents: [
      "Survey-Ready Core (P&P + Forms + Survey Master)",
      "Emergency Preparedness Binder",
      "QAPI Binder",
      "HIPAA Compliance Binder",
      "Nursing Survey Binder",
      "Training & Competency Binder",
    ],
    componentIds: [
      "policy-procedures-manual",
      "forms-manual",
      "survey-master-binder",
      "ep-binder-small",
      "ep-binder-large",
      "qapi-binder",
      "hipaa-binder",
      "nursing-survey-binder",
      "training-competency-binder",
    ],
  },
  {
    id: "complete-compliance-library",
    name: "Complete Compliance Library",
    price: 5495,
    alaCartePrice: 7866,
    blurb: "All fifteen core binders — the whole shelf, populated to your facility.",
    description: [
      "Every core binder in the library, populated to your facility and delivered as one coordinated set.",
    ],
    contents: ["All fifteen core binders"],
    contentsNote:
      "Add-On Modules (Dementia Care, CL Layer) can be added for facilities holding those licenses or enrollments.",
    componentIds: [
      "policy-procedures-manual",
      "forms-manual",
      "survey-master-binder",
      "ep-binder-small",
      "ep-binder-large",
      "qapi-binder",
      "hipaa-binder",
      "facility-operations-binder",
      "contracts-vendor-binder",
      "kitchen-survey-binder",
      "fsep",
      "nursing-survey-binder",
      "resident-binder-system",
      "personnel-binder-system",
      "training-competency-binder",
    ],
  },
];

/* ── helpers ─────────────────────────────────────────────────────── */

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getBundle(id: string): Bundle | undefined {
  return bundles.find((b) => b.id === id);
}

/** Any orderable item (product or bundle) by id — used by the order form. */
export function getOrderable(
  id: string,
): { id: string; name: string; price: number } | undefined {
  return getProduct(id) ?? getBundle(id);
}

export function productsInSection(section: ProductSection): Product[] {
  return products.filter((p) => p.section === section);
}

export function formatPrice(n: number): string {
  return "$" + n.toLocaleString("en-US");
}

/**
 * Expand a list of ordered item ids so bundles contribute their component
 * binders — used to scope the intake wizard's supplements to a purchase.
 * The original ids (including bundle ids) are preserved alongside.
 */
export function expandItems(ids: string[]): string[] {
  const out = new Set<string>();
  for (const id of ids) {
    out.add(id);
    const bundle = getBundle(id);
    if (bundle) bundle.componentIds.forEach((c) => out.add(c));
  }
  return [...out];
}

/**
 * Cart sanity check: bundles already include their component binders. Returns
 * the ids of individual products in `ids` that a bundle in `ids` also covers.
 */
export function findBundleDuplicates(ids: string[]): string[] {
  const covered = new Set<string>();
  for (const id of ids) {
    const bundle = getBundle(id);
    if (bundle) bundle.componentIds.forEach((c) => covered.add(c));
  }
  return ids.filter((id) => covered.has(id) && getProduct(id));
}

/** Featured on the home page binder-library teaser. */
export const featuredProductIds = [
  "policy-procedures-manual",
  "survey-master-binder",
  "ep-binder-small",
];
