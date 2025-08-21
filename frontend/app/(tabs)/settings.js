import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { Alert, Dimensions, Pressable, ScrollView, Switch, Text, TextInput, View } from 'react-native';
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
  accentRed: '#FF6B4A',
  accentBlue: '#4B00B5',
  accentPurple: '#AF52DE',
  white_25: 'rgba(255, 255, 255, 0.25)',
  white_85: 'rgba(255, 255, 255, 0.85)',
  black_28: 'rgba(0, 0, 0, 0.28)',
};

const FONT_FAMILY = 'Space Grotesk';

// Sample user data
const USER_DATA = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  avatar: 'AJ',
  level: 'Focus Master',
  streak: 28,
  totalSessions: 156,
  joinDate: 'March 2024',
};

const SETTINGS_SECTIONS = [
  {
    title: 'Profile',
    icon: '👤',
    items: [
      { id: 'name', label: 'Display Name', type: 'input', value: USER_DATA.name },
      { id: 'email', label: 'Email', type: 'input', value: USER_DATA.email },
      { id: 'avatar', label: 'Avatar', type: 'button', value: 'Change' },
    ]
  },
  {
    title: 'Timer Settings',
    icon: '⏱️',
    items: [
      { id: 'focusDuration', label: 'Focus Duration', type: 'select', value: '25 min' },
      { id: 'breakDuration', label: 'Break Duration', type: 'select', value: '5 min' },
      { id: 'longBreakDuration', label: 'Long Break Duration', type: 'select', value: '15 min' },
      { id: 'autoStartBreaks', label: 'Auto-start Breaks', type: 'switch', value: true },
      { id: 'autoStartPomodoros', label: 'Auto-start Pomodoros', type: 'switch', value: false },
    ]
  },
  {
    title: 'Notifications',
    icon: '🔔',
    items: [
      { id: 'sessionComplete', label: 'Session Complete', type: 'switch', value: true },
      { id: 'breakReminders', label: 'Break Reminders', type: 'switch', value: true },
      { id: 'dailyGoals', label: 'Daily Goal Reminders', type: 'switch', value: false },
      { id: 'weeklyReports', label: 'Weekly Reports', type: 'switch', value: true },
    ]
  },
  {
    title: 'Sound & Haptics',
    icon: '🔊',
    items: [
      { id: 'soundEnabled', label: 'Sound Effects', type: 'switch', value: true },
      { id: 'hapticFeedback', label: 'Haptic Feedback', type: 'switch', value: true },
      { id: 'focusSounds', label: 'Focus Sounds', type: 'select', value: 'Ocean Waves' },
      { id: 'breakSounds', label: 'Break Sounds', type: 'select', value: 'Gentle Bell' },
    ]
  },
  {
    title: 'Appearance',
    icon: '🎨',
    items: [
      { id: 'darkMode', label: 'Dark Mode', type: 'switch', value: true },
      { id: 'animations', label: 'Animations', type: 'switch', value: true },
      { id: 'reducedMotion', label: 'Reduced Motion', type: 'switch', value: false },
    ]
  },
  {
    title: 'Data & Privacy',
    icon: '🔒',
    items: [
      { id: 'dataSync', label: 'Cloud Sync', type: 'switch', value: true },
      { id: 'analytics', label: 'Analytics', type: 'switch', value: true },
      { id: 'exportData', label: 'Export Data', type: 'button', value: 'Export' },
      { id: 'deleteAccount', label: 'Delete Account', type: 'button', value: 'Delete', danger: true },
    ]
  },
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

function ProfileCard({ user, onEdit }) {
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
    <AnimatedCard index={0}>
      <Animated.View style={pulseStyle}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
          <View style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: THEME.accent + '20',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 3,
            borderColor: THEME.accent,
            marginRight: 16,
          }}>
            <Text style={{ color: THEME.accent, fontWeight: 'bold', fontSize: 24 }}>{user.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.text, 
              fontSize: 24, 
              fontWeight: '800',
              marginBottom: 4,
            }}>
              {user.name}
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.accent, 
              fontSize: 16, 
              fontWeight: '600',
              marginBottom: 4,
            }}>
              {user.level}
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.textSecondary, 
              fontSize: 14,
            }}>
              Member since {user.joinDate}
            </Text>
          </View>
        </View>
        
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.accent, 
              fontSize: 24, 
              fontWeight: '800' 
            }}>
              {user.streak}
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.textSecondary, 
              fontSize: 12 
            }}>
              Day Streak
            </Text>
          </View>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.accentGreen, 
              fontSize: 24, 
              fontWeight: '800' 
            }}>
              {user.totalSessions}
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.textSecondary, 
              fontSize: 12 
            }}>
              Sessions
            </Text>
          </View>
        </View>
        
        <Pressable
          onPress={onEdit}
          style={{
            backgroundColor: THEME.accent,
            borderRadius: 12,
            paddingVertical: 12,
            alignItems: 'center',
          }}
        >
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: '#FFFFFF', 
            fontWeight: '700', 
            fontSize: 16 
          }}>
            Edit Profile
          </Text>
        </Pressable>
      </Animated.View>
    </AnimatedCard>
  );
}

function SettingItem({ item, onToggle, onPress }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.value);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(item.id, !item.value);
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (item.type === 'input') {
      setIsEditing(true);
    } else if (item.type === 'button') {
      if (item.danger) {
        Alert.alert(
          'Delete Account',
          'Are you sure you want to delete your account? This action cannot be undone.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => onPress(item.id) },
          ]
        );
      } else {
        onPress(item.id);
      }
    } else {
      onPress(item.id);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    onToggle(item.id, editValue);
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: THEME.cardBorder,
    }}>
      <View style={{ flex: 1 }}>
        <Text style={{ 
          fontFamily: FONT_FAMILY,
          color: item.danger ? THEME.accentRed : THEME.text, 
          fontSize: 16, 
          fontWeight: '600',
          marginBottom: 4,
        }}>
          {item.label}
        </Text>
        {item.type === 'input' && isEditing ? (
          <TextInput
            value={editValue}
            onChangeText={setEditValue}
            style={{
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderWidth: 1,
              borderColor: THEME.cardBorder,
              borderRadius: 8,
              padding: 8,
              color: THEME.text,
              fontSize: 14,
            }}
            placeholderTextColor={THEME.textSecondary}
          />
        ) : (
          <Text style={{ 
            fontFamily: FONT_FAMILY,
            color: THEME.textSecondary, 
            fontSize: 14 
          }}>
            {item.value}
          </Text>
        )}
      </View>
      
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {item.type === 'switch' && (
          <Switch
            value={item.value}
            onValueChange={handleToggle}
            trackColor={{ false: THEME.cardBorder, true: THEME.accent + '40' }}
            thumbColor={item.value ? THEME.accent : THEME.textSecondary}
          />
        )}
        {item.type === 'button' && (
          <Pressable
            onPress={handlePress}
            style={{
              backgroundColor: item.danger ? THEME.accentRed + '20' : THEME.accent + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
            }}
          >
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: item.danger ? THEME.accentRed : THEME.accent, 
              fontSize: 12, 
              fontWeight: '600' 
            }}>
              {item.value}
            </Text>
          </Pressable>
        )}
        {(item.type === 'select' || item.type === 'input') && !isEditing && (
          <Pressable onPress={handlePress}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.accent, 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              {item.type === 'input' ? 'Edit' : 'Change'}
            </Text>
          </Pressable>
        )}
        {item.type === 'input' && isEditing && (
          <Pressable onPress={handleSave}>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              color: THEME.accentGreen, 
              fontSize: 14, 
              fontWeight: '600' 
            }}>
              Save
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SettingsSection({ section, index, onToggle, onPress }) {
  return (
    <AnimatedCard index={index + 1}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ 
          fontFamily: FONT_FAMILY,
          fontSize: 20, 
          fontWeight: '700', 
          color: THEME.text,
          marginBottom: 8,
        }}>
          {section.icon} {section.title}
        </Text>
      </View>
      
      {section.items.map((item, itemIndex) => (
        <SettingItem
          key={item.id}
          item={item}
          onToggle={onToggle}
          onPress={onPress}
        />
      ))}
    </AnimatedCard>
  );
}

export default function SettingsScreen() {
  const [settings, setSettings] = useState(SETTINGS_SECTIONS);
  const [user, setUser] = useState(USER_DATA);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const titleOpacity = useSharedValue(0);
  const titleY = useSharedValue(10);

  useEffect(() => {
    titleOpacity.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.quad) });
    titleY.value = withSpring(0, { damping: 16, stiffness: 140 });
  }, []);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleY.value }],
  }));

  const handleSettingToggle = (id, value) => {
    setSettings(prev => 
      prev.map(section => ({
        ...section,
        items: section.items.map(item => 
          item.id === id ? { ...item, value } : item
        )
      }))
    );
  };

  const handleSettingPress = (id) => {
    switch (id) {
      case 'avatar':
        Alert.alert('Change Avatar', 'Avatar change functionality would be implemented here.');
        break;
      case 'exportData':
        Alert.alert('Export Data', 'Data export functionality would be implemented here.');
        break;
      case 'deleteAccount':
        Alert.alert('Account Deleted', 'Account deletion functionality would be implemented here.');
        break;
      default:
        Alert.alert('Setting', `${id} setting would be implemented here.`);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
    // In a real app, this would navigate to a profile edit screen
    Alert.alert('Edit Profile', 'Profile editing functionality would be implemented here.');
  };

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
        <Circle cx={SCREEN_W * 0.90} cy={SCREEN_H * 0.54} r={1} fill="#FFFFFF" fillOpacity={0.8} />
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
              Settings
            </Text>
            <Text style={{ 
              fontFamily: FONT_FAMILY,
              fontSize: 16, 
              color: THEME.textSecondary,
              marginBottom: 32,
            }}>
              Customize your focus experience
            </Text>
          </Animated.View>

          {/* Profile Card */}
          <ProfileCard user={user} onEdit={handleEditProfile} />

          {/* Settings Sections */}
          {settings.map((section, index) => (
            <SettingsSection
              key={section.title}
              section={section}
              index={index}
              onToggle={handleSettingToggle}
              onPress={handleSettingPress}
            />
          ))}

          {/* App Info */}
          <AnimatedCard index={settings.length + 1}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                fontSize: 18, 
                fontWeight: '700', 
                color: THEME.text,
                marginBottom: 8,
              }}>
                🚀 Focus Flow
              </Text>
              <Text style={{ 
                fontFamily: FONT_FAMILY,
                fontSize: 14, 
                color: THEME.textSecondary,
                marginBottom: 16,
              }}>
                Version 1.0.0 • Build 2024.1
              </Text>
              <View style={{ flexDirection: 'row', gap: 16 }}>
                <Pressable
                  style={{
                    backgroundColor: THEME.accent + '20',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ 
                    fontFamily: FONT_FAMILY,
                    color: THEME.accent, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    Rate App
                  </Text>
                </Pressable>
                <Pressable
                  style={{
                    backgroundColor: THEME.accentBlue + '20',
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 12,
                  }}
                >
                  <Text style={{ 
                    fontFamily: FONT_FAMILY,
                    color: THEME.accentBlue, 
                    fontSize: 14, 
                    fontWeight: '600' 
                  }}>
                    Support
                  </Text>
                </Pressable>
              </View>
            </View>
          </AnimatedCard>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
