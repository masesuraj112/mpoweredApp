import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';


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

  return (
    <View style={stylesSheet.container}>
      <Text style={stylesSheet.titleText}>Walking Impacts</Text>
      <Text style={stylesSheet.lineText}></Text>

      <Text style={stylesSheet.promptText}>
        Select the <Text style={stylesSheet.promptUnderline}>MOST</Text> relevant statement:
      </Text>

      {/* Radio list */}
      <View style={stylesSheet.optionsList}>
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
      </View>

      {/* Footer: page indicator + Record button */}
      <View style={footerStyles.row}>
        <View style={footerStyles.pill}>
          <Text style={footerStyles.pillText}>
            {questionNumber ?? 1}/{totalQuestions ?? 7}
          </Text>
        </View>

        <Pressable
          onPress={onRecord}
          style={({ pressed }) => [
            footerStyles.pill,
            footerStyles.recordButton,
            pressed && footerStyles.recordButtonPressed,
          ]}
        >
          <Text style={footerStyles.pillText}>Record</Text>
          <Text style={footerStyles.arrow}>→</Text>
        </Pressable>
      </View>
    </View>
  );
}

const stylesSheet = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 20,
    alignItems: 'stretch', // changed from 'center' so option rows and text can go full-width
    paddingTop: 24,        // ← space between the card's top border and its content
    paddingHorizontal: 20, // keeps left/right inset consistent
    paddingBottom: 20,
  },

  titleText: {
    fontSize: 28,
    fontWeight: '500',
    marginBottom: 15,
    alignSelf: 'flex-start',
  },

  lineText: {
    borderTopWidth: 1,
    borderTopColor: 'black',
    width: '100%',
    marginBottom: 20,
  },

  promptText: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  promptUnderline: {
    textDecorationLine: 'underline',
  },

  optionsList: {
    width: '100%',
  },
});

const optionStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#3A3A3A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    flexShrink: 0,
  },
  circleSelected: {
    borderColor: '#5B4A9E',
  },
  circleDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#5B4A9E',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    flex: 1,
    flexShrink: 1,
  },
});

const footerStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  pill: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButton: {
    gap: 8,
  },
  recordButtonPressed: {
    backgroundColor: '#F2F2F5',
  },
  pillText: {
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
  arrow: {
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
});