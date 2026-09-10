import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useState } from 'react';

interface PainSliderProps {
  painLevel?: string;
  painDescription?: string;
  onValueChange?: (value: number) => void;
}


export function PainSliderInput({painLevel, painDescription}: PainSliderProps) {
  const [value, setValue] = useState(0);

  // This function prevents input from being less than 0 or greater than 10
  const changeNumber = (text: String) => {
    const num = Number(text);
    if (isNaN(num)) return 0;
    setValue(Math.min(10, Math.max(0, num)));

  }

  return (
    <View style={stylesSheet.container}>
      <Text style={stylesSheet.titleText}>Pain Intensity</Text>
      <Text style={stylesSheet.lineText}></Text>
      <Text style={stylesSheet.painLevelText}>My {painLevel} pain is <TextInput style={stylesSheet.underlineText} keyboardType="number-pad" value={String(value)} onChangeText={changeNumber} /></Text>

    </View>

  );
}

const stylesSheet = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 15
  },

  titleText: {
    margin: 15,
  },

  lineText: {
    borderTopWidth: 2,
    borderTopColor: 'gray',
    margin: 15
  },
  painLevelText: {
    margin: 15,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  underlineText: {
     fontSize: 20,
  borderBottomWidth: 2,
  width: 30,
  borderBottomColor: 'black',
  minWidth: 10,
  textAlign: 'center',
  paddingBottom: 4,
  marginLeft: 8,

    // fontSize: 20,
    // fontWeight: 'bold',
    // textDecorationLine: 'underline',
  }

  
})

