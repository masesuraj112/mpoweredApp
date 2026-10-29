import { createAssessmentContext } from '../createAssessmentContext';
import { MovementAssessmentAnswers } from './types';

export const {
  Provider: MovementAssessmentProvider,
  useAssessment: useMovementAssessment,
} = createAssessmentContext<MovementAssessmentAnswers>('@mpowered/assessment-draft/v1/movement');