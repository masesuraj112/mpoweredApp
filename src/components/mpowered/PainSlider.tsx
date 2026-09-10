import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';




interface PainSliderProps {
  painLevel?: string;
  painDescription?: string;
  onValueChange?: (value: number) => void;
}


export function PainSliderInput({painLevel, painDescription}: PainSliderProps) {

  return (
    <View style={stylesSheet.container}>
      <Text style={stylesSheet.titleText}>Pain Intensity</Text>
      <Text style={stylesSheet.lineText}></Text>
      <Text style={stylesSheet.painLevelText}>My {painLevel} pain is</Text>

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
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  }

  
})




// const stylesSheet = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center'
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
// });