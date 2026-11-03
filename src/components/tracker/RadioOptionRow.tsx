import { OptionRow } from './OptionRow';

type RadioOptionRowProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  /** The last row has no rule under it. */
  isLast?: boolean;
};

/** One answer in a pick-one list. The whole row is the tap target and grows with its text. */
export function RadioOptionRow(props: RadioOptionRowProps) {
  return <OptionRow {...props} kind="radio" />;
}
