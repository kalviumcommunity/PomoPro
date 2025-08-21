import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Theme Constants
const getThemeColors = () => ({
  background: ['#0D0D2B', '#000000'],
  accent: ['#FF7A49', '#FF3B30'],
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  cardBg: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  accentGreen: '#1DB954',
  white_25: 'rgba(255, 255, 255, 0.25)',
});

const THEME = {
  colors: getThemeColors(),
  easing: Easing.out(Easing.quad),
  springConfig: { damping: 14, stiffness: 140 },
};

// Sample Data
const SAMPLE_MEMBERS = [
  { id: 1, name: 'Sarah', avatar: 'S', status: 'focusing', task: 'Design Review', timeLeft: '12:34', color: '#FF6B4A' },
  { id: 2, name: 'Mike', avatar: 'M', status: 'break', task: 'API Integration', timeLeft: '05:12', color: '#4B00B5' },
  { id: 3, name: 'Emma', avatar: 'E', status: 'available', task: 'Code Review', timeLeft: null, color: '#34C759' },
  { id: 4, name: 'David', avatar: 'D', status: 'focusing', task: 'Testing', timeLeft: '18:45', color: '#FF9500' },
];

const SAMPLE_SESSIONS = [
  { id: 1, type: 'focus', duration: 25, participants: 4, active: true },
  { id: 2, type: 'break', duration: 5, participants: 2, active: false },
];

const QUOTES = [
  'Teamwork makes the dream work.',
  'Alone we can do so little; together we can do so much.',
  'Coming together is a beginning; keeping together is progress; working together is success.',
  'The strength of the team is each individual member.',
  'Great things in business are never done by one person.',
];

export default function CollaborationScreen() {
  const [teamName, setTeamName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [members, setMembers] = useState(SAMPLE_MEMBERS);
  const [sessions, setSessions] = useState(SAMPLE_SESSIONS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPairModal, setShowPairModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sessionType, setSessionType] = useState('focus');
  const [duration, setDuration] = useState(25);

  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.96);

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

  useEffect(() => {
    if (showCreateModal || showJoinModal || showSessionModal || showPairModal) {
      modalOpacity.value = withTiming(1, { duration: 220 });
      modalScale.value = withSpring(1, THEME.springConfig);
    } else {
      modalOpacity.value = withTiming(0, { duration: 180 });
      modalScale.value = withTiming(0.96, { duration: 180 });
    }
  }, [showCreateModal, showJoinModal, showSessionModal, showPairModal]);

  const aBackdrop = useAnimatedStyle(() => ({ opacity: modalOpacity.value }));
  const aModal = useAnimatedStyle(() => ({ transform: [{ scale: modalScale.value }] }));

  const headerGlow = useSharedValue(0);
  useEffect(() => {
    headerGlow.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, true);
  }, []);
  const headerGlowStyle = useAnimatedStyle(() => ({ shadowOpacity: 0.1 + headerGlow.value * 0.2 }));

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const quoteStyle = useAnimatedStyle(() => ({
    opacity: quoteOpacity.value,
  }));

  const onCreateTeam = () => {
    // Simulate creating team
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCreateModal(false);
    // Update team info
  };

  const onJoinTeam = () => {
    // Simulate joining team
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowJoinModal(false);
    // Update members
  };

  const onStartSession = () => {
    // Simulate starting shared session
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSessionModal(false);
    // Add to sessions
    setSessions(prev => [...prev, { id: Date.now(), type: sessionType, duration, participants: Math.floor(Math.random() * 4) + 2, active: true }]);
  };

  const onInvitePair = (user) => {
    setSelectedUser(user);
    setShowPairModal(true);
  };

  const onStartPair = () => {
    // Simulate starting pair session
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPairModal(false);
    router.push('/team-session'); // Navigate to team session page
  };

  const onJoinTeamSession = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push('/team-session'); // Navigate to team session page
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.colors.background[0] }}>
      <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="30%" r="70%">
            <Stop offset="0%" stopColor={THEME.colors.background[0]} stopOpacity="0.3" />
            <Stop offset="100%" stopColor={THEME.colors.background[1]} stopOpacity="0.3" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width={SCREEN_W} height={SCREEN_H} fill="url(#bg)" />
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

      {/* Header */}
      <Animated.View style={titleStyle}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: THEME.colors.text, fontSize: 28, fontWeight: '800' }}>Collaboration</Text>
            <Text style={{ color: THEME.colors.textSecondary, fontSize: 16, marginTop: 4 }}>
              Team focus sessions and shared productivity
            </Text>
          </View>
          <Animated.View style={headerGlowStyle}>
            <Pressable
              onPress={() => setShowCreateModal(true)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 16,
                backgroundColor: THEME.colors.cardBg,
                borderWidth: 1,
                borderColor: THEME.colors.cardBorder,
              }}
            >
              <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>+ Create Team</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Animated.View>

      {/* Content */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}>
        {/* Quote Card */}
        <AnimatedCard index={0}>
          <Animated.View style={quoteStyle}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: THEME.colors.text,
              marginBottom: 8,
              textAlign: 'center',
              fontStyle: 'italic',
            }}>
              "{quote}"
            </Text>
          </Animated.View>
        </AnimatedCard>

        {/* Team Management */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Team Members</Text>
          <FlatList
            data={members}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <TeamMemberCard member={item} index={index} onInvitePair={() => onInvitePair(item)} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            scrollEnabled={false}
          />
          <Pressable
            onPress={() => setShowJoinModal(true)}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 16,
              backgroundColor: THEME.colors.accent[0],
              alignItems: 'center',
            }}
          >
            <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Join Team</Text>
          </Pressable>
        </View>

        {/* Shared Sessions */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 12 }}>Shared Sessions</Text>
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item, index }) => <SessionCard session={item} index={index} />}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            scrollEnabled={false}
          />
          <Pressable
            onPress={() => setShowSessionModal(true)}
            style={{
              marginTop: 16,
              paddingVertical: 12,
              borderRadius: 16,
              backgroundColor: THEME.colors.accent[0],
              alignItems: 'center',
            }}
          >
            <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Start Shared Session</Text>
          </Pressable>
        </View>

        {/* Shared Analytics */}
        <AnimatedCard index={3}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: THEME.colors.text,
            marginBottom: 16,
          }}>
            📊 Shared Analytics
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: THEME.colors.textSecondary,
            lineHeight: 20,
            marginBottom: 16,
          }}>
            Track team productivity and celebrate collective achievements. 
            Identify collaboration patterns and optimize workflows.
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1, backgroundColor: THEME.colors.white_25, borderRadius: 8, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: THEME.colors.accent[0], fontSize: 24, fontWeight: '800' }}>12</Text>
              <Text style={{ color: THEME.colors.textSecondary, fontSize: 12 }}>Team Poms</Text>
            </View>
            <View style={{ flex: 1, backgroundColor: THEME.colors.white_25, borderRadius: 8, padding: 12, alignItems: 'center' }}>
              <Text style={{ color: THEME.colors.accentGreen, fontSize: 24, fontWeight: '800' }}>5</Text>
              <Text style={{ color: THEME.colors.textSecondary, fontSize: 12 }}>Active Members</Text>
            </View>
          </View>
        </AnimatedCard>

        {/* Join Team Session Button */}
        <AnimatedCard index={4}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: THEME.colors.text,
            marginBottom: 16,
          }}>
            🎯 Project Focus
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: THEME.colors.textSecondary,
            lineHeight: 20,
            marginBottom: 16,
          }}>
            Organize team tasks by project and maintain focus on shared goals. 
            Coordinate breaks and maintain team momentum.
          </Text>
          <Pressable
            onPress={onJoinTeamSession}
            style={{
              backgroundColor: THEME.colors.accent[0],
              borderRadius: 12,
              paddingVertical: 12,
              paddingHorizontal: 20,
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Text style={{ 
              color: '#FFFFFF', 
              fontWeight: '700', 
              fontSize: 14 
            }}>
              Join Team Session
            </Text>
          </Pressable>
        </AnimatedCard>
      </ScrollView>

      {/* Modals */}
      {showCreateModal && (
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }, aBackdrop]}>
          <Animated.View
            style={[{
              width: '80%',
              backgroundColor: THEME.colors.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: THEME.colors.cardBorder,
            }, aModal]}
          >
            <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Create Team</Text>
            <TextInput
              placeholder="Team Name"
              placeholderTextColor={THEME.colors.textSecondary}
              value={teamName}
              onChangeText={setTeamName}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: THEME.colors.cardBorder,
                borderRadius: 12,
                padding: 12,
                color: THEME.colors.text,
                marginBottom: 16,
              }}
            />
            <Pressable
              onPress={onCreateTeam}
              style={{
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: THEME.colors.accent[0],
                alignItems: 'center',
              }}
            >
              <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Create</Text>
            </Pressable>
            <Pressable onPress={() => setShowCreateModal(false)} style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: THEME.colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {showJoinModal && (
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }, aBackdrop]}>
          <Animated.View
            style={[{
              width: '80%',
              backgroundColor: THEME.colors.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: THEME.colors.cardBorder,
            }, aModal]}
          >
            <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Join Team</Text>
            <TextInput
              placeholder="Invite Code"
              placeholderTextColor={THEME.colors.textSecondary}
              value={inviteCode}
              onChangeText={setInviteCode}
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: THEME.colors.cardBorder,
                borderRadius: 12,
                padding: 12,
                color: THEME.colors.text,
                marginBottom: 16,
              }}
            />
            <Pressable
              onPress={onJoinTeam}
              style={{
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: THEME.colors.accent[0],
                alignItems: 'center',
              }}
            >
              <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Join</Text>
            </Pressable>
            <Pressable onPress={() => setShowJoinModal(false)} style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: THEME.colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {showSessionModal && (
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }, aBackdrop]}>
          <Animated.View
            style={[{
              width: '80%',
              backgroundColor: THEME.colors.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: THEME.colors.cardBorder,
            }, aModal]}
          >
            <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Start Shared Session</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16 }}>
              <Pressable onPress={() => setSessionType('focus')} style={{ padding: 8, backgroundColor: sessionType === 'focus' ? THEME.colors.accent[0] : THEME.colors.cardBg, borderRadius: 8 }}>
                <Text style={{ color: THEME.colors.text }}>Focus</Text>
              </Pressable>
              <Pressable onPress={() => setSessionType('break')} style={{ padding: 8, backgroundColor: sessionType === 'break' ? THEME.colors.accent[0] : THEME.colors.cardBg, borderRadius: 8 }}>
                <Text style={{ color: THEME.colors.text }}>Break</Text>
              </Pressable>
            </View>
            <TextInput
              placeholder="Duration (minutes)"
              placeholderTextColor={THEME.colors.textSecondary}
              value={duration.toString()}
              onChangeText={(text) => setDuration(parseInt(text) || 25)}
              keyboardType="numeric"
              style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                borderColor: THEME.colors.cardBorder,
                borderRadius: 12,
                padding: 12,
                color: THEME.colors.text,
                marginBottom: 16,
              }}
            />
            <Pressable
              onPress={onStartSession}
              style={{
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: THEME.colors.accent[0],
                alignItems: 'center',
              }}
            >
              <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Start</Text>
            </Pressable>
            <Pressable onPress={() => setShowSessionModal(false)} style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: THEME.colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}

      {showPairModal && (
        <Animated.View style={[{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }, aBackdrop]}>
          <Animated.View
            style={[{
              width: '80%',
              backgroundColor: THEME.colors.cardBg,
              borderRadius: 24,
              padding: 24,
              borderWidth: 1,
              borderColor: THEME.colors.cardBorder,
            }, aModal]}
          >
            <Text style={{ color: THEME.colors.text, fontSize: 20, fontWeight: '700', marginBottom: 16 }}>Pair Focus with {selectedUser?.name}</Text>
            {/* Task selection would go here */}
            <Text style={{ color: THEME.colors.textSecondary, marginBottom: 16 }}>Choose tasks and start paired session.</Text>
            <Pressable
              onPress={onStartPair}
              style={{
                paddingVertical: 12,
                borderRadius: 16,
                backgroundColor: THEME.colors.accent[0],
                alignItems: 'center',
              }}
            >
              <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>Start Pair Session</Text>
            </Pressable>
            <Pressable onPress={() => setShowPairModal(false)} style={{ alignItems: 'center', marginTop: 8 }}>
              <Text style={{ color: THEME.colors.textSecondary }}>Cancel</Text>
            </Pressable>
          </Animated.View>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

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
          backgroundColor: THEME.colors.cardBg,
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: THEME.colors.cardBorder,
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

function TeamMemberCard({ member, index, onInvitePair }) {
  const y = useSharedValue(20);
  const op = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(50 * index, withSpring(0, THEME.springConfig));
    op.value = withDelay(50 * index, withTiming(1, { duration: 400 }));
  }, [index]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: op.value,
  }));

  const getStatusColor = (status) => {
    switch (status) {
      case 'focusing': return '#FF6B4A';
      case 'break': return '#4B00B5';
      case 'available': return '#34C759';
      default: return '#FF9500';
    }
  };

  return (
    <Animated.View style={containerStyle}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        backgroundColor: THEME.colors.cardBg,
        borderWidth: 1,
        borderColor: THEME.colors.cardBorder,
      }}>
        <View style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: member.color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Text style={{ color: THEME.colors.text, fontWeight: '700' }}>{member.avatar}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: THEME.colors.text, fontWeight: '600' }}>{member.name}</Text>
          <Text style={{ color: THEME.colors.textSecondary, fontSize: 12 }}>{member.task}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: getStatusColor(member.status), marginRight: 4 }} />
          <Text style={{ color: THEME.colors.textSecondary, fontSize: 12 }}>{member.status}</Text>
        </View>
        <Pressable onPress={onInvitePair} style={{ marginLeft: 12, padding: 8, backgroundColor: THEME.colors.accent[0], borderRadius: 8 }}>
          <Text style={{ color: THEME.colors.text, fontSize: 12, fontWeight: '600' }}>Pair</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

function SessionCard({ session, index }) {
  const y = useSharedValue(20);
  const op = useSharedValue(0);

  useEffect(() => {
    y.value = withDelay(50 * index, withSpring(0, THEME.springConfig));
    op.value = withDelay(50 * index, withTiming(1, { duration: 400 }));
  }, [index]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={containerStyle}>
      <View style={{
        padding: 12,
        borderRadius: 16,
        backgroundColor: THEME.colors.cardBg,
        borderWidth: 1,
        borderColor: THEME.colors.cardBorder,
      }}>
        <Text style={{ color: THEME.colors.text, fontWeight: '600' }}>{session.type.charAt(0).toUpperCase() + session.type.slice(1)} Session</Text>
        <Text style={{ color: THEME.colors.textSecondary, fontSize: 12 }}>Duration: {session.duration} min • Participants: {session.participants}</Text>
        <Text style={{ color: session.active ? '#34C759' : THEME.colors.textSecondary, fontSize: 12 }}>{session.active ? 'Active' : 'Ended'}</Text>
      </View>
    </Animated.View>
  );
}