import { createAssessmentContext } from '../createAssessmentContext';
import { ManagementAssessmentAnswers } from './types';

export const {
  Provider: ManagementAssessmentProvider,
  useAssessment: useManagementAssessment,
} = createAssessmentContext<ManagementAssessmentAnswers>();