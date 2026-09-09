// import { View, Text } from 'react-native';

// export default function Demographics() {
//   return (
//     <View>
//       <Text>Demographics — TODO</Text>
//     </View>
//   );
// }



import { View, Text, TextInput, StyleSheet } from 'react-native';
import { PainSliderInput } from '@/components/mpowered/PainSlider';

// interface CustomInputProps {
//   label?: string;
//   placeholder?: string;
//   value?: string;
//   onChangeText?: (text: string) => void;
// }

// const CustomInput = ({ label, placeholder, value, onChangeText }: CustomInputProps) => {
//   return (
//     <View style={styles.field}>
//       {label && <Text style={styles.label}>{label}</Text>}
//       <TextInput
//         placeholder={placeholder ?? 'Type something...'}
//         value={value}
//         onChangeText={onChangeText}
//         style={styles.input}
//       />
//     </View>
//   );
// };

export default function Demographics() {
  return (
    <div>
      <PainSliderInput/>
    </div>
    // <View style={styles.container}>
    //   <CustomInput label="Full name" placeholder="Jane Doe" />
    //   <CustomInput label="Email" placeholder="jane@example.com" />
    //   <CustomInput label="Nickname" />


    //   <PainSliderInput/>
    // </View>
  );
}

// const styles = StyleSheet.create({
//   container: { gap: 16, padding: 16 },
//   field: { gap: 4 },
//   label: { fontSize: 14, fontWeight: '500' },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ccc',
//     borderRadius: 8,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
// });