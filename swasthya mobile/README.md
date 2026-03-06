# SwasthyaAI — Flutter Mobile App

Multilingual AI public health platform for rural and semi-urban users in India (English, Hindi, Kannada, Telugu).

## Prerequisites

- Flutter SDK (stable channel)
- Android Studio / Xcode
- OpenAI API key
- Backend API running (for auth, users, vaccination, alerts, news, voice, image)

## Setup

1. **Create platform folders** (if missing):
   ```bash
   flutter create . --org com.swasthyaai --project-name swasthya_ai
   ```

2. **Install dependencies:**
   ```bash
   flutter pub get
   ```

3. **Run locally (Android emulator):**
   ```bash
   flutter run \
     --dart-define=API_BASE_URL=http://10.0.2.2:3000/v1 \
     --dart-define=OPENAI_API_KEY=sk-...
   ```

4. **Run on iOS simulator:**
   ```bash
   flutter run \
     --dart-define=API_BASE_URL=http://127.0.0.1:3000/v1 \
     --dart-define=OPENAI_API_KEY=sk-...
   ```

## Project structure

- `lib/config/` — env, theme, router
- `lib/l10n/` — strings (en/hi/kn/te), language provider
- `lib/core/` — API clients, OpenAI client, models, providers, constants
- `lib/features/` — onboarding, home, chat, symptom checker, vaccination, education, quiz, hospitals, alerts, profile
- `lib/widgets/` — shared UI (mic button, chat bubble, disclaimer/emergency banners, cards, language picker, loading overlay)

## Features

- **Voice-first:** Mic on every input; voice screen records → transcribe (backend) → OpenAI → TTS (backend).
- **AI from app:** Chat, symptom checker, and quiz analysis call OpenAI directly.
- **Maps:** Nearby hospitals via **Flutter Map** (OpenStreetMap) and **Overpass API** — no API key required.
- **Backend:** Auth (phone OTP / anonymous), profile, vaccination, alerts, news, voice transcribe/synthesize, image analysis.

See the full specification in the project docs for API contracts, flows, and UI details.
