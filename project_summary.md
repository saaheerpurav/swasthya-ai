# SwasthyaAI — Project Summary

**Team:** Neura Rangers
**Hackathon:** AI for Bharat (Hack2Skill x AWS)

---

## What We Built

SwasthyaAI is a serverless, multilingual AI-powered public health platform designed for rural and semi-urban India. It provides accessible health guidance through voice, chat, and image-based interaction — in English, Hindi, Kannada, and Telugu.

---

## Problem Statement

Millions of Indians in rural and semi-urban areas lack timely access to basic health information and preventive care guidance. Language barriers, low digital literacy, and sparse healthcare infrastructure make it worse. SwasthyaAI bridges this gap using AI, making health information accessible on any device, in any supported language.

---

## Key Features

| Feature | Description |
|---|---|
| AI Health Chatbot | Multilingual health assistant powered by OpenAI GPT-4o-mini |
| Symptom Checker | Users describe symptoms; AI provides educational guidance with safety disclaimers |
| Voice Interface | Record audio → AWS Transcribe (STT) → AI response → AWS Polly (TTS) |
| Image Analysis | Photo-based health queries via AWS Rekognition |
| Vaccination Tracker | Personalized immunization schedule reminders |
| Health Education | Curated content on nutrition, hygiene, mental health, preventive care |
| Health News Alerts | Latest public health alerts and news |
| Nearby Hospitals Map | Google Maps + Places integration for locating facilities |
| Checkup Quiz | 10-question health awareness quizzes |
| Emergency Detection | Keyword-based triage — routes critical symptoms to emergency care in < 10 seconds |

---

## Tech Stack

### AI & Intelligence
- **OpenAI GPT-4o-mini** — health response generation
- **Amazon Transcribe** — speech-to-text
- **Amazon Polly** — text-to-speech
- **Amazon Rekognition** — image label detection
- **Static RAG** — WHO / MoHFW curated knowledge base (zero hallucination target)
- **Keyword safety layer** — emergency and diagnostic detection

### Backend
- **AWS Lambda** (Node.js) via Serverless Framework
- **Amazon API Gateway** — REST API (`/v1`)
- **Amazon DynamoDB** — sessions, users, queries, facilities, alerts, vaccination profiles, news
- **Amazon S3** — knowledge base, user data (voice recordings, images, logs)
- **Amazon SNS** — admin alerts and breach notifications
- **AWS SSM Parameter Store** — secrets management

### Frontend
- **Flutter** — cross-platform mobile app (Android & iOS)
- **React + Tailwind CSS** — web dashboard

### Infrastructure
- **Region:** ap-south-1 (Mumbai)
- **CDN:** Amazon CloudFront
- **Static Hosting:** Amazon S3

---

## Live Deployments

- **Web App:** http://swasthyaai-web.s3-website.ap-south-1.amazonaws.com
- **Backend API:** https://iv6gmj05bf.execute-api.ap-south-1.amazonaws.com/v1
---

## Languages Supported

English, Hindi, Kannada, Telugu

---

## Channels

Voice, WhatsApp, SMS, Web, Mobile App

---

## Safety & Compliance

- No medical diagnosis — educational and preventive guidance only
- Medical disclaimer on every health response
- Emergency symptoms detected and escalated in < 10 seconds
- All data sourced from WHO and MoHFW only
- Data encrypted at rest and in transit (KMS)
- Personal identifiers anonymized in logs
- Data deletion within 30 days on request
- Breach notification within 72 hours via SNS

---

## Scale & Cost

- Serverless architecture scales automatically
- Target cost: ~₹0.50 per user per month at scale
- 99.5% uptime target
- Response time < 10 seconds (Lambda provisioned concurrency)
