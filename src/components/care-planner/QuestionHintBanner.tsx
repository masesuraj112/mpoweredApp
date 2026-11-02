import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import { Radius, Spacing, makeStyles } from '@/constants/theme';

const lightbulbIcon = require('../../../assets/images/care-planner/lightbulb.png');

type QuestionHintBannerProps = {
  message: string;
};

/** A short tip with a light bulb icon. */
export function QuestionHintBanner({ message }: QuestionHintBannerProps) {
  const styles = useStyles();
  return (
    <View style={styles.banner}>
      <Image
        source={lightbulbIcon}
        contentFit="contain"
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={styles.icon}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const useStyles = makeStyles((colors) => ({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.control,
    backgroundColor: colors.backgroundElement,
  },
  icon: {
    width: 32,
    height: 24,
  },
  text: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
    color: colors.text,
  },
}));
