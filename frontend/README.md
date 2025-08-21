# PomoPro - Custom Bottom Navigation Bar

A beautiful, animated bottom navigation bar with glassmorphism effects and Reanimated animations for the PomoPro productivity app.

## Features

### 🎨 Glassmorphism Design
- Semi-transparent background with blur effects
- Rounded top corners for modern aesthetics
- Subtle shadows and borders for depth
- Backdrop blur using `expo-blur`

### ⚡ Animated Interactions
- **Tab Press Animations**: Scale and opacity transitions
- **Center Button Pulse**: Continuous breathing animation
- **Mood-based Glow**: Dynamic colors based on timer state
- **Haptic Feedback**: Tactile response on interactions

### 🎯 Timer-Focused Design
- **Center Timer Tab**: Elevated circular button with pulse animation
- **Mood-based Colors**: 
  - 🔴 Focus mode: Red glow
  - 🟢 Break mode: Green glow  
  - 🔵 Long break: Blue glow
  - ⚪ Idle: Neutral glow

### 📱 Navigation Tabs
1. **Home** → Dashboard overview
2. **Tasks** → Task management
3. **Timer** → Core focus timer (center, emphasized)
4. **Analytics** → Progress tracking
5. **Collab** → Team sessions
6. **Settings** → App preferences

## Technical Implementation

### Dependencies
```json
{
  "@react-navigation/bottom-tabs": "^7.3.10",
  "react-native-reanimated": "~3.17.4",
  "expo-blur": "~14.1.5",
  "expo-haptics": "~14.1.4",
  "@expo/vector-icons": "^14.1.0"
}
```

### File Structure
```
├── components/
│   └── CustomTabBar.js          # Main navigation component
├── constants/
│   └── theme.js                 # Color and size constants
├── src/context/
│   └── TimerContext.js          # Timer state management
└── app/(tabs)/
    ├── _layout.js               # Tab navigator configuration
    ├── index.js                 # Home screen
    ├── tasks.js                 # Tasks screen
    ├── timer.js                 # Timer screen
    ├── analytics.js             # Analytics screen
    ├── collaboration.js         # Collaboration screen
    └── settings.js              # Settings screen
```

### Key Components

#### CustomTabBar.js
- Glassmorphism background with `BlurView`
- Animated center button with pulse effect
- Mood-based color system
- Haptic feedback integration
- Smooth transitions and scaling

#### TimerContext.js
- Centralized timer state management
- Automatic session progression
- Mood color calculation
- Time formatting utilities

#### Theme Constants
- Consistent color palette
- Responsive sizing
- Animation configurations
- Glassmorphism styling

## Usage

### Basic Setup
```javascript
import { TimerProvider } from './src/context/TimerContext';

export default function App() {
  return (
    <TimerProvider>
      {/* Your app content */}
    </TimerProvider>
  );
}
```

### Using Timer Context
```javascript
import { useTimer } from './src/context/TimerContext';

function MyComponent() {
  const { 
    timerState, 
    isRunning, 
    timeLeft, 
    startTimer, 
    pauseTimer 
  } = useTimer();
  
  // Use timer functions and state
}
```

### Custom Tab Bar Integration
```javascript
import { Tabs } from 'expo-router';
import CustomTabBar from '../components/CustomTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <CustomTabBar {...props} />}
    >
      {/* Tab screens */}
    </Tabs>
  );
}
```

## Animation Details

### Center Button Pulse
- Continuous scale and opacity animation
- 4-second cycle (2s fade in, 2s fade out)
- Uses `withRepeat` and `withSequence`

### Tab Press Animation
- Scale from 1.0 → 0.95 → 1.0
- Spring-based return animation
- Haptic feedback on press

### Mood-based Glow
- Dynamic color interpolation
- Smooth transitions between states
- Context-driven color changes

## Styling

### Glassmorphism Effect
```javascript
{
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderTopWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  shadowColor: 'rgba(0, 0, 0, 0.3)',
  shadowOffset: { width: 0, height: -4 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
}
```

### Color System
- **Primary**: Indigo (#6366f1)
- **Focus**: Red (#ef4444)
- **Break**: Green (#10b981)
- **Long Break**: Blue (#3b82f6)
- **Background**: Dark (#0f0f23)

## Performance Considerations

- Uses `useSharedValue` for smooth animations
- Optimized re-renders with context
- Efficient blur effects with `expo-blur`
- Minimal layout calculations

## Future Enhancements

- [ ] Custom theme switching
- [ ] Advanced animation presets
- [ ] Gesture-based interactions
- [ ] Accessibility improvements
- [ ] Performance optimizations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this implementation in your projects!
