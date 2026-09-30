import { createAssessmentContext } from '../createAssessmentContext';
import { SocialHealthAssessmentAnswers } from './types';

export const {
  Provider: SocialHealthAssessmentProvider,
  useAssessment: useSocialHealthAssessment,
} = createAssessmentContext<SocialHealthAssessmentAnswers>();