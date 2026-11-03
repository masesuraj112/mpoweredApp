import { OptionRow } from '@/components/ui/OptionRow';

type CheckboxOptionRowProps = {
  label: string;
  /** A smaller line under the label. */
  supportingText?: string;
  selected: boolean;
  onPress: () => void;
  /** The last row has no rule under it. */
  isLast?: boolean;
};

/** One answer in a pick-any list. The whole row is the tap target and grows with its text. */
export function CheckboxOptionRow(props: CheckboxOptionRowProps) {
  return <OptionRow {...props} kind="checkbox" />;
}
