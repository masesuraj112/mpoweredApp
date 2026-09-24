import { createAssessmentContext } from '../createAssessmentContext';
import { PainAssessmentAnswers } from './types';

export const { Provider: PainAssessmentProvider, useAssessment: usePainAssessment } =
  createAssessmentContext<PainAssessmentAnswers>();

  