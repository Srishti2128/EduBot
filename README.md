# MindPath — AI-Powered Learning Companion

> An intelligent assistant that helps users learn new concepts effectively through personalized content, adaptive pacing, and multi-modal AI interactions.

[![Built with Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](https://www.typescriptlang.org/)
[![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Powered-4285F4)](https://cloud.google.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Analytics-FFCA28)](https://firebase.google.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini-2.5%20Flash-8E75B2)](https://ai.google.dev/)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-green)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎯 Problem Statement

**Learning Companion Challenge**: Create an intelligent assistant that helps users learn new concepts effectively. The system should personalize content and adapt to user pace and understanding.

## 🧠 Solution

MindPath is an AI-powered learning companion that:

- **Personalizes** content based on user profession, learning style, and difficulty preference
- **Adapts** in real-time using AI confusion detection and mastery tracking
- **Engages** through 3 distinct learning modes, smart quizzes, and knowledge visualization
- **Supports** accessibility with WCAG 2.1 AA compliance, TTS, and multi-language support

---

## ✨ Features

### 3 Learning Modes
| Mode | Description |
|------|-------------|
| 📚 **Guided** | Structured step-by-step lessons with AI-generated curriculum |
| 🔍 **Explorer** | Freeform conversational learning — ask anything |
| 📝 **Quiz** | AI-generated assessments with instant feedback |

### Core Capabilities
- **AI Chat with Streaming** — Real-time streamed responses via Gemini API SSE
- **Confusion Detection** — Function calling extracts `confusion_score` on every response, adapting UI behavior
- **Google Search Grounding** — Responses grounded in real-time web data
- **Image-Based Learning** — Upload images/diagrams for Gemini Vision analysis
- **Smart Quizzes** — MCQ, true/false, fill-blank, short answer with AI evaluation
- **Spaced Repetition** — SM-2 algorithm schedules optimal review times
- **Knowledge Graph** — Visual concept map with mastery levels (accessible table fallback)
- **Pre-Mortem Assessment** — Captures baseline knowledge before each session
- **Multi-Language** — Learn in 100+ languages via Google Cloud Translation
- **Text-to-Speech** — Audio narration via Google Cloud TTS
- **Progress Analytics** — Visual dashboards tracking learning streaks and mastery

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) + TypeScript (strict) |
| **Styling** | Vanilla CSS + CSS Custom Properties |
| **AI** | Google Gemini 2.5 Flash (`@google/genai`) |
| **Auth** | Firebase Authentication (Google Sign-In) |
| **Database** | Cloud Firestore |
| **Analytics** | Firebase Analytics (8 custom events) |
| **TTS** | Google Cloud Text-to-Speech |
| **Translation** | Google Cloud Translation |
| **Embeddings** | Vertex AI Text Embeddings |
| **Validation** | Zod (every API route) |
| **State** | React Query (`@tanstack/react-query`) |
| **Spaced Rep** | SM-2 Algorithm (custom implementation) |
| **Testing** | Jest + React Testing Library + jest-axe |
| **Deploy** | Google Cloud Run (Docker multi-stage) |

---

## 🌐 Google Services Integration (10 services)

1. **Gemini API** — Core AI with streaming responses
2. **Gemini Function Calling** — Pedagogical signals (confusion_score, topic_mastery, suggested_action)
3. **Google Search Grounding** — Real-time web information in responses
4. **Gemini Vision** — Image upload analysis
5. **Firebase Auth** — Google Sign-In with session cookies
6. **Cloud Firestore** — All data persistence (zero localStorage)
7. **Firebase Analytics** — 8 custom events tracked
8. **Cloud Text-to-Speech** — Audio narration for accessibility
9. **Cloud Translation** — Multi-language content support
10. **Google Cloud Run** — Production deployment

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Google Cloud project with billing enabled
- Firebase project linked to GCP

### Installation

```bash
# Clone the repo
git clone https://github.com/Srishti2128/EduBot.git
cd EduBot

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your API keys and Firebase config

# Run development server
npm run dev
```

### Environment Variables

| Variable | Type | Description |
|----------|------|-------------|
| `GEMINI_API_KEY` | Server | Gemini API key from AI Studio |
| `NEXT_PUBLIC_FIREBASE_*` | Public | Firebase client config |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | Server | Firebase admin service account JSON |
| `GOOGLE_CLOUD_PROJECT_ID` | Server | GCP project ID |

---

## 📊 Code Quality

```bash
# TypeScript strict check
npm run typecheck    # tsc --noEmit — zero errors

# ESLint with accessibility plugin
npm run lint         # next lint — zero warnings

# Run all tests
npm test

# Test with coverage
npm run test:coverage    # Target: 80%+ line coverage

# Accessibility tests only
npm run test:a11y        # Zero axe violations
```

---

## 🔐 Security

- HTTP-only session cookies (Secure, SameSite)
- Zod validation on every API route
- Rate limiting (429 on request 21)
- CSP + X-Frame-Options: DENY headers
- Firestore security rules (no cross-user access)
- Non-root Docker container
- No secrets in `NEXT_PUBLIC_*` (except Firebase public config)
- `.env` in `.gitignore`

---

## ♿ Accessibility (WCAG 2.1 AA)

- Skip-to-content link on every page
- Semantic HTML throughout
- All interactive elements have accessible names
- Chat log: `role="log"` + `aria-live="polite"`
- Mode selector: `role="radiogroup"` + `role="radio"` children
- Knowledge graph: `role="img"` + `aria-label` + table fallback
- Form inputs: visible labels + `aria-describedby`
- Focus trapped in modals
- Color never sole differentiator
- 4.5:1+ contrast ratios
- `prefers-reduced-motion` support
- High contrast mode toggle

---

## 🐳 Deployment (Cloud Run)

```bash
# Build Docker image
docker build -t mindpath .

# Run locally
docker run -p 8080:8080 --env-file .env.local mindpath

# Deploy to Cloud Run
gcloud run deploy mindpath \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/                # API route handlers
│   │   ├── auth/session/   # Session management
│   │   ├── chat/           # Gemini streaming chat
│   │   ├── quiz/           # Quiz generation & evaluation
│   │   ├── tts/            # Text-to-speech
│   │   ├── translate/      # Translation
│   │   └── learning-path/  # Learning path generation
│   ├── dashboard/          # User dashboard
│   ├── learn/              # 3-mode learning interface
│   ├── quiz/               # Quiz engine
│   ├── progress/           # Progress analytics + knowledge graph
│   └── settings/           # User preferences
├── components/
│   ├── auth/               # AuthProvider, LoginButton
│   └── layout/             # Sidebar navigation
├── hooks/                  # Custom React hooks
├── lib/                    # Core utilities & service clients
├── schemas/                # Zod validation schemas
└── types/                  # TypeScript interfaces
```

---

## 📄 License

This project was built for the Google Cloud x Devfolio hackathon.

Built with ❤️ using Google Cloud, Firebase, and Gemini AI.