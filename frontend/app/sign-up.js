import React, { useEffect } from 'react';
import { View, Text, TextInput, Pressable, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

function Field({ placeholder, secure, delay = 0, onChangeText }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(10);
  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 400 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 400, easing: Easing.out(Easing.quad) }));
  }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: opacity.value, transform: [{ translateY: translateY.value }] }));
  return (
    <Animated.View style={[{ width: '86%' }, aStyle]}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="rgba(255,255,255,0.7)"
        secureTextEntry={!!secure}
        onChangeText={onChangeText}
        className="mt-4 w-full rounded-2xl px-4 py-3 text-white"
        style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' }}
      />
    </Animated.View>
  );
}

export default function SignUp() {
  const btn = useSharedValue(0);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(btn.value ? 0.96 : 1, { duration: 100 }) }] }));

  const pulse = useSharedValue(0);
  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.18 }], opacity: 0.3 + pulse.value * 0.25 }));
  useEffect(() => {
    pulse.value = withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 }));
  }, []);

  return (
    <View className="flex-1">
      <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
        {/* Night background */}
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="#0D0D2B" />
        
        {/* Stars */}
        <Circle cx={SCREEN_W * 0.15} cy={SCREEN_H * 0.18} r={1} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.32} cy={SCREEN_H * 0.28} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.58} cy={SCREEN_H * 0.22} r={1.2} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.84} cy={SCREEN_H * 0.18} r={0.6} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={SCREEN_W * 0.12} cy={SCREEN_H * 0.56} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.28} cy={SCREEN_H * 0.66} r={0.7} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.52} cy={SCREEN_H * 0.62} r={1.1} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.76} cy={SCREEN_H * 0.68} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.90} cy={SCREEN_H * 0.54} r={1} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.45} cy={SCREEN_H * 0.35} r={0.7} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={SCREEN_W * 0.68} cy={SCREEN_H * 0.45} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.22} cy={SCREEN_H * 0.42} r={0.6} fill="#FFFFFF" fillOpacity={0.5} />
        <Circle cx={SCREEN_W * 0.78} cy={SCREEN_H * 0.32} r={1.1} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.35} cy={SCREEN_H * 0.75} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.65} cy={SCREEN_H * 0.82} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
      </Svg>

      {/* Small orb like welcome */}
      {(() => {
        const cx = SCREEN_W / 2;
        const cy = SCREEN_H * 0.24;
        return (
          <Animated.View
            style={[{ position: 'absolute', left: cx - 70, top: cy - 70, width: 140, height: 140, borderRadius: 999, backgroundColor: '#FFFFFF', shadowColor: '#FFFFFF', shadowRadius: 30, shadowOpacity: 0.9, shadowOffset: { width: 0, height: 0 } }, glowStyle]}
          />
        );
      })()}

      <View className="flex-1 items-center justify-center">
        <Text className="text-white text-3xl font-extrabold">Create Account</Text>
        <Field placeholder="Name" delay={120} />
        <Field placeholder="Email" delay={220} />
        <Field placeholder="Password" delay={320} secure />
        <Field placeholder="Confirm Password" delay={420} secure />
        <Animated.View style={[{ width: '86%', marginTop: 16 }, btnStyle]}>
          <Pressable
            onPressIn={() => (btn.value = 1)}
            onPressOut={() => (btn.value = 0)}
            onPress={() => router.push('/(tabs)')}
            className="w-full items-center justify-center rounded-2xl bg-white/95 py-3"
          >
            <Text className="text-black font-extrabold text-base">Sign Up</Text>
          </Pressable>
        </Animated.View>
        <Pressable onPress={() => router.replace('/sign-in')} className="mt-4">
          <Text className="text-white/85">Already have an account? <Text className="font-extrabold">Sign In</Text></Text>
        </Pressable>
      </View>
    </View>
  );
}


