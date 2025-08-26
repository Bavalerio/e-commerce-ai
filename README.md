# E-Commerce AI

A modern mobile-first PWA e-commerce platform built with the latest React stack.

## 🚀 Tech Stack

### Core Framework
- **Next.js 15.5.0** - React framework with App Router and Turbopack
- **React 19.1.0** - Latest React with new features
- **TypeScript 5.x** - Static type checking

### UI & Styling
- **Material UI v7** - React component library
- **Tailwind CSS 4.x** - Utility-first CSS framework
- **CSS Layers** - For MUI + Tailwind integration
- **Roboto Font** - Google Fonts integration

### Authentication & Database
- **Clerk** - Modern authentication with latest features
- **NeonDB** - Serverless PostgreSQL database
- **Drizzle ORM** - Type-safe database ORM

### State Management & Forms
- **Zustand** - Lightweight state management
- **React Hook Form** - Performant form handling
- **Zod** - Schema validation

### PWA & Mobile Features
- **PWA Ready** - Service worker and manifest
- **Mobile-First Design** - Responsive breakpoints
- **Install Prompts** - Native app-like experience
- **Bottom Navigation** - Mobile navigation pattern

### Payments & Deployment
- **Stripe** - Payment processing
- **Vercel** - Deployment platform

## 📱 Features

### Mobile-First Design
- Responsive breakpoints (xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280)
- Touch-friendly UI (48px minimum touch targets on mobile)
- Mobile navigation patterns (drawer, bottom nav)
- Safe area handling for iOS devices

### PWA Capabilities
- **Installable**: Add to home screen
- **Offline Ready**: Service worker caching
- **App-like Experience**: Standalone display mode
- **Push Notifications**: Web Push API ready

### E-Commerce Features
- Product catalog with categories
- Shopping cart with persistent state
- User authentication and profiles
- Secure checkout with Stripe
- Order management system
- Mobile-optimized checkout flow

## 🛠 Development

### Prerequisites
- Node.js 18+ or 20+ LTS
- npm, yarn, or pnpm

### Environment Setup

1. Copy the environment template:
```bash
cp .env.local.example .env.local
```

2. Fill in your environment variables:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# NeonDB Database
DATABASE_URL=your_neon_database_url

# Stripe Payment
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
```

### Installation

```bash
# Install dependencies
npm install

# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:generate  # Generate migrations
npm run db:migrate   # Run migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
npm run db:drop      # Drop database
npm run db:seed      # Seed database with sample data
```

## 🏗 Project Structure

```
e-commerce-ai/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles with CSS layers
│   │   ├── layout.tsx         # Root layout with providers
│   │   └── page.tsx           # Homepage
│   ├── components/            # Reusable UI components
│   │   ├── ui/               # Base UI components
│   │   ├── layout/           # Layout components
│   │   └── forms/            # Form components
│   ├── lib/                   # Utilities & configuration
│   │   ├── auth/             # Authentication utilities
│   │   ├── db/               # Database configuration & schema
│   │   ├── utils/            # Utility functions
│   │   └── theme.ts          # Material UI theme
│   ├── store/                 # Zustand stores
│   │   ├── cart-store.ts     # Shopping cart state
│   │   └── ui-store.ts       # UI state management
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
│   ├── icons/                # PWA icons
│   ├── images/               # Images
│   └── manifest.json         # PWA manifest
├── drizzle.config.ts         # Drizzle ORM configuration
├── next.config.ts            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
└── tsconfig.json             # TypeScript configuration
```

## 🎨 CSS Architecture

The project uses CSS layers for clean integration between Material UI and Tailwind CSS:

```css
@layer theme, base, mui, components, utilities;
```

- **theme**: CSS custom properties
- **base**: Reset and base styles
- **mui**: Material UI styles (auto-generated)
- **components**: Custom component styles
- **utilities**: Tailwind utilities (highest priority)

## 📱 Mobile Features

### Responsive Breakpoints
- **xs**: 0px+ (mobile-first)
- **sm**: 640px+ (large mobile)
- **md**: 768px+ (tablet)
- **lg**: 1024px+ (desktop)
- **xl**: 1280px+ (large desktop)

### Touch-Friendly Design
- Minimum 44px touch targets on desktop
- Minimum 48px touch targets on mobile
- Optimal spacing for thumb navigation
- Swipe gestures support ready

### PWA Features
- App icons (192x192, 512x512)
- Splash screens for iOS/Android
- Offline capability with service worker
- Install prompts and banners
- Push notification ready

## 🔧 Configuration

### Material UI Integration
The theme is configured with mobile-first breakpoints and integrates seamlessly with Tailwind CSS through CSS layers.

### Clerk Authentication
Configured with modern features including:
- OpenID Connect support
- Passkeys authentication
- Machine-to-Machine tokens
- shadcn/ui integration

### Database Schema
Comprehensive e-commerce schema including:
- Users (synced with Clerk)
- Products and variants
- Categories with hierarchy
- Shopping carts
- Orders and order items
- Inventory management

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

### Environment Variables for Production
```env
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
```

## 📊 Performance

### Optimization Features
- Next.js automatic code splitting
- Image optimization with Next.js Image
- Font optimization with next/font
- CSS layers prevent style conflicts
- Lazy loading for components
- Service worker caching

### PWA Performance
- < 3 second load time target
- Offline functionality
- Background sync ready
- Cache-first strategies

## 🔒 Security

### Best Practices Implemented
- Clerk authentication with SOC 2 compliance
- HTTPS enforcement
- Security headers in next.config.ts
- Environment variable protection
- XSS protection
- CSRF protection

## 📖 Documentation

For more detailed documentation:
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Material UI v7 Documentation](https://mui.com/)
- [Tailwind CSS v4 Documentation](https://tailwindcss.com/)
- [Clerk Documentation](https://clerk.com/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
