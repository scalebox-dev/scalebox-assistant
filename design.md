# ScaleBox Sales Agent - Design Document

## App Overview
A mobile sales agent app for ScaleBox (www.scalebox.dev) — an AI-era ultra-lightweight sandbox infrastructure platform. The app empowers sales teams with AI-powered prompt templates to research prospects, craft personalized outreach, and close deals faster.

## Brand Identity
- **Primary Color**: `#6C47FF` (ScaleBox purple/violet — modern, tech-forward)
- **Accent Color**: `#00D4AA` (Teal — instant, fresh, AI-era)
- **Background**: `#0A0A0F` (dark) / `#F8F9FF` (light)
- **Surface**: `#13131F` (dark) / `#FFFFFF` (light)
- **Text**: `#ECEDFF` (dark) / `#11181C` (light)

## Screen List

### 1. Home / Dashboard (`/`)
- ScaleBox logo + greeting
- Quick stats: prompts used today, saved favorites
- Category cards (grid): Customer Research, ScaleBox Pitch, Email Templates, Role Play, Architecture
- Recent prompts history
- Search bar

### 2. Prompt Library (`/library`)
- Categorized prompt templates (tabs or accordion)
- Categories:
  - Customer Research (客户调研)
  - ScaleBox Pitch (产品推介)
  - Email Templates (邮件模板)
  - Role Play (角色扮演)
  - Architecture (技术架构)
  - Pricing & ROI (定价与ROI)
- Each prompt card: title, preview text, category badge, copy/use button

### 3. AI Generator (`/generate`)
- Prompt template selector
- Variable input fields (客户名称, 行业, 产品类型 etc.)
- Generate button → AI response
- Copy / Share / Save to favorites
- History of generated content

### 4. Favorites (`/favorites`)
- Saved prompts and generated content
- Organized by category
- Quick copy/share

### 5. ScaleBox Info (`/product`)
- Product overview: 5 pillars
- Pricing plans comparison
- Key stats (10K+ users, 50K+ sandboxes, 99.9% uptime)
- Use cases
- Quick link to www.scalebox.dev

## Key User Flows

### Flow 1: Quick Prompt Use
Home → Tap category card → Browse prompts → Tap prompt → Fill variables → Copy to clipboard

### Flow 2: AI-Generated Sales Email
Home → AI Generator → Select "Cold Email" template → Fill [客户名称, 行业] → Generate → Copy/Share

### Flow 3: Customer Research
Library → Customer Research tab → Select prompt → Fill [客户名称] → Copy → Use in ChatGPT/Claude

### Flow 4: Save Favorite
Any prompt → Tap heart icon → Saved to Favorites → Access from Favorites tab

## Tab Bar (4 tabs)
1. Home (house.fill)
2. Library (book.fill)
3. Generate (sparkles / wand.and.stars)
4. Product (info.circle.fill)

## Design Principles
- Dark-first design (tech/developer aesthetic)
- Card-based layout with subtle gradients
- Purple/violet primary with teal accents
- SF Symbols for iOS-native feel
- Haptic feedback on key actions
- Smooth transitions between screens
