import { createAssessmentContext } from '../createAssessmentContext';
import { PersonalCareAssessmentAnswers } from './types';

export const {
  Provider: PersonalCareAssessmentProvider,
  useAssessment: usePersonalCareAssessment,
} = createAssessmentContext<PersonalCareAssessmentAnswers>();