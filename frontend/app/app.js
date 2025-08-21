import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Rect } from 'react-native-svg';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Swipeable } from 'react-native-gesture-handler';

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

export default function AppScreen() {
  const hour = new Date().getHours();
  const timeOfDay = useMemo(() => {
    if (hour >= 5 && hour < 11) return 'morning';
    if (hour >= 11 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, [hour]);

  const greeting = useMemo(() => {
    if (timeOfDay === 'morning') return 'Good Morning, Alex 👋';
    if (timeOfDay === 'afternoon') return 'Good Afternoon, Alex 👋';
    if (timeOfDay === 'evening') return 'Good Evening, Alex 👋';
    return 'Good Night, Alex 🌙';
  }, [timeOfDay]);

  const dailyQuote = useMemo(() => {
    const idx = new Date().getDate() % QUOTES.length;
    return QUOTES[idx];
  }, []);

  const glow = useSharedValue(0);
  const raysRotation = useSharedValue(0);
  const starsPulse = useSharedValue(0);

  useEffect(() => {
    glow.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })), -1, true);
    raysRotation.value = withRepeat(withTiming(360, { duration: 20000, easing: Easing.linear }), -1);
    starsPulse.value = withRepeat(withSequence(withTiming(1, { duration: 1500 }), withTiming(0, { duration: 1500 })), -1, true);
  }, []);

  const glowStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + glow.value * 0.15 }], opacity: 0.25 + glow.value * 0.25 }));
  const raysStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${raysRotation.value}deg` }] }));

  const [streakDays, setStreakDays] = useState(7);
  const [goalPoms, setGoalPoms] = useState(5);
  const [donePoms, setDonePoms] = useState(3);
  const barPulse = useSharedValue(0);
  const flameScale = useSharedValue(1 + Math.min(3 / 30, 0.5));
  const showStreakTip = useSharedValue(0);

  useEffect(() => {
    barPulse.value = withRepeat(withSequence(withTiming(1, { duration: 600 }), withTiming(0, { duration: 600 })), -1, true);
  }, []);

  const barGlow = useAnimatedStyle(() => ({ opacity: 0.35 + barPulse.value * 0.25 }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flameScale.value }] }));
  const tipStyle = useAnimatedStyle(() => ({ opacity: withTiming(showStreakTip.value, { duration: 150 }) }));

  const onFlameTap = () => {
    flameScale.value = withSequence(
      withTiming(flameScale.value + 0.15, { duration: 120, easing: Easing.out(Easing.quad) }),
      withTiming(1 + Math.min(streakDays / 30, 0.5), { duration: 220 })
    );
    showStreakTip.value = 1;
    setTimeout(() => (showStreakTip.value = 0), 1200);
  };

  const incGoal = () => setGoalPoms((g) => g + 1);

  const stars = useMemo(() => {
    if (timeOfDay !== 'night') return [];
    const arr = [];
    for (let i = 0; i < 24; i++) {
      arr.push({ id: i, x: Math.random() * SCREEN_W, y: Math.random() * (SCREEN_H * 0.6), s: 2 + Math.random() * 2 });
    }
    return arr;
  }, [timeOfDay]);

  const headerCy = SCREEN_H * 0.18;

  const Background = () => (
    <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id="bg" cx="50%" cy="38%" r="75%">
          <Stop offset="0%" stopColor="#FF3B30" />
          <Stop offset="100%" stopColor="#FF9500" />
        </RadialGradient>
      </Defs>
      <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#bg)" />
    </Svg>
  );

  return (
    <View className="flex-1">
      <Background />

      {/* Profile avatar top-right */}
      <View style={{ position: 'absolute', top: 24, right: 16 }}>
        <Pressable onPress={() => router.push('/settings')} className="items-center justify-center rounded-full bg-white/20" style={{ width: 36, height: 36 }}>
          <Text className="text-white font-extrabold">A</Text>
        </Pressable>
      </View>

      {timeOfDay === 'morning' && (
        <Animated.View style={[{ position: 'absolute', left: SCREEN_W / 2 - 120, top: headerCy - 120, width: 240, height: 240 }, raysStyle]}>
          {Array.from({ length: 16 }).map((_, i) => (
            <View key={i} style={{ position: 'absolute', left: 120 - 2, top: 0, width: 4, height: 120, backgroundColor: 'rgba(255,255,255,0.28)', transform: [{ rotate: `${(360 / 16) * i}deg` }, { translateY: 20 }] }} />
          ))}
        </Animated.View>
      )}

      {timeOfDay === 'night' && (
        <View style={{ position: 'absolute', left: 0, top: 0, right: 0, height: SCREEN_H * 0.6 }}>
          {stars.map((s) => (
            <Animated.View key={s.id} style={[{ position: 'absolute', left: s.x, top: s.y, width: s.s, height: s.s, borderRadius: 999, backgroundColor: 'white' }, glowStyle]} />
          ))}
        </View>
      )}

      <View style={{ position: 'absolute', top: headerCy + 120, width: '100%', alignItems: 'center' }}>
        <Text className="text-white text-3xl font-extrabold">{greeting}</Text>
      </View>

      <View style={{ position: 'absolute', top: headerCy + 170, width: '100%', alignItems: 'center' }}>
        <Pressable onPress={onFlameTap} className="items-center">
          <Animated.Text className="text-2xl" style={flameStyle}>🔥</Animated.Text>
          <Text className="text-white/90 mt-1">Streak: {streakDays} days</Text>
        </Pressable>
        {/* Tooltip under flame */}
        <Animated.View style={[{ marginTop: 6, paddingVertical: 6, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.28)' }, tipStyle]}>
          <Text className="text-white/90 text-xs">You’ve focused {streakDays} days in a row!</Text>
        </Animated.View>
      </View>

      {/* Daily quote */}
      <View style={{ position: 'absolute', top: headerCy + 205, width: '100%', alignItems: 'center', paddingHorizontal: 24 }}>
        <Text className="text-white/90 text-center">{`“${dailyQuote}”`}</Text>
      </View>

      <View style={{ position: 'absolute', top: headerCy + 230, width: '100%', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Text className="text-white/90">Today’s Goal: {goalPoms} | Completed: {donePoms}</Text>
          <Pressable onPress={incGoal} className="items-center justify-center rounded-full" style={{ width: 26, height: 26, backgroundColor: 'rgba(255,255,255,0.18)' }}>
            <Text className="text-white font-extrabold">+</Text>
          </Pressable>
        </View>
        <View style={{ width: SCREEN_W * 0.8, height: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.25)' }}>
          <Animated.View style={[{ height: '100%', borderRadius: 999, backgroundColor: 'white', width: Math.max(12, (SCREEN_W * 0.8) * Math.min(1, donePoms / Math.max(1, goalPoms))) }, barGlow]} />
        </View>
      </View>

      {/* Scrollable sections */}
      <ScrollView style={{ position: 'absolute', top: headerCy + 280, bottom: 90, width: '100%' }} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
        {/* 4. Pomodoro Quick Access - Mini Timer */}
        <MiniTimer onPress={() => router.push('/timer')} />

        {/* 5. Task Overview - top 3 with swipe */}
        <TasksPreview onComplete={() => setDonePoms((d) => Math.min(goalPoms, d + 1))} />

        {/* 6. Analytics Snapshot */}
        <AnalyticsSnapshot onPress={() => router.push('/analytics')} />

        {/* 7. Collaboration Shortcuts */}
        <View style={{ marginTop: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[
              { key: 'team', label: 'My Team', icon: '👥', route: '/collaboration' },
              { key: 'shared', label: 'Join Session', icon: '🔗', route: '/collaboration' },
              { key: 'pair', label: 'Pair Focus', icon: '🤝', route: '/collaboration' },
            ].map(({ key, label, icon, route }) => (
              <Card key={key} label={label} icon={icon} onPress={() => router.push(route)} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function Card({ label, icon, onPress }) {
  const pressed = useSharedValue(0);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: withTiming(pressed.value ? 0.96 : 1, { duration: 90 }) }] }));
  return (
    <Animated.View style={[{ width: (SCREEN_W - 16 * 2 - 12) / 2, marginBottom: 12 }, aStyle]}>
      <Pressable
        onPressIn={() => (pressed.value = 1)}
        onPressOut={() => (pressed.value = 0)}
        onPress={onPress}
        className="rounded-2xl bg-white/12"
        style={{ paddingVertical: 16, paddingHorizontal: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
      >
        <Text className="text-2xl mb-2">{icon}</Text>
        <Text className="text-white font-extrabold">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

function MiniTimer({ onPress }) {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })), -1, true);
  }, []);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + pulse.value * 0.05 }] }));
  return (
    <Animated.View style={[{ marginTop: 8 }, aStyle]}>
      <Pressable onPress={onPress} className="rounded-2xl bg-white/10" style={{ padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
        <Text className="text-white font-extrabold mb-2">Start Focus</Text>
        <View style={{ width: '100%', height: 80, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-white/85">Pomodoro preview</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

function TasksPreview({ onComplete }) {
  const items = [
    { id: 1, title: 'Finish UI wireframes', poms: 2 },
    { id: 2, title: 'Draft analytics spec', poms: 1 },
    { id: 3, title: 'Refactor timer logic', poms: 2 },
  ];
  return (
    <View style={{ marginTop: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text className="text-white font-extrabold">Today’s Tasks</Text>
        <Pressable onPress={() => router.push('/tasks')}>
          <Text className="text-white/85">See All</Text>
        </Pressable>
      </View>
      {items.map((t) => (
        <Swipeable key={t.id} renderRightActions={() => (
          <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
            <Pressable onPress={onComplete} style={{ backgroundColor: 'rgba(0,200,0,0.35)', paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text className="text-white">Done</Text>
            </Pressable>
            <Pressable style={{ backgroundColor: 'rgba(200,0,0,0.35)', paddingHorizontal: 16, justifyContent: 'center' }}>
              <Text className="text-white">Delete</Text>
            </Pressable>
          </View>
        )}>
          <View className="rounded-2xl bg-white/10" style={{ padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
            <Text className="text-white">{t.title}</Text>
            <Text className="text-white/70 text-xs">~ {t.poms} pomodoros</Text>
          </View>
        </Swipeable>
      ))}
    </View>
  );
}

function AnalyticsSnapshot({ onPress }) {
  const pulse = useSharedValue(0);
  useEffect(() => { pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1, true); }, []);
  const aStyle = useAnimatedStyle(() => ({ opacity: 0.8 + pulse.value * 0.2 }));
  return (
    <Animated.View style={[{ marginTop: 16 }, aStyle]}>
      <Pressable onPress={onPress} className="rounded-2xl bg-white/10" style={{ padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
        <Text className="text-white font-extrabold mb-2">This week</Text>
        <Text className="text-white/85 mb-2">12 Pomodoros • 5 tasks completed</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6 }}>
          {[10, 22, 16, 28, 12, 26, 20].map((h, i) => (
            <View key={i} style={{ width: 12, height: h, borderRadius: 4, backgroundColor: 'white' }} />
          ))}
        </View>
      </Pressable>
    </Animated.View>
  );
}


