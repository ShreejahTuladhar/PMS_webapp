# 🃏 Single Parking Card View

## Overview

The Single Parking Card View is a modern, mobile-first UI component that displays parking spots one at a time in a card-based interface. Inspired by the PNG image provided, it offers smooth navigation through parking options with gesture support and keyboard accessibility.

## Features

### 🎯 Core Functionality
- **One Card at a Time**: Display single parking spot with full details
- **Smooth Navigation**: Scroll through parking options seamlessly
- **Multiple Input Methods**: Mouse scroll, keyboard arrows, touch swipes
- **Progress Indicators**: Visual feedback on current position
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### 🎨 User Interface
- **Clean Card Design**: Modern, uncluttered layout
- **Visual Hierarchy**: Clear information organization
- **Status Indicators**: Real-time availability with color coding
- **Interactive Elements**: Prominent booking and navigation buttons
- **Accessibility**: Full keyboard navigation and screen reader support

### ⚡ Navigation Methods
- **Mouse Wheel**: Scroll up/down to navigate
- **Keyboard**: Arrow keys, Home/End for quick navigation
- **Touch Gestures**: Swipe up/down on mobile devices
- **Direct Selection**: Click progress indicators (future feature)

## Components

### 1. `SingleParkingCardView.jsx`
Main component that renders the single card interface.

```jsx
<SingleParkingCardView
  parkingSpots={parkingData}
  selectedSpot={currentSpot}
  onSpotSelect={handleSpotSelect}
  onBooking={handleBooking}
  onLoginRequired={handleLogin}
  className="h-full"
/>
```

### 2. `SingleCardDemo.jsx`
Demo component with sample data for testing and showcasing features.

### 3. `single-card-animations.css`
CSS animations and transitions for smooth user experience.

## Integration

### Adding to ParkingList Component

The single card view is integrated into the existing `ParkingList` component:

1. **View Toggle**: Added "Single" option to view mode selector
2. **Conditional Rendering**: Renders `SingleParkingCardView` when selected
3. **Data Flow**: Uses same parking data and event handlers

```jsx
// In ParkingList.jsx
{viewMode === 'single' ? (
  <div className="p-4">
    <div className="h-96">
      <SingleParkingCardView
        parkingSpots={sortedSpots}
        selectedSpot={selectedSpot}
        onSpotSelect={onSpotSelect}
        onBooking={handleBookingClick}
        onLoginRequired={onLoginRequired}
        className="h-full"
      />
    </div>
  </div>
) : (
  // Other view modes...
)}
```

### Demo Access

Visit `/demo/single-card` to see the component in action with sample data.

## Props API

### SingleParkingCardView Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `parkingSpots` | `Array` | ✅ | Array of parking spot objects |
| `selectedSpot` | `Object` | ❌ | Currently selected parking spot |
| `onSpotSelect` | `Function` | ❌ | Callback when spot is selected |
| `onBooking` | `Function` | ❌ | Callback when booking is requested |
| `onLoginRequired` | `Function` | ❌ | Callback when login is required |
| `className` | `String` | ❌ | Additional CSS classes |

### Expected Parking Spot Data Structure

```javascript
{
  id: 'unique-id',
  name: 'Parking Location Name',
  address: 'Full address',
  distance: 0.5, // kilometers
  hourlyRate: 50, // base rate
  availableSpaces: 10,
  totalSpaces: 25,
  rating: 4.5,
  operatingHours: {
    open: '06:00',
    close: '22:00',
    isOpen24: false
  },
  features: ['CCTV Security', 'Covered Parking'],
  vehicleTypes: {
    car: 50,
    motorcycle: 25,
    bike: 15
  },
  amenities: ['Security Guard', 'Restrooms']
}
```

## Navigation Controls

### Keyboard Controls
- **↑/←**: Previous parking spot
- **↓/→**: Next parking spot
- **Home**: Jump to first spot
- **End**: Jump to last spot
- **Tab**: Navigate interactive elements

### Mouse Controls
- **Scroll Wheel**: Navigate through spots
- **Click**: Interact with buttons and elements

### Touch Controls
- **Vertical Swipe**: Navigate between spots
- **Tap**: Interact with buttons

## Customization

### Styling
The component uses Tailwind CSS classes and can be customized through:
- CSS custom properties
- Tailwind configuration
- Component props (`className`)

### Animation Timing
Modify animation durations in the component:
```jsx
const ANIMATION_DURATION = 300; // milliseconds
```

### Progress Indicator
Customize the progress dots display:
```jsx
// Show up to 10 dots for large datasets
{parkingSpots.slice(0, Math.min(10, parkingSpots.length)).map(...)}
```

## Accessibility Features

### ARIA Support
- Proper focus management
- Screen reader announcements
- Keyboard navigation
- Role and state attributes

### Visual Indicators
- High contrast availability states
- Focus visible outlines
- Loading states
- Error feedback

## Performance Optimizations

### Efficient Rendering
- Single card rendering (no virtual scrolling needed)
- Optimized re-renders with `useCallback`
- Minimal DOM manipulation

### Touch Performance
- Debounced gesture recognition
- Smooth transition timing
- Hardware-accelerated animations

## Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **Mobile Browsers**: iOS Safari 13+, Chrome Mobile 80+
- **Accessibility**: NVDA, JAWS, VoiceOver support

## Future Enhancements

### Planned Features
1. **Card Flip Animations**: 3D card transitions
2. **Gesture Recognition**: More complex swipe patterns
3. **Voice Navigation**: "Next", "Previous" voice commands
4. **Auto-play Mode**: Automatic cycling through spots
5. **Favorite Indicators**: Quick favorite/unfavorite actions
6. **Quick Actions**: Swipe-to-book gestures

### Integration Ideas
1. **Map Integration**: Show card location on mini-map
2. **Filter Integration**: Filter spots within single view
3. **Comparison Mode**: Side-by-side comparison
4. **Booking Flow**: Inline booking without modal

## Usage Examples

### Basic Usage
```jsx
import SingleParkingCardView from './components/ui/SingleParkingCardView';

function ParkingApp() {
  const [spots, setSpots] = useState([]);
  
  return (
    <SingleParkingCardView
      parkingSpots={spots}
      onBooking={(spot) => console.log('Book:', spot.name)}
    />
  );
}
```

### Advanced Usage with State Management
```jsx
function AdvancedParkingView() {
  const [currentSpot, setCurrentSpot] = useState(null);
  const [favorites, setFavorites] = useState([]);
  
  const handleSpotSelect = (spot) => {
    setCurrentSpot(spot);
    // Update URL, analytics, etc.
  };
  
  return (
    <SingleParkingCardView
      parkingSpots={parkingData}
      selectedSpot={currentSpot}
      onSpotSelect={handleSpotSelect}
      onBooking={handleBookingFlow}
    />
  );
}
```

## Troubleshooting

### Common Issues

1. **Navigation Not Working**
   - Ensure container has focus (`tabIndex={0}`)
   - Check event listeners are properly attached
   - Verify `parkingSpots` array has multiple items

2. **Touch Gestures Not Responsive**
   - Check touch event handlers are bound
   - Verify minimum swipe distance threshold
   - Ensure no conflicting scroll containers

3. **Animation Performance**
   - Reduce animation duration on slower devices
   - Use `transform` instead of position changes
   - Consider `will-change` CSS property

### Debug Mode
Enable debug logging:
```jsx
const DEBUG = process.env.NODE_ENV === 'development';
if (DEBUG) console.log('Navigation:', direction, newIndex);
```

---

Built with ❤️ for the ParkSathi Parking Management System