import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

// Placeholder, will need to swap later
const SLIDES = [
    'Track your pain and its impacts weekly',
    'Easily share your pain logs to your healthcare professionals',
    'Get tailored questions to assist your medical consultation',
];

export default function OnboardingCarouesel() {
    const [index, setIndex] = useState(0);
    const scrollRef = useRef<ScrollView>(null);

    const onScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
        setIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    };


  return (
    <View style={styles.container}>
        <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
            style={{flex: 1}}
        >

            {SLIDES.map((heading, i) => (
                <View key={i} style={[styles.slide, { width }]}>
                  <Text style={styles.heading}> {heading}</Text>
                </View>
        ))}
        </ScrollView>

        <View style={styles.dots}>
            {SLIDES.map((_,i) => (
                <View key={i} style={[styles.dot, i==index && styles.dotActive]} />
            ))}
        </View>

        <Pressable style={styles.primaryButton} onPress ={() => router.push('/(auth)/name')}>
            <Text style={styles.primaryButtonText}>Get Started ➔</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/(auth)/verify')}>
            <Text style={styles.signIn}>Sign In</Text>
        </Pressable>
    </View>
  );
}


// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    slide: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },

    heading: {
        fontSize: 20,
        fontWeight: '600',
        textAlign: 'center',
    },

    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginVertical: 16,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D9D4E8',
    },

    dotActive: {
        width: 20,
        backgroundColor: '3F2A7A',
    },

    primaryButton: {
        backgroundColor: '#5B3FA5',
        marginHorizontal: 24,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },

    primaryButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16
    },

    signIn: {
        textAlign: 'center',
        fontWeight: '600',
        marginVertical: 16,
    }
});