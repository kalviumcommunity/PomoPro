import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect } from 'react';
import { Dimensions, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

const { width: SCREEN_W } = Dimensions.get('window');

const PRIORITY_COLOR = { low: '#10B981', medium: '#F59E0B', high: '#EF4444' };
const FONT_FAMILY = 'Space Grotesk';

function Ring({ size = 40, stroke = 4, progress = 0.5, color = '#6366F1' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, progress)));
  return (
    <Svg width={size} height={size}>
      <Circle cx={size / 2} cy={size / 2} r={r} stroke={'#E5E7EB'} strokeWidth={stroke} fill="none" />
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

export default function TaskDetailScreen() {
  const params = useLocalSearchParams();
  const name = (params.name || 'Task').toString();
  const desc = (params.desc || '').toString();
  const planned = parseInt((params.planned || '0').toString(), 10) || 0;
  const done = parseInt((params.done || '0').toString(), 10) || 0;
  const priority = (params.priority || 'medium').toString();
  const dateMs = parseInt((params.date || `${Date.now()}`).toString(), 10);
  const date = new Date(isNaN(dateMs) ? Date.now() : dateMs);

  const progress = planned === 0 ? 0 : Math.min(1, done / planned);
  const color = PRIORITY_COLOR[priority] || '#6366F1';

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withSequence(withTiming(1, { duration: 1200 }), withTiming(0, { duration: 1200 })), -1, true);
  }, []);
  const glowStyle = useAnimatedStyle(() => ({ shadowOpacity: 0.15 + pulse.value * 0.25 }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <View
        style={{
          paddingHorizontal: 24,
          paddingVertical: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
          backgroundColor: 'white',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 6,
          zIndex: 10,
        }}
      >
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={28} color="#111827" />
        </Pressable>
        <Text style={{ fontFamily: FONT_FAMILY, color: '#111827', fontSize: 20, fontWeight: '700' }}>Task Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 }}>
        {/* Title + Progress */}
        <Animated.View
          style={[
            {
              backgroundColor: 'white',
              borderRadius: 18,
              padding: 20,
              borderWidth: 1,
              borderColor: `${color}44`,
              shadowColor: color,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.1,
              shadowRadius: 16,
            },
            glowStyle,
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 16 }}>
              <Ring size={56} stroke={5} progress={progress} color={color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: FONT_FAMILY, color: '#111827', fontSize: 22, fontWeight: '800' }}>{name}</Text>
              <Text style={{ fontFamily: FONT_FAMILY, color: '#6B7280', marginTop: 4, fontSize: 14 }}>{date.toLocaleString()}</Text>
            </View>
            <View
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 1,
                borderColor: `${color}44`,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 14,
              }}
            >
              <Text style={{ fontFamily: FONT_FAMILY, color, fontWeight: '700', fontSize: 14 }}>{priority.toUpperCase()}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Description */}
        <View
          style={{
            marginTop: 20,
            backgroundColor: 'white',
            borderRadius: 18,
            padding: 20,
            borderWidth: 1,
            borderColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOpacity: 0.05,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
          }}
        >
          <Text style={{ fontFamily: FONT_FAMILY, color: '#374151', fontSize: 16, lineHeight: 24 }}>
            {desc || 'No description provided.'}
          </Text>
        </View>

        {/* Timeline */}
        <View style={{ marginTop: 24 }}>
          <Text style={{ fontFamily: FONT_FAMILY, color: '#111827', fontWeight: '700', fontSize: 18, marginBottom: 12 }}>
            Timeline
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 8 }}>
            {Array.from({ length: planned || 1 }).map((_, i) => {
              const filled = i < done;
              return (
                <View
                  key={i}
                  style={{
                    width: 40,
                    height: 20,
                    borderRadius: 10,
                    marginRight: 10,
                    backgroundColor: filled ? color : 'transparent',
                    borderWidth: 2,
                    borderColor: filled ? color : 'rgba(107,114,128,0.3)',
                    shadowColor: color,
                    shadowOpacity: filled ? 0.3 : 0,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 0 },
                  }}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Actions */}
        <View style={{ marginTop: 32, flexDirection: 'row', gap: 16 }}>
          <Pressable
            onPress={() => router.replace('/(tabs)/timer')}
            style={{
              flex: 1,
              backgroundColor: color,
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
              shadowColor: color,
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.35,
              shadowRadius: 16,
            }}
          >
            <Text style={{ fontFamily: FONT_FAMILY, color: 'white', fontWeight: '700', fontSize: 16 }}>Start Focus</Text>
          </Pressable>
          <Pressable
            onPress={() => router.back()}
            style={{
              flex: 1,
              backgroundColor: 'white',
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#E5E7EB',
              shadowColor: '#000',
              shadowOpacity: 0.05,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 8,
            }}
          >
            <Text style={{ fontFamily: FONT_FAMILY, color: color, fontWeight: '700', fontSize: 16 }}>Edit Task</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
