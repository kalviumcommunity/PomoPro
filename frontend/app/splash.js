import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect, Circle } from 'react-native-svg';
import Animated, { Easing, useAnimatedProps, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withTiming, runOnJS } from 'react-native-reanimated';
import MaskedView from '@react-native-masked-view/masked-view';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { router } from 'expo-router';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CLOCK_RADIUS = 72;
const STROKE = 10;
const CIRCUMFERENCE = 2 * Math.PI * CLOCK_RADIUS;

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

function Particle({ id, x, y, color, onComplete }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(0.8);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 60;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    translateX.value = withTiming(dx, { duration: 700, easing: Easing.out(Easing.quad) });
    translateY.value = withTiming(dy, { duration: 700, easing: Easing.out(Easing.quad) });
    opacity.value = withTiming(0, { duration: 650, easing: Easing.out(Easing.quad) }, (finished) => {
      if (finished) runOnJS(onComplete)(id);
    });
    scale.value = withSequence(withTiming(1.2, { duration: 120 }), withTiming(0.9, { duration: 250 }));
  }, []);

  const rStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const size = 4 + Math.random() * 3;

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
          backgroundColor: color,
          shadowColor: color,
          shadowOpacity: 0.6,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 0 },
        },
        rStyle,
      ]}
    />
  );
}

export default function SplashScreen() {
  const [particles, setParticles] = useState([]);
  const idRef = useRef(0);

  const goMain = useCallback(() => {
    router.replace('/welcome');
  }, []);

  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  const progress = useSharedValue(0);
  const glowPulse = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(10);
  const maskScale = useSharedValue(1); // start visible so splash is shown immediately

  useEffect(() => {
    progress.value = withTiming(0.75, { duration: 1700, easing: Easing.out(Easing.quad) });
    glowPulse.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }), -1, true);
    titleOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    titleTranslateY.value = withDelay(1200, withTiming(0, { duration: 600, easing: Easing.out(Easing.quad) }));

    const bgInterval = setInterval(() => {
      spawnParticles(SCREEN_W * (0.3 + Math.random() * 0.4), SCREEN_H * (0.35 + Math.random() * 0.3), 3 + Math.floor(Math.random() * 4));
    }, 550);

    const exitTimeout = setTimeout(() => {
      maskScale.value = withTiming(6, { duration: 600, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(goMain)();
        }
      });
    }, 3000);

    return () => {
      clearInterval(bgInterval);
      clearTimeout(exitTimeout);
    };
  }, []);

  const spawnParticles = useCallback((x, y, count = 12) => {
    setParticles((prev) => {
      const next = [...prev];
      for (let i = 0; i < count; i++) {
        idRef.current += 1;
        const id = idRef.current;
        const color = Math.random() < 0.5 ? '#FFD060' : '#FF6B4A';
        next.push({ id, x, y, color });
      }
      return next;
    });
  }, []);

  const onParticleComplete = useCallback((id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const tapGesture = React.useMemo(
    () =>
      Gesture.Tap().onEnd((e) => {
        runOnJS(spawnParticles)(e.absoluteX, e.absoluteY, 10);
      }),
    [spawnParticles]
  );

  const clockAnimatedProps = useAnimatedProps(() => {
    const offset = CIRCUMFERENCE * (1 - progress.value);
    return { strokeDashoffset: offset };
  });

  const glowStyle = useAnimatedStyle(() => {
    const scale = 1 + glowPulse.value * 0.18;
    const opacity = 0.35 + glowPulse.value * 0.25;
    return { transform: [{ scale }], opacity };
  });

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const maskStyle = useAnimatedStyle(() => ({
    transform: [{ scale: maskScale.value }],
  }));

  const clockCx = SCREEN_W / 2;
  const clockCy = SCREEN_H * 0.38;

  return (
    <MaskedView
      style={{ flex: 1, backgroundColor: 'black' }}
      maskElement={
        <View style={{ flex: 1, backgroundColor: 'black' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: CLOCK_RADIUS * 2,
                height: CLOCK_RADIUS * 2,
                left: clockCx - CLOCK_RADIUS,
                top: clockCy - CLOCK_RADIUS,
                borderRadius: CLOCK_RADIUS,
                backgroundColor: 'white',
              },
              maskStyle,
            ]}
          />
        </View>
      }
    >
      <GestureDetector gesture={tapGesture}>
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

          <Svg
            width={CLOCK_RADIUS * 2 + 40}
            height={CLOCK_RADIUS * 2 + 40}
            style={{ position: 'absolute', left: clockCx - CLOCK_RADIUS - 20, top: clockCy - CLOCK_RADIUS - 20 }}
          >
            <Circle cx={CLOCK_RADIUS + 20} cy={CLOCK_RADIUS + 20} r={CLOCK_RADIUS} stroke="rgba(255,255,255,0.25)" strokeWidth={STROKE} fill="none" />
            <AnimatedCircle
              cx={CLOCK_RADIUS + 20}
              cy={CLOCK_RADIUS + 20}
              r={CLOCK_RADIUS}
              stroke="#fff"
              strokeWidth={STROKE}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animatedProps={clockAnimatedProps}
              rotation="-90"
              originX={CLOCK_RADIUS + 20}
              originY={CLOCK_RADIUS + 20}
            />
            <Circle cx={CLOCK_RADIUS + 20} cy={CLOCK_RADIUS + 20} r={CLOCK_RADIUS - 26} fill="rgba(255,255,255,0.06)" />
          </Svg>

          <Animated.View style={[{ position: 'absolute', width: '100%', top: clockCy + CLOCK_RADIUS + 24, alignItems: 'center' }, titleStyle]}>
            <Text className="text-white text-4xl font-extrabold tracking-tight">PomoPro</Text>
            <Text className="text-white/80 mt-2 text-base">Focus. Achieve. Thrive.</Text>
          </Animated.View>

          <Animated.View style={[{ position: 'absolute', width: '100%', bottom: SCREEN_H * 0.14, paddingHorizontal: 24, alignItems: 'center' }, titleStyle]}>
            <Text className="text-white/90 text-center text-base">{`"${quote}"`}</Text>
          </Animated.View>

          <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0 }}>
            {particles.map((p) => (
              <Particle key={p.id} id={p.id} x={p.x} y={p.y} color={p.color} onComplete={onParticleComplete} />
            ))}
          </View>
        </View>
      </GestureDetector>
    </MaskedView>
  );
}


