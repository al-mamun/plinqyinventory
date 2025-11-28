# Plinqy Search Engine

Modern React-based frontend for local store and product discovery.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool & dev server
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **React Query** - Server state management & caching
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Leaflet** - Maps (optional)
- **Lucide React** - Icons

## Features

- 🔍 **Smart Search** - Real-time product and store search
- 📍 **Geolocation** - Automatic location detection for nearby results
- ⚡ **Fast Performance** - Vite for instant HMR & optimized builds
- 💾 **Smart Caching** - React Query for efficient data caching
- 🎨 **Modern UI** - TailwindCSS for beautiful, responsive design
- 🗺️ **Maps Integration** - View stores on interactive maps

## Getting Started

### Prerequisites

- Node.js 18+
- Backend API running on `http://localhost:3000`

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will run on `http://localhost:3001`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── assets/          # Static assets (styles, images)
├── components/      # Reusable React components
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services
├── types/           # TypeScript types
├── utils/           # Utility functions
├── App.tsx          # Main App component
└── main.tsx         # Application entry point
```

## API Integration

The app connects to the backend API via proxy configuration in `vite.config.ts`:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  },
}
```

All API calls use HTTP-only cookies for authentication.

## Environment Variables

Create a `.env` file (if needed):

```env
VITE_API_URL=http://localhost:3000
```

## Performance

- **Initial Load**: ~0.5s
- **Client-side Caching**: 5 minutes default
- **Bundle Size**: Optimized with code splitting
- **SEO**: N/A (SPA for authenticated users)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
