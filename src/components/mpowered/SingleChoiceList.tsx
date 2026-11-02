import { scaleFont, scaleHeight, scaleWidth } from '@/services/scale';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { ChoiceCard } from './ChoiceCard';

import { makeStyles } from '@/constants/theme';
interface SingleChoiceProps {
  titleText: string,
  questionNumber?: number;
  totalQuestions?: number;
  options?: string[];
  onRecord?: () => void;
  onSelectionChange?: (selectedIndex: number) => void;
  onPrevious?: () => void;
  previousDisabled?: boolean;
  variant?: 'default' | 'painTracker' | 'personalCare';
  selectedIndex?: number | null;
  cardHeight?: number;
  /** Scroll options inside a fixed-height box (personalCare only). Set false to let the list grow to fit. */
  scrollable?: boolean;
}



export function SingleChoiceInput({
  titleText,
  questionNumber,
  totalQuestions,
  options,
  onRecord,
  onSelectionChange,
  onPrevious,
  previousDisabled = false,
  variant = 'default',
  selectedIndex: controlledSelectedIndex,
  cardHeight,
  scrollable = true,
}: SingleChoiceProps) {
  const optionStyles = useOptionStyles();
  const stylesSheet = useStylesSheet();
  const isScrollable = variant === 'personalCare' && scrollable;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentSelectedIndex = controlledSelectedIndex !== undefined ? controlledSelectedIndex : selectedIndex;

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange?.(index);
  };

  const prompt = (
    <Text style={[stylesSheet.promptText, variant === 'personalCare' && stylesSheet.personalCarePromptText]}>
      Select the <Text style={stylesSheet.promptUnderline}>MOST</Text> relevant statement:
    </Text>
  );

  return (
    <ChoiceCard
      title={titleText}
      prompt={prompt}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
      onPrevious={onPrevious}
      previousDisabled={previousDisabled}
      disabled={currentSelectedIndex === null}
      cardHeight={cardHeight}
      variant={variant}
    >
      <View
        style={[
          variant === 'personalCare' && optionStyles.personalCareList,
          isScrollable && optionStyles.personalCareListFixedHeight,
        ]}
      >
      {/* Rows grow with their text, so long options scroll inside the box on small screens. */}
      <ScrollView bounces={false} scrollEnabled={isScrollable}>
      {options?.map((option, index) => {
        const isSelected = index === currentSelectedIndex;
        const isLast = index === options.length - 1;

        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(index)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isSelected }}
            accessibilityLabel={option}
            style={[
              optionStyles.row,
              variant === 'personalCare' && optionStyles.personalCareRow,
              !isLast && (variant === 'personalCare' ? optionStyles.personalCareRowDivider : optionStyles.rowDivider),
            ]}
          >
            <View
              style={[
                optionStyles.circle,
                variant === 'personalCare' && optionStyles.personalCareCircle,
                isSelected && optionStyles.circleSelected,
              ]}
            >
              {isSelected && <View style={optionStyles.circleDot} />}
            </View>
            <Text style={[optionStyles.label, variant === 'personalCare' && optionStyles.personalCareLabel]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
      </ScrollView>
      </View>
    </ChoiceCard>
  );
}

const useStylesSheet = makeStyles((colors) => ({
  promptText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
  promptUnderline: {
    textDecorationLine: 'underline',
  },
  personalCarePromptText: {
    fontSize: scaleFont(12),
    fontWeight: '500',
    lineHeight: scaleHeight(16),
    letterSpacing: 0.5,
    color: colors.text,
  },
}));

const useOptionStyles = makeStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(16),
    minWidth: 0,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  personalCareList: {
    width: '96%',
    marginLeft: scaleWidth(4),
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: scaleWidth(12),
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  personalCareListFixedHeight: {
    flex: 1,
    minHeight: 0,
  },
  personalCareRow: {
    minHeight: scaleHeight(56),
    paddingVertical: scaleHeight(8),
    paddingHorizontal: scaleWidth(16),
    gap: scaleWidth(16),
  },
  personalCareRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  circle: {
    width: scaleWidth(22),
    height: scaleWidth(22),
    borderRadius: scaleWidth(11),
    borderWidth: 2,
    borderColor: colors.controlBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleWidth(16),
    flexShrink: 0,
  },
  personalCareCircle: {
    width: scaleWidth(20),
    height: scaleWidth(20),
    borderRadius: scaleWidth(10),
    borderColor: colors.outlineStrong,
    marginRight: 0,
  },
  circleSelected: {
    borderColor: colors.primary,
  },
  circleDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    backgroundColor: colors.primary,
  },
  label: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: colors.text,
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  personalCareLabel: {
    fontSize: scaleFont(14),
    fontWeight: '500',
    lineHeight: scaleHeight(20),
    letterSpacing: 0.25,
    color: colors.text,
  },
}));