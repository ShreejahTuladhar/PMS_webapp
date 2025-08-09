# Frontend Architecture Documentation

## 🏗️ Architecture Overview

This React application has been restructured with modern patterns for scalability, maintainability, and performance.

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── booking/         # Booking-related components
│   ├── customer/        # Customer journey components
│   └── common/          # Reusable UI components
├── contexts/            # React Context providers (legacy, being phased out)
├── hooks/               # Custom React hooks
├── services/            # API service layer
│   ├── api.js          # Axios configuration & interceptors
│   ├── authService.js  # Authentication API calls
│   ├── bookingService.js # Booking API calls
│   ├── locationService.js # Location/parking API calls
│   └── index.js        # Service exports
├── store/               # Redux state management
│   ├── slices/         # Redux Toolkit slices
│   ├── hooks.js        # Typed Redux hooks
│   └── index.js        # Store configuration
└── data/               # Static data and constants
```

## 🔧 Key Improvements Implemented

### 1. State Management - Redux Toolkit
- **Before**: Context API for all state management
- **After**: Redux Toolkit with proper slices for auth, bookings, and parking
- **Benefits**: Better performance, predictable state updates, dev tools support

### 2. API Layer - Axios with Interceptors
- **Before**: Native `fetch()` calls scattered throughout components
- **After**: Centralized Axios instance with request/response interceptors
- **Features**:
  - Automatic token attachment
  - Global error handling
  - Request/response logging (development)
  - Toast notifications for errors
  - Retry mechanism with exponential backoff

### 3. Service Architecture
- **Created**: Dedicated service classes for different domains
- **Services**: AuthService, BookingService, LocationService
- **Benefits**: Separation of concerns, reusable API logic, easier testing

### 4. Custom Hooks
- **useAuth, useBooking, useParking**: Redux-connected hooks
- **useModal**: Reusable modal state management
- **useAsyncState**: Loading/error state for async operations

### 5. Component Architecture
- **Error Boundaries**: Crash protection with user-friendly error pages
- **Common Components**: Reusable UI components (LoadingSpinner, SearchForm)
- **Component Composition**: Smaller, focused components

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Server runs on: http://localhost:3000

### Build
```bash
npm run build
```

## 🔌 API Integration

### Base Configuration
- **Base URL**: `http://localhost:5000/api`
- **Authentication**: Bearer token (automatic)
- **Error Handling**: Global interceptors with toast notifications

### Service Usage Examples

```javascript
// Authentication
import { authService } from '../services';
const result = await authService.login({ username, password });

// Bookings
import { bookingService } from '../services';
const bookings = await bookingService.getBookings();

// Locations
import { locationService } from '../services';
const spots = await locationService.searchParkingSpots(location, radius);
```

### Redux Usage Examples

```javascript
// In components
import { useAuth, useBooking } from '../hooks';

function MyComponent() {
  const { user, loading, dispatch } = useAuth();
  const { currentBooking } = useBooking();
  
  const handleLogin = async (credentials) => {
    await dispatch(loginUser(credentials));
  };
}
```

## 📦 Dependencies

### Core
- **React 19**: UI library
- **React Router Dom 7**: Client-side routing
- **Redux Toolkit**: State management
- **Axios**: HTTP client

### UI & Styling
- **Tailwind CSS 4**: Utility-first CSS
- **React Hot Toast**: Toast notifications
- **QR Code React**: QR code generation
- **Recharts**: Charts and graphs

### Maps & Location
- **Leaflet**: Interactive maps
- **React Leaflet**: React wrapper for Leaflet

### Utilities
- **Day.js**: Date manipulation
- **JWT Decode**: Token parsing

## 🎯 Performance Optimizations

### Bundle Splitting
- Vendor chunks separated for better caching
- Manual chunk configuration in `vite.config.js`
- Lazy loading for large components

### Build Configuration
- Optimized Vite configuration
- Tree shaking for unused code
- Asset optimization

## 🔒 Error Handling

### Global Error Boundaries
- Catch JavaScript errors in components
- User-friendly error messages
- Development mode error details

### API Error Handling
- Automatic retry for failed requests
- User-friendly error messages
- Network error detection

### Form Validation
- Client-side validation
- Server error integration
- User feedback

## 🧪 Testing Strategy

### Recommended Testing Stack
```bash
npm install --save-dev @testing-library/react @testing-library/jest-dom vitest
```

### Test Structure
```
__tests__/
├── components/          # Component tests
├── hooks/              # Hook tests
├── services/           # Service tests
├── store/              # Redux tests
└── utils/              # Utility tests
```

## 📈 Monitoring & Analytics

### Development Tools
- Redux DevTools integration
- React Developer Tools
- Network request logging

### Performance Monitoring
- Bundle analyzer integration
- Core Web Vitals tracking
- Error boundary reporting

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_APP_NAME=ParkSathi
VITE_APP_VERSION=1.0.0
```

### Build Variants
- **Development**: Source maps, hot reload, debug tools
- **Production**: Minified, optimized, tree-shaken

## 📋 Migration Notes

### From Context to Redux
1. **AuthContext** → Redux auth slice (✅ Implemented)
2. **BookingContext** → Redux booking slice (✅ Implemented)
3. **Component updates** → Use new hooks (🔄 In Progress)

### API Integration
1. **Replace fetch calls** → Use service classes (✅ Implemented)
2. **Error handling** → Use interceptors (✅ Implemented)
3. **Loading states** → Redux loading flags (✅ Implemented)

## 🚀 Next Steps

1. **Complete Context Migration**: Remove Context providers, use Redux
2. **Component Refactoring**: Break down large components
3. **Testing**: Add comprehensive test suite
4. **Performance**: Add React.memo, useMemo optimizations
5. **Features**: Add offline support, push notifications

## 🐛 Common Issues & Solutions

### Build Issues
- **TypeScript errors**: This project uses JavaScript, remove TS syntax
- **Chunk size warnings**: Configured in vite.config.js
- **Import errors**: Use absolute imports or fix relative paths

### Runtime Issues
- **Token expiry**: Handled by interceptors
- **Network errors**: Automatic retry with exponential backoff
- **Component crashes**: Error boundaries provide fallback UI

## 📚 Additional Resources

- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [React Router Documentation](https://reactrouter.com/)
- [Axios Documentation](https://axios-http.com/)
- [Vite Documentation](https://vitejs.dev/)