



import { PainSliderInput } from '@/components/mpowered/PainSlider';
import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { PainSummary } from '@/components/mpowered/PainSummary';

import { StyleSheet, View } from 'react-native';
import { scaleWidth, scaleHeight } from '@/services/scale';

export default function Demographics() {
  return (
    <View style={styles.screen}>

      {/* <PainSummary
  summary={{
    period: '18-24 May',
    locations: ['Lower back', 'Other: Knee'],
    characteristics: ['aching', 'throbbing'],
    intensity: {
      current: { value: 0, description: 'I do not experience pain at the moment.' },
      mildest: { value: 2, description: 'I have experienced mild pain.' },
      worst: { value: 9, description: 'My worst pain was very severe.' },
      average: { value: 7, description: 'I have experienced severe pain.' },
    },
  }}
  onClose={() => console.log('Closed')}
/> */}
      
      {/* <PainSliderInput underLinedText={'worst pain'} bottomDescription={'The pain was fairly severe'} questionNumber={3}/>  */}
      <SingleChoiceInput />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 10,
    paddingTop: 20, // extra top space to clear the status bar/notch area
  },
});

// export default function Demographics() {
//   return (
//     <View>
//       {/* <PainSummary/> */}
//       {/* <PainSliderInput underLinedText={'worst pain'} bottomDescription={'The pain was fairly severe'} questionNumber={3}/>  */}
//       <SingleChoiceInput questionNumber={3}/>
//     </View>
//   )
// }
// // export default function Demographics() {
// //   return (
// //     <View style={stylesSheet.container}>
// //     <Text style={stylesSheet.title} >Demographics — TODO</Text>
// //     </View>
// //   );
// // }
// // const stylesSheet = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     alignItems: 'center',
// //     justifyContent: 'center',
// //     borderWidth: 2,
// //     display: 'flex'


// //   },
// //   title: {
// //     fontSize: 20,
// //     fontWeight: 'bold',
// //   },
// // });
