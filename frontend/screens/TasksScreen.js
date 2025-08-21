import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
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

const PRIORITY = {
  low: { label: 'Low', color: '#10B981' },
  medium: { label: 'Medium', color: '#F59E0B' },
  high: { label: 'High', color: '#EF4444' },
};

const FONT_FAMILY = 'Space Grotesk';

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
  white_25: 'rgba(255, 255, 255, 0.25)',
  white_85: 'rgba(255, 255, 255, 0.85)',
  black_28: 'rgba(0, 0, 0, 0.28)',
};

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

function Confetti({ id, x, y, color, onComplete }) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const op = useSharedValue(1);
  const sc = useSharedValue(0.7);
  const rot = useSharedValue(0);

  useEffect(() => {
    const angle = Math.random() * Math.PI * 2;
    const dist = 80 + Math.random() * 120;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 60;

    tx.value = withTiming(dx, { duration: 900, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
    ty.value = withTiming(dy, { duration: 900, easing: Easing.bezier(0.25, 0.46, 0.45, 0.94) });
    op.value = withDelay(200, withTiming(0, { duration: 900 }, (finished) => { if (finished) runOnJS(onComplete)(id); }));
    sc.value = withSequence(withTiming(1.2, { duration: 160 }), withTiming(0.85, { duration: 300 }), withTiming(0.6, { duration: 440 }));
    rot.value = withTiming(Math.random() * 720, { duration: 900 });
  }, []);

  const a = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: sc.value },
      { rotate: `${rot.value}deg` },
    ],
    opacity: op.value,
  }));

  const size = 6 + Math.random() * 8;

  return (
    <Animated.View
      style={[{
        position: 'absolute',
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
        borderRadius: Math.random() > 0.3 ? size / 2 : 3,
        backgroundColor: color,
        shadowColor: color,
        shadowOpacity: 0.8,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 0 },
      }, a]}
    />
  );
}

function TaskCard({ task, index, onDone, onOpen }) {
  const enterY = useSharedValue(14);
  const enterOp = useSharedValue(0);
  const flip = useSharedValue(0);
  const scale = useSharedValue(1);
  const cardRef = useRef(null);

  useEffect(() => {
    enterY.value = withDelay(index * 70, withSpring(0, { damping: 16, stiffness: 140 }));
    enterOp.value = withDelay(index * 70, withTiming(1, { duration: 300 }));
  }, [index]);

  const cardA = useAnimatedStyle(() => ({
    transform: [{ translateY: enterY.value }, { scale: scale.value }, { rotateY: `${flip.value}deg` }],
    opacity: enterOp.value,
  }));

  const priorityColor = PRIORITY[task.priority].color;
  const progressRing = task.planned === 0 ? 0 : Math.min(1, (task.completed ? task.planned : task.done) / task.planned);
  const dateStr = new Date(task.date).toLocaleString();

  const handleDone = () => {
    flip.value = withTiming(180, { duration: 320 });
    scale.value = withSequence(withTiming(0.98, { duration: 120 }), withTiming(0.86, { duration: 220 }));
    onDone(task, cardRef);
  };

  return (
    <Animated.View
      ref={cardRef}
      style={[{
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
      }, cardA]}
    >
      <Pressable onPress={() => onOpen(task)}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ marginRight: 16 }}>
            <Ring size={48} stroke={4} progress={progressRing} color={priorityColor} />
          </View>
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text
              style={{
                fontFamily: FONT_FAMILY,
                color: THEME.text,
                fontSize: 18,
                fontWeight: '700',
                marginBottom: 6,
                lineHeight: 24,
              }}
            >
              {task.name}
            </Text>
            <Text
              numberOfLines={2}
              ellipsizeMode="tail"
              style={{
                fontFamily: FONT_FAMILY,
                color: THEME.textSecondary,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              {task.desc || 'No description'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', minWidth: 80 }}>
            <Text style={{ 
              fontFamily: FONT_FAMILY, 
              color: THEME.textTertiary, 
              fontSize: 12,
              marginBottom: 8,
              textAlign: 'right'
            }}>
              {new Date(task.date).toLocaleDateString()}
            </Text>
            <Pressable
              onPress={handleDone}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 12,
                backgroundColor: `${priorityColor}20`,
                borderWidth: 1,
                borderColor: `${priorityColor}40`,
              }}
            >
              <Text
                style={{
                  fontFamily: FONT_FAMILY,
                  color: priorityColor,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                Mark Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}

export default function TasksScreen() {
  const [tasks, setTasks] = useState([
    { id: '1', name: 'Design session outline', desc: 'Prepare sections for UI/UX review', priority: 'high', planned: 4, done: 2, date: new Date(), completed: false },
    { id: '2', name: 'Code refactor', desc: 'Cleanup timer hooks and context', priority: 'medium', planned: 3, done: 1, date: new Date(Date.now() + 3600 * 1000 * 6), completed: false },
    { id: '3', name: 'Write docs', desc: 'Update README and contribution guide', priority: 'low', planned: 2, done: 0, date: new Date(Date.now() + 3600 * 1000 * 24), completed: false },
  ]);

  const completedCount = useMemo(() => tasks.filter(t => t.completed || t.done >= t.planned).length, [tasks]);
  const progress = tasks.length === 0 ? 0 : completedCount / tasks.length;

  const [showModal, setShowModal] = useState(false);
  const [draft, setDraft] = useState({ name: '', desc: '', date: new Date(), priority: 'medium', planned: 3 });

  const modalOpacity = useSharedValue(0);
  const modalScale = useSharedValue(0.96);

  useEffect(() => {
    if (showModal) {
      modalOpacity.value = withTiming(1, { duration: 220 });
      modalScale.value = withSpring(1, { damping: 18, stiffness: 140 });
    } else {
      modalOpacity.value = withTiming(0, { duration: 180 });
      modalScale.value = withTiming(0.96, { duration: 180 });
    }
  }, [showModal]);

  const aBackdrop = useAnimatedStyle(() => ({ opacity: modalOpacity.value }));
  const aCard = useAnimatedStyle(() => ({ transform: [{ scale: modalScale.value }] }));

  const confetti = useRef([]);
  const [, force] = useState(0);
  const pushConfetti = (x, y) => {
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#F093FB'];
    const batch = Array.from({ length: 18 }).map((_, i) => ({ id: `${Date.now()}_${i}`, x, y, color: colors[i % colors.length] }));
    confetti.current = [...confetti.current, ...batch];
    force(n => n + 1);
  };
  const onConfettiDone = (id) => {
    confetti.current = confetti.current.filter(c => c.id !== id);
    force(n => n + 1);
  };

  const onAddTask = () => {
    if (!draft.name.trim()) return;
    const id = `${Date.now()}`;
    const next = { id, name: draft.name.trim(), desc: draft.desc.trim(), priority: draft.priority, planned: draft.planned || 1, done: 0, date: draft.date, completed: false };
    setTasks(prev => [next, ...prev]);
    setShowModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const toggleComplete = (task, cardRef) => {
    const measure = () => {
      try {
        cardRef.current?.measure?.((fx, fy, width, height, px, py) => {
          pushConfetti(px + width / 2, py + height / 2);
        });
      } catch {}
    };

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, completed: true } : t));
    setTimeout(measure, 80);
    setTimeout(() => {
      setTasks(prev => prev.filter(t => t.id !== task.id));
    }, 420);
  };

  const headerGlow = useSharedValue(0);
  useEffect(() => {
    headerGlow.value = withRepeat(withSequence(withTiming(1, { duration: 1400 }), withTiming(0, { duration: 1400 })), -1, true);
  }, []);
  const headerGlowStyle = useAnimatedStyle(() => ({ shadowOpacity: 0.1 + headerGlow.value * 0.2 }));

  const percentColor = progress >= 1 ? '#10B981' : progress > 0.5 ? '#F59E0B' : '#EF4444';

  const PriorityButton = ({ value }) => {
    const active = draft.priority === value;
    const sv = useSharedValue(active ? 1 : 0);
    useEffect(() => { sv.value = withTiming(active ? 1 : 0, { duration: 220 }); }, [active]);
    const a = useAnimatedStyle(() => ({
      transform: [{ scale: 1 + sv.value * 0.02 }],
      shadowOpacity: 0.1 + sv.value * 0.2,
    }));
    const colors = PRIORITY[value].color;
    return (
      <Animated.View style={[{ flex: 1 }, a]}>
        <Pressable
          onPress={() => setDraft(d => ({ ...d, priority: value }))}
          style={{
            paddingVertical: 12,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: active ? `${colors}20` : THEME.white_25,
            borderWidth: 1,
            borderColor: active ? colors : THEME.cardBorder,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ 
            fontFamily: FONT_FAMILY, 
            color: active ? colors : THEME.textSecondary, 
            fontWeight: '600', 
            fontSize: 14 
          }}>
            {PRIORITY[value].label}
          </Text>
        </Pressable>
      </Animated.View>
    );
  };

  const openDetail = (t) => {
    router.push({ pathname: '/tasks/[id]', params: { id: t.id, name: t.name, desc: t.desc, planned: `${t.planned}`, done: `${t.done}`, priority: t.priority, date: `${t.date.getTime()}` } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: THEME.background }}>
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

      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONT_FAMILY, color: THEME.text, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 }}>Your Tasks</Text>
          <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textSecondary, marginTop: 4, fontSize: 16 }}>Plan. Focus. Win.</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Ring size={40} stroke={4} progress={progress} color={percentColor} />
          <Animated.View style={[headerGlowStyle]}>
            <Pressable
              onPress={() => setShowModal(true)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 18,
                borderRadius: 20,
                backgroundColor: THEME.accent,
                borderWidth: 1,
                borderColor: THEME.accent,
                shadowColor: THEME.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
              }}
            >
              <Text style={{ fontFamily: FONT_FAMILY, color: '#FFFFFF', fontWeight: '800', fontSize: 16 }}>+ Add Task</Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Task List */}
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {tasks.map((t, idx) => (
          <TaskCard key={t.id} task={t} index={idx} onDone={toggleComplete} onOpen={openDetail} />
        ))}
      </ScrollView>

      {/* Confetti Overlay */}
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        {confetti.current.map((c) => (
          <Confetti key={c.id} id={c.id} x={c.x} y={c.y} color={c.color} onComplete={onConfettiDone} />
        ))}
      </View>

      {/* Create Task Modal */}
      <Modal transparent visible={showModal} animationType="none" onRequestClose={() => setShowModal(false)}>
        <Animated.View style={[{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }, aBackdrop]}>
          <BlurView intensity={40} tint="dark" style={{ position: 'absolute', inset: 0 }} />
          <Pressable
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%' }}
            onPress={() => setShowModal(false)}
            android_ripple={{ color: 'rgba(255,255,255,0.1)' }}
          >
            <Animated.View
              style={[{
                width: 400,
                maxWidth: '90%',
                borderRadius: 24,
                padding: 24,
                backgroundColor: THEME.cardBg,
                borderWidth: 1,
                borderColor: THEME.cardBorder,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 20 },
                shadowOpacity: 0.4,
                shadowRadius: 30,
                elevation: 8,
              }, aCard]}
              onStartShouldSetResponder={() => true} // Prevent clicks going through modal content
            >
              <Text style={{ fontFamily: FONT_FAMILY, color: THEME.text, fontSize: 24, fontWeight: '800', marginBottom: 24, textAlign: 'center' }}>Create Task</Text>

              <TextInput
                placeholder="Task name"
                placeholderTextColor={THEME.textTertiary}
                value={draft.name}
                onChangeText={(v) => setDraft(d => ({ ...d, name: v }))}
                style={{
                  fontFamily: FONT_FAMILY,
                  color: THEME.text,
                  fontWeight: '700',
                  backgroundColor: THEME.white_25,
                  borderWidth: 1,
                  borderColor: THEME.cardBorder,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  marginBottom: 20,
                  fontSize: 16,
                }}
              />

              <TextInput
                placeholder="Description (optional)"
                placeholderTextColor={THEME.textTertiary}
                value={draft.desc}
                onChangeText={(v) => setDraft(d => ({ ...d, desc: v }))}
                multiline
                style={{
                  fontFamily: FONT_FAMILY,
                  color: THEME.text,
                  backgroundColor: THEME.white_25,
                  borderWidth: 1,
                  borderColor: THEME.cardBorder,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  minHeight: 80,
                  marginBottom: 20,
                  fontSize: 14,
                  textAlignVertical: 'top',
                }}
              />

              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textSecondary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Priority</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <PriorityButton value="low" />
                  <PriorityButton value="medium" />
                  <PriorityButton value="high" />
                </View>
              </View>

              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textSecondary, fontSize: 16, fontWeight: '600', marginBottom: 12 }}>Planned Pomodoros</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                  {[1, 2, 3, 4, 5].map(n => (
                    <Pressable
                      key={n}
                      onPress={() => setDraft(d => ({ ...d, planned: n }))}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 12,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: draft.planned === n ? `${THEME.accent}20` : THEME.white_25,
                        borderWidth: 1,
                        borderColor: draft.planned === n ? THEME.accent : THEME.cardBorder,
                      }}
                    >
                      <Text style={{
                        fontFamily: FONT_FAMILY,
                        color: draft.planned === n ? THEME.accent : THEME.textSecondary,
                        fontWeight: '700',
                        fontSize: 16
                      }}>{n}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={onAddTask}
                style={{
                  borderRadius: 16,
                  paddingVertical: 16,
                  alignItems: 'center',
                  backgroundColor: THEME.accent,
                  shadowColor: THEME.accent,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                  marginBottom: 16,
                }}
              >
                <Text style={{ fontFamily: FONT_FAMILY, color: 'white', fontWeight: '700', fontSize: 16 }}>Save Task</Text>
              </Pressable>

              <Pressable onPress={() => setShowModal(false)} style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontFamily: FONT_FAMILY, color: THEME.textTertiary, fontSize: 14 }}>Cancel</Text>
              </Pressable>
            </Animated.View>
          </Pressable>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
}
