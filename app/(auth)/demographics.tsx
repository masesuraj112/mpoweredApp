



import { View, Text, TextInput, StyleSheet } from 'react-native';
import { PainSliderInput } from '@/components/mpowered/PainSlider';
import { SingleChoiceInput } from '@/components/mpowered/SingleChoiceList';
import { PainSummary } from '@/components/mpowered/PainSummary';

export default function Demographics() {
  return (
    <View>
      <PainSummary/>
      {/* <PainSliderInput topDescription={'My worst pain is'} bottomDescription={'The pain is fairly severe'} questionNumber={3}/>  */}
      {/* <SingleChoiceInput questionNumber={3}/> */}
    </View>
  )
}
// export default function Demographics() {
//   return (
//     <View style={stylesSheet.container}>
//     <Text style={stylesSheet.title} >Demographics — TODO</Text>
//     </View>
//   );
// }
// const stylesSheet = StyleSheet.create({
//   container: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     borderWidth: 2,
//     display: 'flex'


//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
// });
