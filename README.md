<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" />
  <img src="https://img.shields.io/badge/Gemini_AI-D97706?style=for-the-badge&logo=sparkles&logoColor=white" />
</p>

<h1 align="center">MediSphere</h1>

<p align="center"><em>Your AI-powered personal health companion — scan prescriptions, analyze lab reports, track medications, plan meals, and take full control of your health data.</em></p>

---

## Overview

**MediSphere** is a modern mobile-first health app that brings the power of AI directly to your medical documents and daily health routines. From scanning handwritten prescriptions to generating shareable patient portfolios, MediSphere extracts, interprets, and organizes your health information — all from your phone.

> Built with React + TypeScript on the frontend and Supabase Edge Functions + AI on the backend.

---

## Features

### Scan Prescription
Upload or capture a photo of any prescription and let AI do the reading for you.

- **Camera capture** or **gallery upload** support
- Extracts medicine name, dosage, frequency, and duration
- Per-medicine **advisory warnings** (e.g. take with food, avoid alcohol)
- Brief **medicine descriptions** explaining what each drug is for
- **General advisory** section with overall guidance
- Extracted medicines are **saved locally** for use in reminders and meal planning

### Smart Medication Reminders
Never miss a dose with intelligent, schedule-aware reminders.

- **Auto-generated schedules** based on frequency (once/twice/thrice daily)
- **NOW** and **MISSED** status badges on the home screen
- **One-tap adherence logging** — mark medicines as taken or undo
- **Daily adherence progress bar** with percentage tracking
- **Push-style notifications** with 5-minute pre-reminders
- **Course expiry alerts** when a medicine's duration is about to end
- **7-day adherence history** visualized with bar charts

### MediLocker — Lab Report Analysis
Upload any PDF or image of a lab report and get a structured, AI-powered breakdown.

- Supports **PDF, JPEG, PNG, WebP** (up to 10MB)
- Extracts **patient information** — name, DOB, gender, address
- Identifies the **ordering physician** and lab details
- Parses all **test results** with values and reference ranges
- Smart **status classification** — Normal / High / Low / Abnormal
- Visual **progress bars** per result to indicate position vs. reference range
- AI-generated **health summary** with plain-language interpretation
- **Clinical notes** extraction from report footer/comments
- Built-in medical **disclaimer** on every analysis

### AI Meal Analyzer
Log what you eat and get instant AI-powered nutritional insights tailored to your medications.

- **Simple text input** — just type what you're eating
- **Calorie & macro breakdown** (protein, carbs, fats, fiber)
- **Drug-food interaction check** based on your current medicines
- **One-line meal suggestion** to optimize nutrition with your medications
- Smart **portion assumption** — defaults to one plate if unspecified

### Book Appointment & QR Health Share
Schedule doctor visits and share your complete health summary instantly.

- Input **doctor name, specialty, date & time**
- **QR code generation** containing your full health summary
- QR encodes **current medications** with dosages and adherence stats
- Doctors can scan to instantly access your medical context

### Profile & Patient Portfolio
A centralized hub for notifications, preferences, and your complete medical record.

- **Notification center** — view recent alerts with "Mark as read"
- **Dark / Light mode toggle** with persistent preference
- **Downloadable Patient Portfolio (PDF)** containing:
  - Patient name and demographics
  - Consulting doctors from lab reports
  - Complete test history with results
  - Current medications with purposes
  - AI-generated professional health status assessment
- Shareable and printable format

### AI Health Chatbot
Get instant answers to health-related questions powered by AI.

- **Conversational interface** with streaming responses
- Context-aware health guidance
- Built-in medical disclaimer

### Install as PWA
Use MediSphere like a native app on your phone.

- **Progressive Web App** support with install prompts
- Add to home screen for instant access
- Works offline with cached data

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + Custom CSS Variables |
| UI Components | shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| PDF Generation | jsPDF |
| QR Codes | qrcode.react |
| Notifications | Sonner (toast) |
| Backend | Supabase Edge Functions |
| AI | Lovable AI Gateway (Gemini) |
| File Handling | Base64 encoding via FileReader API |
| Local Storage | Custom stores for medicines, adherence & notifications |

---

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AppLayout.tsx    # Main layout with bottom navigation
│   ├── ChatBot.tsx      # AI health chatbot
│   ├── ProfileMenu.tsx  # Profile popover with notifications & theme
│   └── ui/              # shadcn/ui components
├── hooks/               # Custom React hooks
│   └── useMedicineNotifications.ts
├── lib/                 # Utility libraries
│   ├── medicineStore.ts     # Medicine & adherence data management
│   ├── notificationStore.ts # Notification persistence
│   └── generatePortfolio.ts # PDF portfolio generation
├── pages/               # Route pages
│   ├── HomePage.tsx         # Dashboard with reminders & stats
│   ├── PrescriptionsPage.tsx
│   ├── MediLockerPage.tsx
│   ├── MealsPage.tsx
│   ├── AppointmentPage.tsx
│   └── InstallPage.tsx
└── integrations/        # Supabase client & types

supabase/functions/      # Edge Functions
├── scan-prescription/   # Prescription image analysis
├── extract-lab-report/  # Lab report parsing
├── analyze-meal/        # Meal nutrition analysis
└── generate-health-summary/ # AI health status generation
```

---

## Contributing

Contributions, issues and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">Made with ❤️ by Kevin George & Hitesh Choudhary for better health literacy</p>
