import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import IntakeWizard from "./IntakeWizard";

export const metadata: Metadata = {
  title: "Facility Intake",
  description:
    "Complete your binder customization intake online. Your answers determine how each binder is populated to your facility. Progress saves automatically — no resident information is collected.",
};

export default function IntakePage() {
  return (
    <>
      <div className="no-print">
        <PageHero
          eyebrow="Binder Customization"
          title="Facility Intake"
          lede="Your answers here are what make your binders yours — names, license details, building specifics. Only the sections that apply to your order will appear. Progress saves automatically, so you can step away and come back."
        />
      </div>
      <div
        className="section"
        style={{ maxWidth: 880, margin: "0 auto", width: "100%" }}
      >
        <IntakeWizard />
      </div>
    </>
  );
}
