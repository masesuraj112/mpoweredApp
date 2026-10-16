import { createAssessmentContext } from '../createAssessmentContext';
import { PainAssessmentAnswers } from './types';

export const { Provider: PainAssessmentProvider, useAssessment: usePainAssessment } =
  createAssessmentContext<PainAssessmentAnswers>('@mpowered/assessment-draft/v1/pain');

  