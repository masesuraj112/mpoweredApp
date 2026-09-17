import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { scaleWidth, scaleHeight, scaleFont } from '@/services/scale';
import { ChoiceCard } from './ChoiceCard';

interface SingleChoiceProps {
  questionNumber?: number;
  totalQuestions?: number;
  options?: string[];
  onRecord?: () => void;
  onSelectionChange?: (selectedIndex: number) => void;
}

const DEFAULT_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

export function SingleChoiceInput({
  questionNumber,
  totalQuestions,
  options = DEFAULT_OPTIONS,
  onRecord,
  onSelectionChange,
}: SingleChoiceProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleSelect = (index: number) => {
    setSelectedIndex(index);
    onSelectionChange?.(index);
  };

  const prompt = (
    <Text style={stylesSheet.promptText}>
      Select the <Text style={stylesSheet.promptUnderline}>MOST</Text> relevant statement:
    </Text>
  );

  return (
    <ChoiceCard
      title="Walking Impacts"
      prompt={prompt}
      questionNumber={questionNumber}
      totalQuestions={totalQuestions}
      onRecord={onRecord}
    >
      {options.map((option, index) => {
        const isSelected = index === selectedIndex;
        const isLast = index === options.length - 1;

        return (
          <Pressable
            key={index}
            onPress={() => handleSelect(index)}
            style={[
              optionStyles.row,
              !isLast && optionStyles.rowDivider,
            ]}
          >
            <View style={[optionStyles.circle, isSelected && optionStyles.circleSelected]}>
              {isSelected && <View style={optionStyles.circleDot} />}
            </View>
            <Text style={optionStyles.label}>{option}</Text>
          </Pressable>
        );
      })}
    </ChoiceCard>
  );
}

const stylesSheet = StyleSheet.create({
  promptText: {
    fontSize: scaleFont(15),
    fontWeight: '600',
  },
  promptUnderline: {
    textDecorationLine: 'underline',
  },
});

const optionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleHeight(16),
    minWidth: 0,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  circle: {
    width: scaleWidth(22),
    height: scaleWidth(22),
    borderRadius: scaleWidth(11),
    borderWidth: 2,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleWidth(16),
    flexShrink: 0,
  },
  circleSelected: {
    borderColor: '#5B4A9E',
  },
  circleDot: {
    width: scaleWidth(10),
    height: scaleWidth(10),
    borderRadius: scaleWidth(5),
    backgroundColor: '#5B4A9E',
  },
  label: {
    fontSize: scaleFont(15),
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
});