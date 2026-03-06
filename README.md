# SwasthyaAI

**Multilingual AI public health platform for rural and semi-urban India.**

Built for the AWS Hackathon (AI for Bharat, Hack2Skill / YourStory) by **Team Neura Rangers**.

SwasthyaAI delivers preventive health education, vaccination tracking, symptom guidance, and real-time health alerts through voice, WhatsApp, SMS, and a mobile app -- in English, Hindi, Kannada, and Telugu.

---

## What It Does

- **AI Health Chatbot** -- answers health questions in 4 languages using OpenAI GPT-4o-mini with WHO/MoHFW grounded knowledge (RAG)
- **Symptom Checker** -- analyses symptoms and gives safe, disclaimer-backed guidance with emergency detection
- **Vaccination Tracker** -- tracks the full Indian UIP schedule for individuals and family members, sends reminders
- **Health Education** -- 9 topic modules (preventive care, nutrition, mental health, hygiene, etc.) fully translated in all 4 languages
- **Nearby Hospitals** -- interactive map showing hospitals, clinics, and pharmacies within 5km using OpenStreetMap
- **Health Alerts** -- region-specific outbreak and disease alerts fetched from WHO and MoHFW RSS feeds daily
- **Voice Interface** -- record audio, transcribe via AWS Transcribe, respond via AWS Polly TTS
- **WhatsApp and SMS** -- Twilio-powered conversational health assistant on existing channels
- **Image Analysis** -- AWS Rekognition identifies health-related labels from uploaded images
- **Admin Dashboard** -- manage alerts, vaccination drives, outbreaks, and view analytics

---

## Repository Structure

This repository contains all three components of the platform:

### `backend/`
Node.js serverless API deployed on AWS Lambda + API Gateway (Serverless Framework).

- Express app wrapped with `serverless-http`, all routes under `/v1`
- AWS services: DynamoDB (9 tables), S3, Transcribe, Polly, Rekognition, SNS, SSM
- OpenAI integration for health chat with multilingual system prompts
- RAG knowledge base with curated WHO/MoHFW health content (`src/services/knowledgeService.js`)
- Twilio webhooks for WhatsApp and SMS channels
- Scheduled jobs: daily health data fetch, vaccination reminders, alert expiry, weekly analytics report
- Safety layer: emergency detection, diagnostic request blocking, escalation routing

Deploy: `cd backend && sls deploy --stage dev`

### `swasthya mobile/`
Flutter mobile app (Android and iOS).

- All 8 screens: Home, Chatbot, Symptom Checker, Vaccination, Education, Quiz, Hospitals Map, Alerts
- OpenAI called directly from the app for chat, symptom analysis, and quiz feedback
- Backend API used for voice transcription (Transcribe), TTS playback (Polly), image analysis (Rekognition)
- Riverpod state management, GoRouter navigation, Dio HTTP client
- Fully multilingual UI: English, Hindi, Kannada, Telugu

Run: `cd "swasthya mobile" && flutter run -d chrome`

Build APK: `cd "swasthya mobile" && flutter build apk --dart-define=OPENAI_API_KEY=your-key`

### `web/`
React + Vite + Tailwind admin and public dashboard.

- Landing page with live demo chat widget
- Public dashboard with India choropleth outbreak map and real-time stats
- Admin panel: manage health alerts, vaccination drives, outbreaks, user queries, analytics
- Connects to the same API Gateway backend

Run: `cd web && npm install && npm run dev`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | Flutter (Android / iOS) |
| Web Dashboard | React, Vite, Tailwind CSS, Recharts |
| Backend | Node.js, AWS Lambda, Serverless Framework |
| AI | OpenAI GPT-4o-mini, RAG knowledge base |
| Voice | AWS Transcribe (STT), AWS Polly (TTS) |
| Image | AWS Rekognition |
| Database | AWS DynamoDB (9 tables) |
| Storage | AWS S3 |
| Messaging | Twilio WhatsApp API, Twilio SMS API |
| Notifications | AWS SNS |
| Infrastructure | AWS API Gateway, IAM, SSM Parameter Store, CloudWatch |
| Region | ap-south-1 (Mumbai) |

---

## Languages Supported

English, Hindi, Kannada, Telugu

---

## Channels

Mobile App, Web, WhatsApp, SMS, Voice

---

## Safety and Compliance

- Never provides medical diagnosis -- educational and preventive guidance only
- Emergency symptom detection triggers immediate referral to call 108
- Medical disclaimers on every health response
- All content sourced from WHO and MoHFW guidelines
- Data encrypted at rest and in transit via AWS KMS
- Personal identifiers anonymised in logs

---

## Team

**Neura Rangers** -- AWS Hackathon: AI for Bharat (Hack2Skill / YourStory), 2025
