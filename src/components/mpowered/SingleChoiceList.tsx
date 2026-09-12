import { Pressable, StyleSheet, Text, View } from 'react-native';


interface SingleChoiceProps {
  questionNumber?: number;
  onRecord?: () => void;
}

export function SingleChoiceInput({
  questionNumber,
  onRecord,
}: SingleChoiceProps) {
  return (
    <View style={stylesSheet.container}>
      <Text style={stylesSheet.titleText}>Walking Impacts</Text>
      <Text style={stylesSheet.lineText}></Text>

      {/* Footer: page indicator + Record button */}
      <View style={footerStyles.row}>
        <View style={footerStyles.pill}>
          <Text style={footerStyles.pillText}>
            {questionNumber ?? 1}/{7}
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
    alignItems: 'center',
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
    marginBottom: 15,
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