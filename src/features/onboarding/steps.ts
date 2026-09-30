/** The first questions, in order; each is a screen at /onboarding/{step}, starting at /onboarding/who. */
export const STEPS = ['who', 'background', 'faith', 'events', 'date', 'place'] as const;

export type Step = (typeof STEPS)[number];

/** 1-based position, for "2 of 7" and the progress bar. */
export function stepNumber(step: Step): number {
  return STEPS.indexOf(step) + 1;
}

/** The screen after this one: the next question, or the plan once it's ready. */
export function nextHref(step: Step): `/onboarding/${Step}` | '/onboarding/ready' {
  const next = STEPS[STEPS.indexOf(step) + 1];
  return next ? `/onboarding/${next}` : '/onboarding/ready';
}
