import { usePathname } from 'expo-router';
import { View, Text } from 'react-native';

type Step = { path: string; label: string };

type Props = {
  steps: readonly Step[];
  title: string;
};

export function AssessmentProgressHeader({ steps, title }: Props) {
  const pathname = usePathname();
  const currentIndex = steps.findIndex(s => s.path === pathname);
  const isSummary = currentIndex === -1;

  return (
    <View>
    </View>
  );
}