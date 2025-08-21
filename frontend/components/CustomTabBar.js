import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import React, { useEffect } from "react";
import { Dimensions, Pressable, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { ANIMATION, COLORS, SIZES } from "../constants/theme";
import { useTimer } from "../src/context/TimerContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TAB_WIDTH = SCREEN_WIDTH / 6; // 6 tabs total

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function CustomTabBar({ state, descriptors, navigation }) {
  const pulseAnimation = useSharedValue(0);
  const centerButtonScale = useSharedValue(1);
  const centerButtonGlow = useSharedValue(0);

  // Get timer state from context for mood-based glow
  const { timerState, getMoodColor } = useTimer();

  // Pulse animation for center button
  useEffect(() => {
    pulseAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );
  }, []);

  const handleTabPress = (route, index) => {
    const event = navigation.emit({
      type: "tabPress",
      target: route.key,
      canPreventDefault: true,
    });

    if (!event.defaultPrevented) {
      navigation.navigate(route.name);

      // Haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Special animation for center button
      if (index === 2) {
        // Timer tab
        centerButtonScale.value = withSequence(
          withTiming(ANIMATION.pressScale, { duration: ANIMATION.fast }),
          withSpring(1, ANIMATION.spring)
        );
        centerButtonGlow.value = withTiming(1, { duration: ANIMATION.normal });
        setTimeout(() => {
          centerButtonGlow.value = withTiming(0, {
            duration: ANIMATION.normal,
          });
        }, 300);
      }
    }
  };

  const getIconName = (routeName) => {
    switch (routeName) {
      case "index":
        return "home-outline";
      case "tasks":
        return "checkmark-done-outline";
      case "timer":
        return "timer-outline";
      case "analytics":
        return "stats-chart-outline";
      case "collaboration":
        return "people-outline";
      case "settings":
        return "settings-outline";
      default:
        return "home-outline";
    }
  };

  const renderTab = (route, index) => {
    const { options } = descriptors[route.key];
    const isFocused = state.index === index;
    const isCenterTab = index === 2;

    const iconName = getIconName(route.name);
    const moodColor = getMoodColor(timerState);

    const centerButtonStyle = useAnimatedStyle(() => ({
      transform: [
        { scale: centerButtonScale.value },
        { translateY: isCenterTab ? -8 : 0 },
      ],
    }));

    const centerGlowStyle = useAnimatedStyle(() => ({
      opacity: centerButtonGlow.value * 0.4,
      backgroundColor: moodColor,
    }));

    const pulseStyle = useAnimatedStyle(() => ({
      opacity: interpolate(pulseAnimation.value, [0, 1], [0.3, 0.8]),
      transform: [
        {
          scale: interpolate(pulseAnimation.value, [0, 1], [1, 1.2]),
        },
      ],
    }));

    const onPressIn = () => {
      if (isCenterTab) {
        centerButtonScale.value = withTiming(ANIMATION.pressScale, {
          duration: ANIMATION.fast,
        });
      }
    };

    const onPressOut = () => {
      if (isCenterTab) {
        centerButtonScale.value = withSpring(1, ANIMATION.spring);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={() => handleTabPress(route, index)}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          height: SIZES.tabBarHeight,
          position: "relative",
        }}
      >
        {/* Center button special styling */}
        {isCenterTab ? (
          <View style={{ position: "relative" }}>
            {/* Pulse animation background */}
            <Animated.View />

            {/* Center button glow */}
            <Animated.View
              style={[
                {
                  position: "absolute",
                  width: SIZES.centerButtonSize + 8,
                  height: SIZES.centerButtonSize + 8,
                  borderRadius: (SIZES.centerButtonSize + 8) / 2,
                  top: -4,
                  left: -4,
                },
                centerGlowStyle,
              ]}
            />

            {/* Main center button */}
            <Animated.View
              style={[
                {
                  width: SIZES.centerButtonSize,
                  height: SIZES.centerButtonSize,
                  borderRadius: SIZES.centerButtonSize / 2,
                  backgroundColor: moodColor,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: moodColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 8,
                },
                centerButtonStyle,
              ]}
            >
              <Ionicons
                name={iconName}
                size={SIZES.tabIconSize + 4}
                color={COLORS.textPrimary}
              />
            </Animated.View>
          </View>
        ) : (
          <View>
            <Ionicons
              name={iconName}
              size={SIZES.tabIconSize}
              color={isFocused ? moodColor : COLORS.textSecondary}
            />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: SIZES.tabBarHeight + 20, // Extra padding for center button
        paddingBottom: 20,
      }}
    >
      {/* Glassmorphism background */}
      <AnimatedBlurView
        intensity={20}
        tint="dark"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: COLORS.glass,
          borderTopLeftRadius: SIZES.radiusLg,
          borderTopRightRadius: SIZES.radiusLg,
          borderTopWidth: 1,
          borderColor: COLORS.glassBorder,
          shadowColor: COLORS.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      />

      {/* Tab buttons */}
      <View
        style={{
          flexDirection: "row",
          height: SIZES.tabBarHeight,
          paddingTop: SIZES.sm,
        }}
      >
        {state.routes.map((route, index) => renderTab(route, index))}
      </View>
    </View>
  );
}
