/**
 * Site-wide configuration. Values that the owner may need to change live here
 * or in environment variables (see README).
 */

export const site = {
  name: "Ascend Senior Consulting",
  tagline: "Expert Guidance for Assisted Living & Home Care Providers",
  phone: "651.260.0248",
  phoneHref: "tel:+16512600248",
  /**
   * Owner email shown on the site. Configure with NEXT_PUBLIC_OWNER_EMAIL.
   * The placeholder is intentionally obvious so it gets configured before launch.
   */
  ownerEmail:
    process.env.NEXT_PUBLIC_OWNER_EMAIL || "owner@ascendseniorconsulting.com",
  serviceArea: "Serving Minnesota assisted living and home care providers",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://ascendseniorconsulting.com",
};

export const nav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/shop", label: "Binder Shop" },
  { href: "/contact", label: "Contact" },
];

export const consultationTypes = [
  "Compliance Consultation",
  "Mock Survey Inquiry",
  "Post-Survey Correction Support",
  "Binder Working Session",
];
