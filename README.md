# 🚀 Autonomous Content Factory

## The Problem
Manually repurposing technical documents (specifications, whitepapers, or blogs) into marketing assets is a recurring bottleneck for product and marketing teams. It is time-consuming to extract technical facts accurately and translate them into varied formats like blogs, emails, and social threads without losing logical integrity or introducing "AI hallucinations" that misrepresent the source material.

## The Solution
The **Autonomous Content Factory** is an AI-driven multi-agent assembly line that transforms raw technical documents (PDF, DOCX, TXT) into a complete marketing campaign kit. Using **LangGraph**, it orchestrates a specialized workforce of AI agents:
- **Lead Researcher:** Isolates technical facts into a structured "Fact-Sheet" to serve as the single source of truth.
- **Creative Copywriter:** Drafts multi-channel assets (Blog, Email, Social) based strictly on verified facts.
- **Editor-in-Chief:** Audits for quality, tone, and factual consistency before final approval.

This approach ensures surgical accuracy while providing a premium, real-time observability dashboard where users can watch agents "think" and "type" as they collaborate via Server-Sent Events (SSE).

## 🛠️ Tech Stack
- **Programming Languages:** Python 3.10+, TypeScript (React)
- **Backend:** FastAPI, LangGraph (Agentic Orchestration), LangChain
- **Frontend:** Next.js 15, Tailwind CSS v4, Framer Motion
- **Databases & Storage:** Supabase PostgreSQL & Storage
- **APIs:** Google Gemini Pro API (LLM Reasoning)

---

## 🏗️ Project Architecture

### ⚙️ Backend (`/backend`)
- **`app/agents/`**: Core logic for the AI "collaborators" (Researcher, Writer, Editor).
- **`app/api/`**: Endpoints for document ingestion and real-time SSE streaming.
- **`app/services/`**: Business logic for Supabase persistence and parsing.
- **`app/core/`**: Shared schemas and utility parsers.

### 🎨 Frontend (`/frontend`)
- **`app/campaign/[id]/room/`**: Real-time visualization of agent collaboration and chat logs.
- **`app/campaign/[id]/review/`**: Collaborative editor and preview platform for drafts.
- **`src/hooks/`**: Custom hooks for SSE (Server-Sent Events) and real-time state.
- **`src/utils/`**: Integrations for Supabase file management and API configurations.

---

## 🚀 Setup Instructions

### 1. Prerequisites
- **Python:** 3.10 or higher
- **Node.js:** 18.x or higher
- **Accounts:** Google AI Studio (Gemini API Key) and a Supabase Project.

### 2. Database & Storage Setup (Supabase)
1. **Create Table:** Run the following SQL in your Supabase SQL Editor:
```sql
CREATE TABLE campaigns (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users,
  name TEXT,
  status TEXT DEFAULT 'processing',
  source_text TEXT,
  results JSONB DEFAULT '{}',
  approvals JSONB DEFAULT '{}',
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and add policies
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_access" ON campaigns FOR ALL USING (auth.uid() = user_id);
```
2. **Storage Bucket:** Create a **Public** storage bucket named `campaign_documents` in Supabase.

### 3. Backend Setup
```bash
cd backend
python -m venv venv
# Activate: Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
venv\Scripts\activate
pip install -r requirements.txt

# Create .env file:
# GOOGLE_API_KEY=your_gemini_pro_key
# SUPABASE_URL=your_project_url
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

python -m app.main
```

### 4. Frontend Setup
```bash
cd frontend
npm install

# Create .env.local file:
# NEXT_PUBLIC_SUPABASE_URL=your_project_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1

npm run dev
```

---

## 🎨 UI & UX Design Goals
- **Total Observability:** The user "sees" the AI working through "Thinking" and "Typing" animations, reducing the "Black Box" feel of LLMs.
- **Surgical Redrafting:** Targeted regeneration allows for perfect branding without losing the entire campaign draft.
- **Factual Grounding:** Every asset is explicitly cross-referenced against the extracted Fact-Sheet for absolute accuracy.

