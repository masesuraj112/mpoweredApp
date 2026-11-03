import { ChoiceRow } from './ChoiceRow';

interface AssessmentRadioRowProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
}

/** A pick-one answer in an assessment list (see ChoiceRow). */
export function AssessmentRadioRow({ label, selected, onPress, isLast = false }: AssessmentRadioRowProps) {
  return <ChoiceRow kind="radio" label={label} selected={selected} onPress={onPress} isLast={isLast} />;
}
