import { StyleSheet, View, Text, Button } from 'react-native';
import { router } from 'expo-router';
import { usePainAssessment } from '@/features/assessments/pain/context';
import { ScaleSliderInput } from '@/components/mpowered/ScaleSlider';
import { scaleFont } from '@/services/scale';


export default function CurrePainLevel() {
  const { answers, updateAnswer } = usePainAssessment();
  

  return (
    <View style={styles.screen}>
      {/* input component goes here */}
      <Text style={styles.cardTitle}>My Pain</Text>
      
      <ScaleSliderInput underLinedText={'current pain'} titleText={'Pain Intensity'} assessmentType={'pain'} questionNumber={3}/> 

      <Button title="Next" onPress={() => router.push('/tracker/pain/mildest')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 16,
    paddingTop: 20, // extra top space to clear the status bar/notch area
  },
  cardTitle: {
      fontSize: scaleFont(26),
      fontWeight: '500',
      marginBottom: 20
  },
});








// import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';


// import { StyleSheet, View } from 'react-native';
// import { scaleWidth, scaleHeight } from '@/services/scale';


// const DEFAULT_OPTIONS = [
//   'Pain does not prevent me walking any distance',
//   'Pain prevents me from walking more than 2 kilometres',
//   'Pain prevents me from walking more than 1 kilometres',
//   'Pain prevents me from walking more than 500 metres',
//   'I can only walk using a stick or crutches',
//   'I am in bed most of the time',
// ];

// export default function Demographics() {
//   return (
//     <View style={styles.screen}>
      
//       {/* <ScaleSliderInput underLinedText={'worst pain'} titleText={'Pain In'} bottomDescription={'The pain was fairly severe'} assessmentType={'pain'} questionNumber={3}/>  */}
//       <SingleChoiceInput titleText={'Walking Impacts'} options={DEFAULT_OPTIONS} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: {
//     paddingHorizontal: 10,
//     paddingTop: 20, // extra top space to clear the status bar/notch area
//   },
// });

// // export default function Demographics() {
// //   return (
// //     <View>
// //       {/* <PainSummary/> */}
// //       {/* <PainSliderInput underLinedText={'worst pain'} bottomDescription={'The pain was fairly severe'} questionNumber={3}/>  */}
// //       <SingleChoiceInput questionNumber={3}/>
// //     </View>
// //   )
// // }
// // // export default function Demographics() {
// // //   return (
// // //     <View style={stylesSheet.container}>
// // //     <Text style={stylesSheet.title} >Demographics — TODO</Text>
// // //     </View>
// // //   );
// // // }
// // // const stylesSheet = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     alignItems: 'center',
// // //     justifyContent: 'center',
// // //     borderWidth: 2,
// // //     display: 'flex'


// // //   },
// // //   title: {
// // //     fontSize: 20,
// // //     fontWeight: 'bold',
// // //   },
// // // });
