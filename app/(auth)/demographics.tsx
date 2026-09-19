



import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';


import { StyleSheet, View } from 'react-native';
import { scaleWidth, scaleHeight } from '@/services/scale';


const DEFAULT_OPTIONS = [
  'Pain does not prevent me walking any distance',
  'Pain prevents me from walking more than 2 kilometres',
  'Pain prevents me from walking more than 1 kilometres',
  'Pain prevents me from walking more than 500 metres',
  'I can only walk using a stick or crutches',
  'I am in bed most of the time',
];

export default function Demographics() {
  return (
    <View style={styles.screen}>
      
      {/* <ScaleSliderInput underLinedText={'worst pain'} titleText={'Pain In'} bottomDescription={'The pain was fairly severe'} assessmentType={'pain'} questionNumber={3}/>  */}
      <SingleChoiceInput titleText={'Walking Impacts'} options={DEFAULT_OPTIONS} />
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
