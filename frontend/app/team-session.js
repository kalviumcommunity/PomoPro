import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Rect } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const THEME = {
  background: '#0D0D2B',
  cardBg: 'rgba(255, 255, 255, 0.1)',
  cardBorder: 'rgba(255, 255, 255, 0.2)',
  text: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.7)',
  accent: '#FF7A49',
  accentGreen: '#1DB954',
  accentRed: '#FF6B4A',
  accentBlue: '#4B00B5',
};

const FONT_FAMILY = 'Space Grotesk';

const TEAM_MEMBERS = [
  { id: 1, name: 'Sarah', avatar: 'S', status: 'focusing', task: 'Design Review', timeLeft: '12:34', color: '#FF6B4A', progress: 0.7 },
  { id: 2, name: 'Mike', avatar: 'M', status: 'break', task: 'API Integration', timeLeft: '05:12', color: '#4B00B5', progress: 0.3 },
  { id: 3, name: 'Emma', avatar: 'E', status: 'focusing', task: 'Code Review', timeLeft: '18:45', color: '#34C759', progress: 0.9 },
  { id: 4, name: 'David', avatar: 'D', status: 'focusing', task: 'Testing', timeLeft: '08:22', color: '#FF9500', progress: 0.5 },
];

const SAMPLE_MESSAGES = [
  { id: 1, user: 'Sarah', message: 'Great progress everyone! 🚀', timestamp: '2 min ago', avatar: 'S', color: '#FF6B4A' },
  { id: 2, user: 'Mike', message: 'Taking a quick break, back in 5', timestamp: '1 min ago', avatar: 'M', color: '#4B00B5' },
  { id: 3, user: 'Emma', message: 'Almost done with the code review', timestamp: '30 sec ago', avatar: 'E', color: '#34C759' },
];

function Ring({ size = 40, stroke = 4, progress = 0.5, color = '#6366F1' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={'rgba(255,255,255,0.15)'} strokeWidth={stroke} fill="none" />
      <Circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
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
  );
}

function TeamMemberTimer({ member, index }) {
  const { name, avatar, status, task, timeLeft, color, progress } = member;
  const pulse = useSharedValue(0);

  useEffect(() => {
    if (status === 'focusing') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1200 }),
          withTiming(0, { duration: 1200 })
        ),
        -1,
        true
      );
    }
  }, [status]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + pulse.value * 0.05 }],
    opacity: 0.8 + pulse.value * 0.2,
  }));

  const getStatusColor = () => {
    switch (status) {
      case 'focusing': return THEME.accentRed;
      case 'break': return THEME.accentBlue;
      case 'available': return THEME.accentGreen;
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
    <Animated.View style={pulseStyle}>
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        backgroundColor: THEME.cardBg,
        borderWidth: 1,
        borderColor: THEME.cardBorder,
        marginBottom: 12,
      }}>
        <View style={{
          width: 50,
          height: 50,
          borderRadius: 25,
          backgroundColor: color + '20',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 2,
          borderColor: color,
        }}>
          <Text style={{ color: color, fontWeight: 'bold', fontSize: 18 }}>{avatar}</Text>
        </View>
        
        <View style={{ flex: 1, marginLeft: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.text, 
              fontSize: 16, 
              fontWeight: '700' 
            }}>
              {name}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View 
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: getStatusColor(),
                  marginRight: 8,
                }}
              />
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                color: THEME.textSecondary, 
                fontSize: 12 
              }}>
                {getStatusText()}
              </Text>
            </View>
          </View>
          
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: THEME.textSecondary, 
            fontSize: 14, 
            marginTop: 4 
          }}>
            {task}
          </Text>
          
          {timeLeft && (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                color: THEME.textSecondary, 
                fontSize: 12 
              }}>
                ⏱️ {timeLeft} left
              </Text>
            </View>
          )}
        </View>
        
        <View style={{ marginLeft: 16 }}>
          <Ring size={40} stroke={4} progress={progress} color={color} />
        </View>
      </View>
    </Animated.View>
  );
}

function ChatMessage({ message }) {
  const { user, message: text, timestamp, avatar, color } = message;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 12,
      borderRadius: 16,
      backgroundColor: THEME.cardBg,
      borderWidth: 1,
      borderColor: THEME.cardBorder,
      marginBottom: 8,
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: color + '20',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
      }}>
        <Text style={{ color: color, fontWeight: 'bold', fontSize: 14 }}>{avatar}</Text>
      </View>
      
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: THEME.text, 
            fontSize: 14, 
            fontWeight: '600',
            marginRight: 8,
          }}>
            {user}
          </Text>
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: THEME.textSecondary, 
            fontSize: 12 
          }}>
            {timestamp}
          </Text>
        </View>
        
        <Text style={{ 
          fontFamily: FONT_FAMILY,
          color: THEME.textSecondary, 
          fontSize: 14,
          lineHeight: 20,
        }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

export default function TeamSessionScreen() {
  const [messages, setMessages] = useState(SAMPLE_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [sessionTime, setSessionTime] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [sessionPhase, setSessionPhase] = useState('focus'); // 'focus' or 'break'

  const timerProgress = useSharedValue(0);
  const timerPulse = useSharedValue(0);

  useEffect(() => {
    timerPulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200 }),
        withTiming(0, { duration: 1200 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    if (isRunning) {
      const interval = setInterval(() => {
        setSessionTime(prev => {
          if (prev <= 1) {
            setIsRunning(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setSessionPhase(prevPhase => prevPhase === 'focus' ? 'break' : 'focus');
            return prevPhase === 'focus' ? 5 * 60 : 25 * 60; // Switch between 25min focus and 5min break
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isRunning, sessionPhase]);

  useEffect(() => {
    timerProgress.value = withTiming(1 - (sessionTime / (sessionPhase === 'focus' ? 25 * 60 : 5 * 60)), { duration: 1000 });
  }, [sessionTime, sessionPhase]);

  const timerPulseStyle = useAnimatedStyle(() => ({ 
    transform: [{ scale: 1 + timerPulse.value * 0.02 }] 
  }));

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRunning(!isRunning);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now(),
        user: 'You',
        message: newMessage.trim(),
        timestamp: 'now',
        avatar: 'Y',
        color: THEME.accent,
      };
      setMessages(prev => [message, ...prev]);
      setNewMessage('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
      {/* Night background with stars */}
      <Svg width={SCREEN_W} height={SCREEN_H} style={{ position: 'absolute' }}>
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
        <Circle cx={SCREEN_W * 0.90} cy={SCREEN_H * 0.54} r={1} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.45} cy={SCREEN_H * 0.35} r={0.7} fill="#FFFFFF" fillOpacity={0.6} />
        <Circle cx={SCREEN_W * 0.68} cy={SCREEN_H * 0.45} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
        <Circle cx={SCREEN_W * 0.22} cy={SCREEN_H * 0.42} r={0.6} fill="#FFFFFF" fillOpacity={0.5} />
        <Circle cx={SCREEN_W * 0.78} cy={SCREEN_H * 0.32} r={1.1} fill="#FFFFFF" fillOpacity={0.9} />
        <Circle cx={SCREEN_W * 0.35} cy={SCREEN_H * 0.75} r={0.8} fill="#FFFFFF" fillOpacity={0.7} />
        <Circle cx={SCREEN_W * 0.65} cy={SCREEN_H * 0.82} r={0.9} fill="#FFFFFF" fillOpacity={0.8} />
      </Svg>

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: THEME.text, fontSize: 28, fontWeight: '800' }}>Team Session</Text>
          <Text style={{ color: THEME.textSecondary, fontSize: 16, marginTop: 4 }}>
            {sessionPhase === 'focus' ? 'Focus Time' : 'Break Time'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.back()}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 16,
            backgroundColor: THEME.cardBg,
            borderWidth: 1,
            borderColor: THEME.cardBorder,
          }}
        >
          <Text style={{ color: THEME.text, fontWeight: '700' }}>Exit</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Timer */}
          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            <Animated.View style={[{ 
              width: 200, 
              height: 200, 
              borderRadius: 100, 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: THEME.cardBg,
              borderWidth: 2,
              borderColor: sessionPhase === 'focus' ? THEME.accentRed : THEME.accentBlue,
            }, timerPulseStyle]}>
              <Svg width={160} height={160}>
                <Circle cx={80} cy={80} r={70} stroke="rgba(255,255,255,0.15)" strokeWidth={8} fill="none" />
                <Circle
                  cx={80}
                  cy={80}
                  r={70}
                  stroke={sessionPhase === 'focus' ? THEME.accentRed : THEME.accentBlue}
                  strokeWidth={8}
                  fill="none"
                  strokeDasharray={2 * Math.PI * 70}
                  strokeDashoffset={2 * Math.PI * 70 * (1 - timerProgress.value)}
                  strokeLinecap="round"
                  rotation="-90"
                  originX={80}
                  originY={80}
                />
              </Svg>
              <View style={{ position: 'absolute', alignItems: 'center' }}>
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  color: THEME.text, 
                  fontSize: 36, 
                  fontWeight: '800' 
                }}>
                  {formatTime(sessionTime)}
                </Text>
                <Text style={{ 
                  fontFamily: FONT_FAMILY,
                  color: THEME.textSecondary, 
                  fontSize: 16 
                }}>
                  {sessionPhase === 'focus' ? 'Focus' : 'Break'}
                </Text>
              </View>
            </Animated.View>
            
            <Pressable
              onPress={toggleTimer}
              style={{
                marginTop: 24,
                paddingVertical: 16,
                paddingHorizontal: 32,
                borderRadius: 20,
                backgroundColor: isRunning ? THEME.accentRed : THEME.accent,
                alignItems: 'center',
              }}
            >
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                color: '#FFFFFF', 
                fontWeight: '700', 
                fontSize: 18 
              }}>
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </Pressable>
          </View>

          {/* Team Members */}
          <View style={{ marginBottom: 32 }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.text, 
              fontSize: 20, 
              fontWeight: '700', 
              marginBottom: 16 
            }}>
              👥 Team Members
            </Text>
            {TEAM_MEMBERS.map((member, index) => (
              <TeamMemberTimer key={member.id} member={member} index={index} />
            ))}
          </View>

          {/* Chat Section */}
          <View>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.text, 
              fontSize: 20, 
              fontWeight: '700', 
              marginBottom: 16 
            }}>
              💬 Team Chat
            </Text>
            <View style={{ 
              maxHeight: 200, 
              marginBottom: 16,
              padding: 16,
              borderRadius: 16,
              backgroundColor: THEME.cardBg,
              borderWidth: 1,
              borderColor: THEME.cardBorder,
            }}>
              <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <ChatMessage message={item} />}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                inverted
              />
            </View>
            
            {/* Message Input */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TextInput
                placeholder="Type a message..."
                placeholderTextColor={THEME.textSecondary}
                value={newMessage}
                onChangeText={setNewMessage}
                style={{
                  flex: 1,
                  backgroundColor: THEME.cardBg,
                  borderWidth: 1,
                  borderColor: THEME.cardBorder,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  color: THEME.text,
                  marginRight: 12,
                }}
              />
              <Pressable
                onPress={sendMessage}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  backgroundColor: THEME.accent,
                }}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Send</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
