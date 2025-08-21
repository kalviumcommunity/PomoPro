import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, Text, View } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedGestureHandler,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const TIMER_SIZE = Math.min(SCREEN_W, SCREEN_H) * 0.6;
const RING_STROKE = 12;

const SESSION_TYPES = {
  focus: { label: 'Focus Session', color: '#EF4444', gradient: ['#EF4444', '#F97316'] },
  shortBreak: { label: 'Short Break', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
  longBreak: { label: 'Long Break', color: '#8B5CF6', gradient: ['#8B5CF6', '#7C3AED'] },
};

const FONT_FAMILY = 'Space Grotesk';

function LiquidProgressRing({ progress, sessionType, size = TIMER_SIZE, stroke = RING_STROKE }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));
  
  const liquidWave = useSharedValue(0);
  const rippleScale = useSharedValue(1);
  const rippleOpacity = useSharedValue(0);

  useEffect(() => {
    liquidWave.value = withRepeat(
      withTiming(1, { duration: 2000 }),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (progress >= 1) {
      rippleScale.value = withSequence(
        withTiming(1.5, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
      rippleOpacity.value = withSequence(
        withTiming(1, { duration: 300 }),
        withTiming(0, { duration: 500 })
      );
    }
  }, [progress]);

  const waveStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(liquidWave.value, [0, 1], [0, -4]) }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const colors = SESSION_TYPES[sessionType].gradient;

  return (
    <View style={{ position: 'relative' }}>
      {/* Background Ring */}
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="none"
        />
      </Svg>

      {/* Progress Ring */}
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="progressGradient" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={colors[0]} />
            <Stop offset="100%" stopColor={colors[1]} />
          </RadialGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#progressGradient)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      {/* Liquid Wave Effect */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, waveStyle]}>
        <Svg width={size} height={size}>
          <Path
            d={`M 0 ${size * 0.8} Q ${size * 0.25} ${size * 0.7} ${size * 0.5} ${size * 0.8} Q ${size * 0.75} ${size * 0.9} ${size} ${size * 0.8} L ${size} ${size} L 0 ${size} Z`}
            fill={colors[0]}
            opacity={0.3}
          />
        </Svg>
      </Animated.View>

      {/* Completion Ripple */}
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, rippleStyle]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r + stroke}
            stroke={colors[0]}
            strokeWidth={2}
            fill="none"
            opacity={0.6}
          />
        </Svg>
      </Animated.View>
    </View>
  );
}

function MotivationalParticles({ progress, sessionType }) {
  const particles = useRef([]);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const density = Math.floor(interpolate(progress, [0, 1], [3, 8], Extrapolate.CLAMP));
      const newParticles = Array.from({ length: density }).map(() => ({
        id: Date.now() + Math.random(),
        x: Math.random() * SCREEN_W,
        y: SCREEN_H + 20,
        targetX: SCREEN_W / 2 + (Math.random() - 0.5) * 100,
        targetY: SCREEN_H / 2 + (Math.random() - 0.5) * 100,
        speed: 2 + Math.random() * 3,
        size: 2 + Math.random() * 4,
        opacity: 0.6 + Math.random() * 0.4,
      }));
      particles.current = [...particles.current, ...newParticles];
      forceUpdate(n => n + 1);
    }, 200);

    return () => clearInterval(interval);
  }, [progress]);

  useEffect(() => {
    const animationFrame = () => {
      particles.current = particles.current
        .map(p => ({
          ...p,
          x: p.x + (p.targetX - p.x) * 0.02,
          y: p.y + (p.targetY - p.y) * 0.02,
        }))
        .filter(p => {
          const distance = Math.sqrt((p.x - p.targetX) ** 2 + (p.y - p.targetY) ** 2);
          return distance > 10;
        });
      forceUpdate(n => n + 1);
    };

    const interval = setInterval(animationFrame, 16);
    return () => clearInterval(interval);
  }, []);

  const colors = SESSION_TYPES[sessionType].gradient;

  return (
    <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
      {particles.current.map((p) => (
        <View
          key={p.id}
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: colors[0],
            opacity: p.opacity,
            shadowColor: colors[0],
            shadowOpacity: 0.8,
            shadowRadius: p.size,
            shadowOffset: { width: 0, height: 0 },
          }}
        />
      ))}
    </View>
  );
}

function BreakMode({ sessionType, isActive }) {
  const [isBreathing, setIsBreathing] = useState(false);
  const [showBubbleGame, setShowBubbleGame] = useState(false);
  const [bubbles, setBubbles] = useState([]);

  const breathingScale = useSharedValue(1);
  const breathingOpacity = useSharedValue(0);

  useEffect(() => {
    if (isActive && sessionType === 'shortBreak') {
      setIsBreathing(true);
      breathingOpacity.value = withTiming(1, { duration: 500 });
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 2000 }),
          withTiming(1, { duration: 2000 })
        ),
        -1,
        true
      );
    } else if (isActive && sessionType === 'longBreak') {
      setShowBubbleGame(true);
      generateBubbles();
    } else {
      setIsBreathing(false);
      setShowBubbleGame(false);
      breathingOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [isActive, sessionType]);

  const generateBubbles = () => {
    const newBubbles = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * SCREEN_W,
      y: SCREEN_H + 50,
      targetY: -50,
      speed: 1 + Math.random() * 2,
      size: 20 + Math.random() * 40,
      opacity: 0.3 + Math.random() * 0.4,
    }));
    setBubbles(newBubbles);
  };

  const popBubble = (id) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBubbles(prev => prev.filter(b => b.id !== id));
  };

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
    opacity: breathingOpacity.value,
  }));

  if (!isActive) return null;

  if (sessionType === 'shortBreak' && isBreathing) {
    return (
      <Animated.View style={[{
        position: 'absolute',
        width: TIMER_SIZE * 1.5,
        height: TIMER_SIZE * 1.5,
        borderRadius: TIMER_SIZE * 0.75,
        backgroundColor: 'rgba(6, 182, 212, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(6, 182, 212, 0.3)',
        alignSelf: 'center',
        justifyContent: 'center',
        alignItems: 'center',
      }, breathingStyle]}>
        <Text style={{
          fontFamily: FONT_FAMILY,
          color: '#06B6D4',
          fontSize: 18,
          fontWeight: '600',
        }}>
          {breathingScale.value > 1.1 ? 'Breathe In' : 'Breathe Out'}
        </Text>
      </Animated.View>
    );
  }

  if (sessionType === 'longBreak' && showBubbleGame) {
    return (
      <View pointerEvents="box-none" style={{ position: 'absolute', inset: 0 }}>
        {bubbles.map((bubble) => (
          <Pressable
            key={bubble.id}
            onPress={() => popBubble(bubble.id)}
            style={{
              position: 'absolute',
              left: bubble.x,
              top: bubble.y,
              width: bubble.size,
              height: bubble.size,
              borderRadius: bubble.size / 2,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderWidth: 1,
              borderColor: 'rgba(139, 92, 246, 0.4)',
              opacity: bubble.opacity,
            }}
          />
        ))}
        <View style={{
          position: 'absolute',
          top: 100,
          right: 20,
          backgroundColor: 'rgba(255,255,255,0.9)',
          borderRadius: 20,
          padding: 12,
        }}>
          <Pressable onPress={() => setShowBubbleGame(false)}>
            <Text style={{
              fontFamily: FONT_FAMILY,
              color: '#8B5CF6',
              fontSize: 14,
              fontWeight: '600',
            }}>
              Skip Game
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return null;
}

export default function TimerScreen() {
  const [sessionType, setSessionType] = useState('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [streak, setStreak] = useState(3);

  const progress = useSharedValue(0);
  const timerScale = useSharedValue(1);
  const timerGlow = useSharedValue(0);
  const backgroundProgress = useSharedValue(0);

  const sessionDurations = {
    focus: 25 * 60,
    shortBreak: 5 * 60,
    longBreak: 15 * 60,
  };

  useEffect(() => {
    setTimeLeft(sessionDurations[sessionType]);
    progress.value = 0;
    backgroundProgress.value = 0;
  }, [sessionType]);

  useEffect(() => {
    if (isRunning && !isPaused) {
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSessionComplete();
            return sessionDurations[sessionType];
          }
          const newTime = prev - 1;
          const newProgress = 1 - (newTime / sessionDurations[sessionType]);
          progress.value = withTiming(newProgress, { duration: 1000 });
          backgroundProgress.value = withTiming(newProgress, { duration: 1000 });
          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, isPaused, sessionType]);

  const handleSessionComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setIsRunning(false);
    setIsPaused(false);
    
    if (sessionType === 'focus') {
      setStreak(prev => prev + 1);
      setSessionType('shortBreak');
    } else if (sessionType === 'shortBreak') {
      setSessionType(streak % 4 === 0 ? 'longBreak' : 'focus');
    } else {
      setSessionType('focus');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(true);
    setIsPaused(false);
    timerScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  };

  const handlePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(true);
    timerGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  };

  const handleResume = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsPaused(false);
    timerGlow.value = withTiming(0, { duration: 300 });
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRunning(false);
    setIsPaused(false);
    setTimeLeft(sessionDurations[sessionType]);
    progress.value = withTiming(0, { duration: 500 });
    backgroundProgress.value = withTiming(0, { duration: 500 });
    timerScale.value = withSequence(
      withTiming(0.9, { duration: 200 }),
      withSpring(1, { damping: 15, stiffness: 150 })
    );
  };

  const handleSkip = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleSessionComplete();
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = 0;
      context.startY = 0;
    },
    onActive: (event, context) => {
      context.startX = event.translationX;
      context.startY = event.translationY;
    },
    onEnd: (event) => {
      const { translationX, translationY } = event;
      const threshold = 100;

      if (Math.abs(translationX) > Math.abs(translationY)) {
        if (translationX < -threshold) {
          runOnJS(handleSkip)();
        }
      } else {
        if (translationY < -threshold) {
          if (isRunning && !isPaused) {
            runOnJS(handlePause)();
          } else if (isPaused) {
            runOnJS(handleResume)();
          }
        } else if (translationY > threshold) {
          runOnJS(handleReset)();
        }
      }
    },
  });

  const timerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const timerGlowStyle = useAnimatedStyle(() => ({
    shadowOpacity: 0.3 + timerGlow.value * 0.4,
  }));

  const backgroundStyle = useAnimatedStyle(() => {
    const colors = SESSION_TYPES[sessionType].gradient;
    const progressValue = backgroundProgress.value;
    
    return {
      backgroundColor: interpolate(
        progressValue,
        [0, 1],
        [colors[0], '#E5E7EB'],
        Extrapolate.CLAMP
      ),
    };
  });

  const colors = SESSION_TYPES[sessionType];

  return (
    <SafeAreaView style={{ flex: 1 }}>
      {/* Animated Background */}
      <Animated.View style={[{
        position: 'absolute',
        inset: 0,
      }, backgroundStyle]}>
        <Svg width={SCREEN_W} height={SCREEN_H}>
          <Defs>
            <RadialGradient id="bgGradient" cx="50%" cy="30%" r="70%">
              <Stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.8" />
              <Stop offset="100%" stopColor={colors.gradient[1]} stopOpacity="0.4" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#bgGradient)" />
        </Svg>
      </Animated.View>

      {/* Motivational Particles */}
      <MotivationalParticles progress={progress.value} sessionType={sessionType} />

      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 40,
      }}>
        <Pressable
          onPress={() => router.back()}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>

        <View style={{
          backgroundColor: 'rgba(255,255,255,0.15)',
          paddingHorizontal: 20,
          paddingVertical: 8,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        }}>
          <Text style={{
            fontFamily: FONT_FAMILY,
            color: 'white',
            fontSize: 16,
            fontWeight: '700',
            textAlign: 'center',
          }}>
            {colors.label}
          </Text>
        </View>

        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: 'rgba(255,255,255,0.15)',
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.3)',
        }}>
          <Ionicons name="flame" size={16} color="#FF6B35" />
          <Text style={{
            fontFamily: FONT_FAMILY,
            color: 'white',
            fontSize: 14,
            fontWeight: '600',
            marginLeft: 4,
          }}>
            {streak}
          </Text>
        </View>
      </View>

      {/* Main Timer Section */}
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
        }, timerStyle]}>
          <Animated.View style={[{
            alignItems: 'center',
            justifyContent: 'center',
          }, timerGlowStyle]}>
            <LiquidProgressRing
              progress={progress.value}
              sessionType={sessionType}
              size={TIMER_SIZE}
              stroke={RING_STROKE}
            />

            {/* Timer Display */}
            <View style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Text style={{
                fontFamily: FONT_FAMILY,
                color: 'white',
                fontSize: 48,
                fontWeight: '800',
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              }}>
                {formatTime(timeLeft)}
              </Text>
            </View>
          </Animated.View>

          {/* Break Mode Overlay */}
          <BreakMode sessionType={sessionType} isActive={isRunning} />
        </Animated.View>
      </PanGestureHandler>

      {/* Controls */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingBottom: 40,
        gap: 20,
      }}>
        {/* Stop/Reset Button */}
        <Pressable
          onPress={handleReset}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          <Ionicons name="stop" size={24} color="white" />
        </Pressable>

        {/* Start/Pause/Resume Button */}
        <Pressable
          onPress={isRunning ? (isPaused ? handleResume : handlePause) : handleStart}
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.gradient[0],
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: 'rgba(255,255,255,0.3)',
            shadowColor: colors.gradient[0],
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          <Ionicons
            name={isRunning ? (isPaused ? 'play' : 'pause') : 'play'}
            size={32}
            color="white"
          />
        </Pressable>

        {/* Skip Button */}
        <Pressable
          onPress={handleSkip}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
        >
          <Ionicons name="fast-forward" size={24} color="white" />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
