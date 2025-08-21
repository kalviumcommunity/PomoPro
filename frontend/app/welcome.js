import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const QUOTES = [
  'Small wins build great momentum.',
  'Focus is your superpower.',
  'One pomodoro at a time.',
  'Deep work, big results.',
  'Move with purpose. Finish with pride.',
  'Stay present. Stay steady.',
  'Show up. Momentum will follow.',
  'Do the work, trust the process.',
  'Consistency beats intensity.',
  'Make progress unavoidable.',
];

function Ripple({ id, x, y, onComplete }) {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0.5);

  useEffect(() => {
    scale.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    opacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) runOnJS(onComplete)(id);
    });
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const size = 140;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: 'rgba(255,255,255,0.25)',
        },
        style,
      ]}
    />
  );
}

function AnimatedButton({ label, onPress, variant = 'primary' }) {
  const pressed = useSharedValue(0);
  const aStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(pressed.value ? 0.96 : 1, { duration: 100 }) }],
  }));
  return (
    <Animated.View style={aStyle}>
      <Pressable
        onPressIn={() => (pressed.value = 1)}
        onPressOut={() => (pressed.value = 0)}
        onPress={onPress}
        className={
          variant === 'primary'
            ? 'mt-6 w-[260px] items-center justify-center rounded-2xl bg-white/95 py-3 shadow'
            : 'mt-3 w-[260px] items-center justify-center rounded-2xl border border-white/60 py-3 bg-white/10'
        }
      >
        <Text className={variant === 'primary' ? 'text-black font-extrabold text-base' : 'text-white font-extrabold text-base'}>
          {label}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

export default function Welcome() {
  const [ripples, setRipples] = useState([]);
  const idRef = useRef(0);

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  const orbPulse = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    orbPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    quoteOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.quad), delay: 300 });
  }, []);

  const glowStyle = useAnimatedStyle(() => {
    const scale = 1 + orbPulse.value * 0.18;
    const opacity = 0.35 + orbPulse.value * 0.25;
    return { transform: [{ scale }], opacity };
  });

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const quoteStyle = useAnimatedStyle(() => ({ opacity: quoteOpacity.value }));

  const onRippleDone = (id) => setRipples((prev) => prev.filter((r) => r.id !== id));

  const tap = Gesture.Tap().onEnd((e) => {
    idRef.current += 1;
    const id = idRef.current;
    setRipples((prev) => [...prev, { id, x: e.absoluteX, y: e.absoluteY }]);
  });

  return (
    <View className="flex-1">
        {/* Night background with stars */}
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

        {/* Background tap catcher for ripples (does not block buttons) */}
        <GestureDetector gesture={tap}>
          <View style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }} pointerEvents="box-only" />
        </GestureDetector>

        {/* Align like splash */}
        {(() => {
          const clockCx = SCREEN_W / 2;
          const clockCy = SCREEN_H * 0.38;
          return (
            <>
              {/* Pulsing glow behind orb */}
              <Animated.View
                style={[
                  {
                    position: 'absolute',
                    left: clockCx - 110,
                    top: clockCy - 110,
                    width: 220,
                    height: 220,
                    borderRadius: 999,
                    backgroundColor: '#FFFFFF',
                    shadowColor: '#FFFFFF',     
                    shadowRadius: 40,
                    shadowOpacity: 0.9,
                    shadowOffset: { width: 0, height: 0 },
                  },
                  glowStyle,
                ]}
              />

              {/* Subtle orb face */}
              <View
                style={{
                  position: 'absolute',
                  left: clockCx - 90,
                  top: clockCy - 90,
                  width: 180,
                  height: 180,
                  borderRadius: 999,
                  backgroundColor: 'rgba(255,255,255,0.06)',
                  borderWidth: 2,
                  borderColor: 'rgba(255,255,255,0.2)'
                }}
              />

              {/* Title & Tagline */}
              <Animated.View style={[{ position: 'absolute', width: '100%', top: clockCy + 110 + 24, alignItems: 'center' }, titleStyle]}>
                <Text className="text-white text-5xl font-extrabold tracking-tight">PomoPro</Text>
                <Text className="text-white/85 mt-2 text-base">Focus. Achieve. Thrive.</Text>
              </Animated.View>

              {/* Quote and Buttons near bottom */}
              <Animated.View style={[{ position: 'absolute', width: '100%', bottom: SCREEN_H * 0.12, paddingHorizontal: 24, alignItems: 'center' }, quoteStyle]}>
                <Text className="text-white/90 text-center text-base">{`“${quote}”`}</Text>
                <AnimatedButton label="Sign In" onPress={() => router.push('/sign-in')} variant="primary" />
                <AnimatedButton label="Sign Up" onPress={() => router.push('/sign-up')} variant="secondary" />
              </Animated.View>
            </>
          );
        })()}

        {/* Ripples */}
        <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
          {ripples.map((r) => (
            <Ripple key={r.id} id={r.id} x={r.x} y={r.y} onComplete={onRippleDone} />
          ))}
        </View>
      </View>
  );
}
