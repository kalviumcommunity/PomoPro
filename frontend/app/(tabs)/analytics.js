import React, { useEffect, useMemo } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Theme colors for night mode
const THEME = {
  background: '#0D0D2B',
  cardBg: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  textTertiary: 'rgba(255, 255, 255, 0.5)',
  accent: '#FF7A49',
  accentGreen: '#1DB954',
  accentBlue: '#4B00B5',
  accentPurple: '#AF52DE',
  white_25: 'rgba(255, 255, 255, 0.25)',
  white_85: 'rgba(255, 255, 255, 0.85)',
  black_28: 'rgba(0, 0, 0, 0.28)',
};

const FONT_FAMILY = 'Space Grotesk';

// Sample analytics data
const WEEKLY_DATA = [
  { day: 'Mon', focus: 4, break: 1, total: 5 },
  { day: 'Tue', focus: 6, break: 2, total: 8 },
  { day: 'Wed', focus: 5, break: 1, total: 6 },
  { day: 'Thu', focus: 7, break: 2, total: 9 },
  { day: 'Fri', focus: 3, break: 1, total: 4 },
  { day: 'Sat', focus: 2, break: 1, total: 3 },
  { day: 'Sun', focus: 1, break: 0, total: 1 },
];

const PRODUCTIVITY_STATS = [
  { label: 'Total Focus Time', value: '28h 45m', change: '+12%', color: THEME.accent },
  { label: 'Completed Tasks', value: '47', change: '+8%', color: THEME.accentGreen },
  { label: 'Focus Sessions', value: '156', change: '+15%', color: THEME.accentBlue },
  { label: 'Productivity Score', value: '87%', change: '+5%', color: THEME.accentPurple },
];

const QUOTES = [
  'Data is the new oil.',
  'Analytics is the discovery, interpretation, and communication of meaningful patterns in data.',
  'The goal is to turn data into information, and information into insight.',
  'Without data you\'re just another person with an opinion.',
  'Data beats emotions.',
];

function AnimatedCard({ children, index, onPress }) {
  const enterY = useSharedValue(20);
  const enterOp = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    enterY.value = withDelay(index * 100, withSpring(0, { damping: 16, stiffness: 140 }));
    enterOp.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
  }, [index]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: enterY.value }, { scale: scale.value }],
    opacity: enterOp.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  return (
    <Animated.View style={cardStyle}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={{
          backgroundColor: THEME.cardBg,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: THEME.cardBorder,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 2,
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

function StatCard({ stat, index }) {
  const { label, value, change, color } = stat;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.02 }],
    opacity: 0.9 + pulse.value * 0.1,
  }));

  return (
    <AnimatedCard index={index}>
      <Animated.View style={pulseStyle}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: color, 
            fontSize: 28, 
            fontWeight: '800',
            marginBottom: 4,
          }}>
            {value}
          </Text>
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: THEME.textSecondary, 
            fontSize: 14,
            textAlign: 'center',
            marginBottom: 8,
          }}>
            {label}
          </Text>
          <View style={{ 
            backgroundColor: color + '20', 
            paddingHorizontal: 8, 
            paddingVertical: 4, 
            borderRadius: 12 
          }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: color, 
              fontSize: 12, 
              fontWeight: '600' 
            }}>
              {change}
            </Text>
          </View>
        </View>
      </Animated.View>
    </AnimatedCard>
  );
}

function WeeklyChart({ data }) {
  const maxValue = Math.max(...data.map(d => d.total));
  
  return (
    <AnimatedCard index={2}>
      <Text style={{ 
        fontFamily: FONT_FAMILY,
        fontSize: 20, 
        fontWeight: '700', 
        color: THEME.text,
        marginBottom: 16,
      }}>
        📊 Weekly Overview
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120 }}>
        {data.map((item, index) => (
          <View key={item.day} style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ 
              width: 20, 
              height: (item.total / maxValue) * 80, 
              backgroundColor: THEME.accent,
              borderRadius: 10,
              marginBottom: 8,
            }} />
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.textSecondary, 
              fontSize: 12 
            }}>
              {item.day}
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.textTertiary, 
              fontSize: 10 
            }}>
              {item.total}
            </Text>
          </View>
        ))}
      </View>
    </AnimatedCard>
  );
}

export default function AnalyticsScreen() {
  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * QUOTES.length);
    return QUOTES[idx];
  }, []);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);
  const quoteOpacity = useSharedValue(0);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    titleY.value = withSpring(0, { damping: 16, stiffness: 140 });
    quoteOpacity.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) }));
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: THEME.background }}>
      {/* Night background with stars */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
        {/* Night background */}
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill={THEME.background} />
        
        {/* Stars */}
        <Circle cx={SCREEN_W * 0.15} cy={SCREEN_H * 0.18} r={1} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.32} cy={SCREEN_H * 0.28} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.58} cy={SCREEN_H * 0.22} r={1.2} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.84} cy={SCREEN_H * 0.18} r={0.6} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={SCREEN_W * 0.12} cy={SCREEN_H * 0.56} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.28} cy={SCREEN_H * 0.66} r={0.7} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.52} cy={SCREEN_H * 0.62} r={1.1} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.76} cy={SCREEN_H * 0.68} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.90} cy={SCREEN_W * 0.54} r={1} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.45} cy={SCREEN_H * 0.35} r={0.7} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={SCREEN_W * 0.68} cy={SCREEN_H * 0.45} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.22} cy={SCREEN_H * 0.42} r={0.6} fill="#FFFFFF" fillOpacity={0.5} />
        <Circle cx={SCREEN_W * 0.78} cy={SCREEN_H * 0.32} r={1.1} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.35} cy={SCREEN_H * 0.75} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.65} cy={SCREEN_H * 0.82} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
      </Svg>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View style={titleStyle}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              fontSize: 32, 
              fontWeight: '800', 
              color: THEME.text,
              marginBottom: 8,
              letterSpacing: -0.5,
            }}>
              Analytics
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              fontSize: 16, 
              color: THEME.textSecondary,
              marginBottom: 24,
            }}>
              Track your productivity and insights
            </Text>
          </Animated.View>

          {/* Quote Card */}
          <AnimatedCard index={0}>
            <Animated.View style={quoteStyle}>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                fontSize: 16, 
                fontWeight: '600', 
                color: THEME.text,
                marginBottom: 8,
                textAlign: 'center',
                fontStyle: 'italic',
              }}>
                "{quote}"
              </Text>
            </Animated.View>
          </AnimatedCard>

          {/* Stats Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 16 }}>
            {PRODUCTIVITY_STATS.map((stat, index) => (
              <View key={stat.label} style={{ width: '48%', marginBottom: 8 }}>
                <StatCard stat={stat} index={index + 1} />
              </View>
            ))}
          </View>

          {/* Weekly Chart */}
          <WeeklyChart data={WEEKLY_DATA} />

          {/* Insights */}
          <AnimatedCard index={3}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              fontSize: 20, 
              fontWeight: '700', 
              color: THEME.text,
              marginBottom: 16,
            }}>
              💡 Insights
            </Text>
            <View style={{ marginBottom: 16 }}>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                fontSize: 14, 
                color: THEME.textSecondary,
                lineHeight: 20,
                marginBottom: 12,
              }}>
                Your productivity peaks on Thursdays with 9 completed sessions. 
                Consider scheduling your most important tasks on this day.
              </Text>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                fontSize: 14, 
                color: THEME.textSecondary,
                lineHeight: 20,
              }}>
                You're 15% more productive when taking regular breaks. 
                Keep up the good work with your break schedule!
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1, backgroundColor: THEME.white_25, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.accent, fontSize: 20, fontWeight: '800' }}>87%</Text>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textSecondary, fontSize: 12 }}>Focus Score</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: THEME.white_25, borderRadius: 8, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.accentGreen, fontSize: 20, fontWeight: '800' }}>156</Text>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textSecondary, fontSize: 12 }}>Sessions</Text>
              </View>
            </View>
          </AnimatedCard>

          {/* Goals */}
          <AnimatedCard index={4}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              fontSize: 20, 
              fontWeight: '700', 
              color: THEME.text,
              marginBottom: 16,
            }}>
              🎯 This Week's Goals
            </Text>
            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: THEME.accentGreen, marginRight: 12 }} />
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 14, 
                  color: THEME.textSecondary,
                  flex: 1,
                }}>
                  Complete 50 focus sessions
                </Text>
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 12, 
                  color: THEME.accentGreen,
                  fontWeight: '600',
                }}>
                  156/50
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: THEME.accentGreen, marginRight: 12 }} />
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 14, 
                  color: THEME.textSecondary,
                  flex: 1,
                }}>
                  Maintain 85% focus score
                </Text>
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 12, 
                  color: THEME.accentGreen,
                  fontWeight: '600',
                }}>
                  87%
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: THEME.accent, marginRight: 12 }} />
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 14, 
                  color: THEME.textSecondary,
                  flex: 1,
                }}>
                  Complete 60 tasks
                </Text>
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  fontSize: 12, 
                  color: THEME.accent,
                  fontWeight: '600',
                }}>
                  47/60
                </Text>
              </View>
            </View>
            <Pressable
              style={{
                backgroundColor: THEME.accent,
                borderRadius: 12,
                paddingVertical: 12,
                paddingHorizontal: 20,
                alignItems: 'center',
                marginTop: 8,
              }}
            >
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 14 
              }}>
                Set New Goals
              </Text>
            </Pressable>
          </AnimatedCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
