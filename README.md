# Campus Health Assistant

A student health support platform built for **Maseno University**. It provides AI-powered symptom assessment, first-aid guidance, appointment management, and a private health journal — all in one calm, accessible interface.

## Features

- **Symptom Guidance** — Describe your symptoms and receive an AI-assessed urgency level, likely concern analysis, and personalised recommendations powered by MedGemma.
- **First-Aid Help** — Get step-by-step first-aid instructions tailored to the specific situation, with clear guidance on when to seek emergency care.
- **Appointment Booking** — Schedule and track upcoming clinic visits with countdown reminders.
- **Health Journal** — Log mood, energy, symptoms, and self-care plans in a private, timestamped journal.
- **Authentication** — Secure login via Google OAuth or email/password, with personalised usernames.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS v4 |
| Backend | Next.js API Routes, Supabase (Auth + PostgreSQL) |
| AI Model | Google MedGemma 4B-IT (local via PyTorch or cloud via HuggingFace) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with Auth and database configured
- Python 3.10+ (only for local AI mode)

### Installation

```bash
git clone https://github.com/toxicgod0/campus-health-assistant.git
cd campus-health-assistant
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
HUGGINGFACE_API_TOKEN=your_hf_token
AI_PROVIDER=cloud
```

### Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local AI Mode (Optional)

To run MedGemma locally instead of using the cloud API:

1. Set `AI_PROVIDER=local` in `.env.local`
2. Start the Python model server:

```bash
cd medgemma-backend
medgemma_env\Scripts\activate
python server.py
```

3. Wait for "Model ready" then start the Next.js app in a separate terminal.

> Local mode requires the MedGemma model downloaded via HuggingFace and runs on CPU. Expect 3-7 minutes per response without a GPU.

## Project Structure

```
src/
  app/
    (auth)/          Login and signup pages
    api/health-ai/   AI backend route (cloud/local switch)
    dashboard/       Main hub after login
    symptom-guidance/ Symptom assessment tool
    first-aid/       First-aid guidance tool
    appointments/    Appointment booking and tracking
    health-journal/  Private health journal
  components/        Reusable UI components
  lib/               Health logic and Supabase client
  utils/supabase/    Server and client Supabase helpers
```

## License

This project is part of an academic initiative at Maseno University.
