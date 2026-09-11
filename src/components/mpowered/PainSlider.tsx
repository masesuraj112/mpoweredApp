import Slider from '@react-native-community/slider';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';


interface PainSliderProps {
  painLevel?: string;
  painDescription?: string;
  onValueChange?: (value: number) => void;
}


export function PainSliderInput({painLevel, painDescription}: PainSliderProps) {
  const [value, setValue] = useState(0);
  const [sliderWidth, setSliderWidth] = useState(0);


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

      <View 
      style={sliderSheet.container} 
      onLayout={(e) => setSliderWidth(e.nativeEvent.layout.width  )}>
        <View
          style={[
            sliderSheet.bubble,
            { left: (value / 10) * sliderWidth - 15 }, // rough centering, tweak offset
          ]}
         
        >
          <Text style={sliderSheet.bubbleText}>{value}</Text>
        </View>
        <Slider
          style={sliderSheet.slider}
          
          minimumValue={0}
          maximumValue={10}
          step={1}
          value={value}
          onValueChange={setValue}
          minimumTrackTintColor="#5B4A9E" // purple, matches your screenshot
          maximumTrackTintColor="#E4DFF5" // light lavender track
          thumbTintColor="#5B4A9E"
        />
      </View>
      <Text>The pain is {painDescription}</Text>
      
    </View>

  );
}

const stylesSheet = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black',
    borderRadius: 15,
    alignItems: 'center',
    paddingTop: 20,        // ← space between the card's top border and its content
  paddingHorizontal: 15, // keeps left/right inset consistent
  paddingBottom: 15,
  },

  titleText: {
    marginBottom: 15,
    alignSelf: 'flex-start'
  },

  lineText: {
    borderTopWidth: 1,
    borderTopColor: 'gray',
    width: '100%',
    marginBottom: 15,
    
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


const sliderSheet = StyleSheet.create({
  container: {
    width: '30%'
  },
  slider: {
    width: "100%",
    height: 40,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  bubble: {
    position: 'absolute',
    top: -30,
    backgroundColor: '#5B4A9E',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  bubbleText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
