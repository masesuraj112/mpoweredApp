import { HeroLead, HeroTitle } from '@/components/ui/BrandScreen';

/** The Care Planner's title and lead, shown on the brand gradient at the top of its home. */
export function PlannerIntro() {
  return (
    <>
      <HeroTitle>Plan your visit with confidence</HeroTitle>
      <HeroLead>
        Get ready for your visit. Prepare questions, add support people, and keep notes during your appointments.
      </HeroLead>
    </>
  );
}
