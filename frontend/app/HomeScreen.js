import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Rect, Circle, Line } from 'react-native-svg';
import Animated, { Easing, interpolate, useAnimatedProps, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { Swipeable } from 'react-native-gesture-handler';
import { router } from 'expo-router';
// import * as Haptics from 'react-native-haptic-feedback'; // Uncomment for haptics

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// --- Component Definitions ---
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedLine = Animated.createAnimatedComponent(Line);

// --- Theme & Constants ---
const getThemeColors = () => {
  return { 
    background: ['#0D0D2B', '#000000'], 
    accent: ['#FF7A49', '#FF3B30'], 
    text: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.7)',
    cardBg: 'rgba(255, 255, 255, 0.1)',
    cardBorder: 'rgba(255, 255, 255, 0.2)'
  };
};

const THEME = {
  colors: getThemeColors(),
  easing: Easing.out(Easing.quad),
  springConfig: { damping: 14, stiffness: 140 },
};

const QUOTES = [
  'Small wins build great momentum.', 'Focus is your superpower.', 'One pomodoro at a time.',
  'Deep work, big results.', 'Move with purpose. Finish with pride.', 'Stay present. Stay steady.',
  'Show up. Momentum will follow.', 'Do the work, trust the process.', 'Consistency beats intensity.',
  'Make progress unavoidable.',
];

const INITIAL_TASKS = [
  { id: 1, title: 'Finish UI wireframes', poms: 2, done: false },
  { id: 2, title: 'Draft analytics spec', poms: 1, done: true },
  { id: 3, title: 'Refactor timer logic', poms: 2, done: false },
];

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah', avatar: 'S', status: 'focusing', task: 'Design Review', timeLeft: '12:34', color: '#FF6B4A' },
  { id: 2, name: 'Mike', avatar: 'M', status: 'break', task: 'API Integration', timeLeft: '05:12', color: '#4B00B5' },
  { id: 3, name: 'Emma', avatar: 'E', status: 'available', task: 'Code Review', timeLeft: null, color: '#34C759' },
  { id: 4, name: 'David', avatar: 'D', status: 'focusing', task: 'Testing', timeLeft: '18:45', color: '#FF9500' },
];

// --- Main Screen Component ---
export default function HomeScreen() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [goal, setGoal] = useState(5);
  const completedCount = useMemo(() => tasks.filter(t => t.done).length * 2, [tasks]); // Assuming 1 task = 2 poms for demo

  const timeOfDay = 'night'; // Always night theme

  // --- Animations ---
  const scrollY = useSharedValue(0);
  
  const progressSv = useSharedValue(0);
  useEffect(() => {
    progressSv.value = withTiming(completedCount / Math.max(1, goal), { duration: 600, easing: THEME.easing });
  }, [goal, completedCount]);
  
  const onToggleTask = (taskId) => {
    // Haptics.trigger('impactLight'); // Uncomment for haptics
    setTasks(currentTasks => {
        const newTasks = currentTasks.map(t => t.id === taskId ? { ...t, done: !t.done } : t);
        return newTasks;
    });
  };

  const onIncGoal = () => {
    // Haptics.trigger('impactLight'); // Uncomment for haptics
    setGoal(g => g + 1);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  return (
    <View style={{ flex: 1 }}>
      <AnimatedGradientBackground timeOfDay={timeOfDay} />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        >
          <Header username="Alex" timeOfDay={timeOfDay} />
          <StreakAndMotivation scrollY={scrollY} />
          <FocusGoal progress={progressSv} completed={completedCount} goal={goal} onIncGoal={onIncGoal} />
          <MiniTimer />
          <TaskOverview tasks={tasks} onToggleTask={onToggleTask} />
          <TeamActivity />
          <AnalyticsSnapshot />
          <CollaborationShortcuts />
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
}

// --- Sub-components ---

function AnimatedGradientBackground({ timeOfDay }) {
  const colors = getThemeColors();
  
  return (
    <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
      {/* Night background */}
      <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill={colors.background[0]} />
      
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
  );
}

function Header({ username, timeOfDay }) {
    const greetOpacity = useSharedValue(0);
    const greetY = useSharedValue(10);
    const subOpacity = useSharedValue(0);
    const subY = useSharedValue(10);
    const avatarScale = useSharedValue(1);

    useEffect(() => {
        greetOpacity.value = withTiming(1, { duration: 500 });
        greetY.value = withSpring(0, THEME.springConfig);
        subOpacity.value = withDelay(150, withTiming(1, { duration: 500 }));
        subY.value = withDelay(150, withSpring(0, THEME.springConfig));
    }, []);

    const greetStyle = useAnimatedStyle(() => ({ opacity: greetOpacity.value, transform: [{ translateY: greetY.value }] }));
    const subStyle = useAnimatedStyle(() => ({ opacity: subOpacity.value, transform: [{ translateY: subY.value }] }));
    const avatarStyle = useAnimatedStyle(() => ({ transform: [{ scale: avatarScale.value }] }));

    const greetingText = useMemo(() => {
        if (timeOfDay === 'night') return `Good Evening, ${username} 🌙`;
        if (timeOfDay === 'morning') return `Good Morning, ${username} 🌞`;
        return `Good Afternoon, ${username} 👋`;
    }, [timeOfDay, username]);

    return (
        <View className="pt-2 pb-4 flex-row items-start justify-between">
            <View>
                <Animated.Text style={[greetStyle, { color: THEME.colors.text }]} className="text-2xl font-extrabold">{greetingText}</Animated.Text>
                <Animated.Text style={[subStyle, { color: THEME.colors.textSecondary }]} className="mt-1">Ready to crush your goals today?</Animated.Text>
            </View>
            <Animated.View style={avatarStyle}>
                <Pressable
                    onPressIn={() => avatarScale.value = withSpring(0.9, { damping: 10 })}
                    onPressOut={() => avatarScale.value = withSpring(1)}
                    onPress={() => router.push('/settings')}
                    className="items-center justify-center rounded-full"
                    style={{ width: 40, height: 40, backgroundColor: THEME.colors.cardBg }}
                >
                    <Text style={{ color: THEME.colors.text }} className="font-extrabold text-lg">A</Text>
                </Pressable>
            </Animated.View>
        </View>
    );
}

function StreakAndMotivation({ scrollY }) {
  const [streakDays] = useState(7);
  const baseFlame = 1 + Math.min(streakDays / 30, 0.5);
  const flame = useSharedValue(baseFlame);
  const tipOpacity = useSharedValue(0);

  useEffect(() => {
    flame.value = withRepeat(withSequence(withTiming(baseFlame + 0.06, { duration: 900 }), withTiming(baseFlame, { duration: 900 })), -1, true);
  }, [baseFlame]);

  const onFlamePress = () => {
    // Haptics.trigger('impactMedium'); // Uncomment for haptics
    flame.value = withSequence(withTiming(baseFlame + 0.2, { duration: 120 }), withSpring(baseFlame));
    tipOpacity.value = withSequence(withTiming(1, { duration: 150 }), withDelay(1200, withTiming(0, { duration: 250 })));
  };

  const dailyQuote = useMemo(() => `“${QUOTES[new Date().getDate() % QUOTES.length]}”`, []);

  const flameContainerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 100], [0, -20], 'clamp') }],
    opacity: interpolate(scrollY.value, [0, 80], [1, 0], 'clamp'),
  }));
  const flameStyle = useAnimatedStyle(() => ({ transform: [{ scale: flame.value }] }));
  const tipStyle = useAnimatedStyle(() => ({ opacity: tipOpacity.value }));
  const quoteCardStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 300 },
      { rotateX: `${interpolate(scrollY.value, [-100, 100], [10, -10], 'clamp')}deg` },
      { scale: interpolate(scrollY.value, [0, 200], [1, 0.95], 'clamp') },
    ]
  }));

  return (
    <View className="items-center mt-2 mb-4">
      <Animated.View style={flameContainerStyle}>
        <Pressable onPress={onFlamePress} className="items-center">
          <Animated.Text className="text-4xl" style={flameStyle}>🔥</Animated.Text>
          <Text style={{ color: THEME.colors.text }} className="font-extrabold mt-1">Streak: {streakDays} days</Text>
        </Pressable>
        <Animated.View style={[{ position: 'absolute', top: -30, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: THEME.colors.black_28 }, tipStyle]}>
          <Text className="text-white/90 text-xs">You’ve focused {streakDays} days in a row!</Text>
        </Animated.View>
      </Animated.View>
              <Animated.View style={[{ marginTop: 24, width: '100%', borderRadius: 16, padding: 16, backgroundColor: THEME.colors.cardBg, borderWidth: 1, borderColor: THEME.colors.cardBorder }, quoteCardStyle]}>
        <Text style={{ color: THEME.colors.textSecondary }} className="text-center font-semibold italic">{dailyQuote}</Text>
      </Animated.View>
    </View>
  );
}

function FocusGoal({ progress, completed, goal, onIncGoal }) {
  return (
    <AnimatedSection index={0} className="mt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-white text-lg font-extrabold">Today’s Focus Goal</Text>
        <Pressable hitSlop={10} onPress={onIncGoal} className="items-center justify-center rounded-full" style={{ width: 32, height: 32, backgroundColor: THEME.colors.white_25 }}>
          <Text style={{ color: THEME.colors.text }} className="font-extrabold text-lg">+</Text>
        </Pressable>
      </View>
      <ShimmeringProgressBar progress={progress} />
      <Text className="text-white/85 mt-2">{completed} / {goal} Pomodoros completed</Text>
    </AnimatedSection>
  );
}

function ShimmeringProgressBar({ progress }) {
    const progressStyle = useAnimatedStyle(() => ({ width: `${Math.max(6, progress.value * 100)}%` }));
    const shimmer = useSharedValue(-0.5);

    useEffect(() => {
        shimmer.value = withRepeat(withTiming(1.5, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1);
    }, []);

    const shimmerStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-SCREEN_W * 0.3, SCREEN_W * 0.3]) }]
    }));
    
    return (
        <View style={{ width: '100%', height: 12, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.14)', marginTop: 10, overflow: 'hidden' }}>
            <Animated.View style={[{ height: '100%', borderRadius: 999, backgroundColor: '#1DB954' }, progressStyle]}>
                <Animated.View style={[{ position: 'absolute', width: '30%', height: '100%', backgroundColor: 'rgba(255,255,255,0.25)' }, shimmerStyle]} />
            </Animated.View>
        </View>
    );
}

function MiniTimer() {
  const CLOCK_R = 40;
  const CLOCK_STROKE = 8;
  const CLOCK_CIRC = 2 * Math.PI * CLOCK_R;
  const timerProgress = useSharedValue(0); // Assuming timer is at 0
  const timerPulse = useSharedValue(0);

  useEffect(() => {
    timerPulse.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })), -1, true);
  }, []);

  const timerPulseStyle = useAnimatedStyle(() => ({ transform: [{ scale: 1 + timerPulse.value * 0.04 }] }));
  const animatedClockProps = useAnimatedProps(() => ({ strokeDashoffset: CLOCK_CIRC * (1 - timerProgress.value) }));

  return (
    <AnimatedSection index={1} className="items-center mt-8">
      <Animated.View style={[{ width: 140, height: 140, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' }, timerPulseStyle]}>
        <Svg width={120} height={120} viewBox="0 0 120 120">
          <Circle cx={60} cy={60} r={CLOCK_R} stroke="rgba(255,255,255,0.22)" strokeWidth={CLOCK_STROKE} fill="rgba(255,255,255,0.04)" />
          <AnimatedCircle cx={60} cy={60} r={CLOCK_R} stroke={THEME.colors.accent_green} strokeWidth={CLOCK_STROKE} fill="none" strokeLinecap="round" strokeDasharray={CLOCK_CIRC} animatedProps={animatedClockProps} transform="rotate(-90 60 60)" />
        </Svg>
        <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
          <Text className="text-white font-extrabold text-3xl">25:00</Text>
        </View>
      </Animated.View>
      <Pressable onPress={() => router.push('/(tabs)/timer')} className="mt-4 rounded-2xl items-center justify-center" style={{ paddingVertical: 14, paddingHorizontal: 28, backgroundColor: '#FF7A49' }}>
        <Text className="text-black font-extrabold text-base">Start Pomodoro</Text>
      </Pressable>
    </AnimatedSection>
  );
}

function TaskOverview({ tasks, onToggleTask }) {
  return (
    <AnimatedSection index={2} className="mt-8">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-lg font-extrabold">Today’s Tasks</Text>
        <Pressable onPress={() => router.push('/(tabs)/tasks')}>
          <Text className="text-white/85">See All →</Text>
        </Pressable>
      </View>
      {tasks.map((t, idx) => (
        <RowTask key={t.id} index={idx} task={t} onToggle={onToggleTask} />
      ))}
    </AnimatedSection>
  );
}

function RowTask({ task, index, onToggle }) {
  const { title, poms, id, done } = task;
  const y = useSharedValue(20);
  const op = useSharedValue(0);
  const doneSv = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    y.value = withDelay(80 * index, withSpring(0, THEME.springConfig));
    op.value = withDelay(80 * index, withTiming(1, { duration: 400 }));
  }, []);
  
  useEffect(() => {
    doneSv.value = withTiming(done ? 1 : 0, { duration: 300 });
  }, [done]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: op.value,
  }));
  
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(doneSv.value, [0, 1], [1, 0.5])
  }));
  
  const lineStyle = useAnimatedStyle(() => ({
    width: `${interpolate(doneSv.value, [0, 1], [0, 100])}%`
  }));

  const renderRightActions = () => (
    <Pressable
      onPress={() => onToggle(id)}
      style={{ backgroundColor: THEME.colors.accent_green, width: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 14, marginBottom: 8 }}>
      <Text className="text-white font-bold">{done ? 'Undo' : 'Done'}</Text>
    </Pressable>
  );

  return (
    <Swipeable renderRightActions={renderRightActions} rightThreshold={40} onSwipeableOpen={() => onToggle(id)}>
      <Animated.View style={[{ marginBottom: 8 }, containerStyle]}>
        <Animated.View style={[{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', padding: 14, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.08)'}, contentStyle]}>
          <View className="flex-row items-center justify-between">
            <View>
              <View>
                <Text className="text-white text-base">{title}</Text>
                <AnimatedLine x1="0" y1="12" x2="100%" y2="12" stroke={THEME.colors.white} strokeWidth={2} style={[{position: 'absolute'}, lineStyle]} />
              </View>
              <Text className="text-white/70 text-xs mt-1">~ {poms} 🍅</Text>
            </View>
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: THEME.colors.white_85, justifyContent: 'center', alignItems: 'center'}}>
                {done && <View style={{width: 14, height: 14, borderRadius: 7, backgroundColor: THEME.colors.white_85}} />}
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Swipeable>
  );
}

function AnalyticsSnapshot() {
  const bars = [10, 22, 16, 28, 12, 26, 20];
  return (
    <AnimatedSection index={4} className="mt-4">
      <Pressable onPress={() => router.push('/(tabs)/analytics')} className="rounded-2xl bg-white/10" style={{ padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
        <Text className="text-white font-extrabold text-lg mb-1">This Week</Text>
        <Text className="text-white/85 mb-3">12 Pomodoros | 5 tasks done</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 40 }}>
          {bars.map((h, i) => <Bar key={i} target={h} index={i} />)}
        </View>
      </Pressable>
    </AnimatedSection>
  );
}

function Bar({ target, index }) {
  const height = useSharedValue(0);
  useEffect(() => { height.value = withDelay(index * 50, withTiming(target, { duration: 600, easing: THEME.easing })); }, [target]);
  const aStyle = useAnimatedStyle(() => ({ height: height.value }));
      return <Animated.View style={[{ flex: 1, borderRadius: 4, backgroundColor: 'white' }, aStyle]} />;
  }

function TeamActivity() {
  const activeMembers = TEAM_MEMBERS.filter(m => m.status === 'focusing').length;
  const totalMembers = TEAM_MEMBERS.length;
  
  return (
    <AnimatedSection index={3} className="mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-lg font-extrabold">Team Activity</Text>
        <View className="flex-row items-center">
          <View className="w-2 h-2 rounded-full bg-green-400 mr-2" />
          <Text className="text-white/85 text-sm">{activeMembers}/{totalMembers} focused</Text>
        </View>
      </View>
      
      <View className="space-y-3">
        {TEAM_MEMBERS.map((member, index) => (
          <TeamMemberCard key={member.id} member={member} index={index} />
        ))}
      </View>
      
      <Pressable 
        onPress={() => router.push('/(tabs)/collaboration')}
        className="mt-4 rounded-2xl bg-white/10 items-center justify-center py-3 border border-white/20"
      >
        <Text className="text-white font-semibold">View Full Team</Text>
      </Pressable>
    </AnimatedSection>
  );
}

function TeamMemberCard({ member, index }) {
  const { name, avatar, status, task, timeLeft, color } = member;
  const y = useSharedValue(20);
  const op = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(50 * index, withSpring(0, THEME.springConfig));
    op.value = withDelay(50 * index, withTiming(1, { duration: 400 }));
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: op.value,
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'focusing': return '#FF6B4A';
      case 'break': return '#4B00B5';
      case 'available': return '#34C759';
      default: return '#FF9500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'focusing': return 'Focusing';
      case 'break': return 'On Break';
      case 'available': return 'Available';
      default: return 'Away';
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View className="flex-row items-center p-3 rounded-2xl bg-white/8 border border-white/15">
        <View 
          className="w-10 h-10 rounded-full items-center justify-center mr-3"
          style={{ backgroundColor: color + '20' }}
        >
          <Text className="text-white font-bold text-lg">{avatar}</Text>
        </View>
        
        <View className="flex-1">
          <View className="flex-row items-center justify-between">
            <Text className="text-white font-semibold">{name}</Text>
            <View className="flex-row items-center">
              <View 
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getStatusColor() }}
              />
              <Text className="text-white/70 text-xs">{getStatusText()}</Text>
            </View>
          </View>
          
          <Text className="text-white/85 text-sm mt-1">{task}</Text>
          
          {timeLeft && (
            <View className="flex-row items-center mt-1">
              <Text className="text-white/60 text-xs">⏱️ {timeLeft} left</Text>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function CollaborationShortcuts() {
  return (
    <AnimatedSection index={5} className="mt-6 flex-row justify-between">
      <CardSmall label="My Team" icon="👥" onPress={() => router.push('/(tabs)/collaboration')} />
      <CardSmall label="Pair Focus" icon="🤝" onPress={() => router.push('/(tabs)/collaboration')} />
    </AnimatedSection>
  );
}

function CardSmall({ label, icon, onPress }) {
  const pressed = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: pressed.value }] }));
  return (
    <Animated.View style={[{ width: (SCREEN_W - 20 * 2 - 12) / 2 }, aStyle]}>
      <Pressable
        onPressIn={() => (pressed.value = withSpring(0.96))}
        onPressOut={() => (pressed.value = withSpring(1))}
        onPress={onPress}
        className="rounded-2xl bg-white/12 items-center"
        style={{ padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' }}
      >
        <Text className="text-3xl mb-2">{icon}</Text>
        <Text className="text-white font-extrabold text-base">{label}</Text>
      </Pressable>
    </Animated.View>
  );
}

// Helper for staggered entrance animations
function AnimatedSection({ children, index, ...props }) {
  const y = useSharedValue(20);
  const op = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(100 + index * 100, withSpring(0, THEME.springConfig));
    op.value = withDelay(100 + index * 100, withTiming(1, { duration: 500 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [{ translateY: y.value }],
  }));

  return <Animated.View style={style} {...props}>{children}</Animated.View>;
}