# Solution Design Document: Autonomous Content Factory

## 1. Document Control

- **Product:** Autonomous Content Factory
- **Version:** 2.1
- **Last updated:** 2026-04-07
- **Status:** Active implementation-aligned design
- **Audience:** Engineers, reviewers, technical stakeholders, maintainers

## 2. Executive Summary

Autonomous Content Factory converts one source input into a multi-channel campaign kit using a 3-agent pipeline orchestrated by **LangGraph**:

1. **Researcher:** Extracts structured facts and potential ambiguities from raw source material into a "Fact-Sheet."
2. **Copywriter:** Generates long-form blog posts, email drafts, and social media threads from the fact-sheet.
3. **Editor:** Audits the generated drafts for factual consistency and hallucination risk, providing feedback for revision.

The system is built as a **FastAPI** backend with a **Next.js** frontend that utilizes **Server-Sent Events (SSE)** to provide a real-time, transparent "agent room" experience. All campaign data and agent results are persisted in **Supabase** for cloud-synchronized state management.

## 3. Problem Statement

Marketing teams repeatedly rewrite the same technical source material into different channel formats (blogs, X threads, emails). This process is:
- Consumed by creative burnout and repetitive tasks.
- Prone to factual drift and "AI hallucinations" during manual cross-referencing.
- Slow to produce coordinated multi-channel campaigns.

Autonomous Content Factory addresses this by transforming one document into a coordinated, reviewable campaign kit grounded in a single, verified "Source of Truth."

## 4. Goals and Non-Goals

### 4.1 Goals
- Generate three coordinated outputs:
  - Deep-dive Blog draft (PAS framework).
  - Multi-platform Social Media thread (X, LinkedIn).
  - B2B Outreach Email teaser.
- Preserve factual integrity using a structured Fact-Sheet output.
- Support iterative correction loops where the Editor agent provides feedback to the Copywriter.
- Provide real-time execution observability via SSE thinking/typing states.
- **Surgical Regeneration:** Enable AI redrafting of a single platform's content without affecting the rest of the campaign.
- **Cloud Persistence:** Secure campaign and result storage using Supabase PostgreSQL.

### 4.2 Non-Goals (Current Version)
- No Vector Database (RAG) implementation in the current production path.
- No direct multi-tenant authentication system (relying on Supabase OAuth/Public access).
- No background job queues; the system uses a persistent SSE request lifecycle for immediate feedback.

## 5. Scope

### In Scope
- Multi-agent orchestration for campaign generation.
- Targeted platform regeneration (e.g., "Regenerate Blog Only").
- Real-time UI updates (logs, status transitions, typing chunks).
- Persistence of all drafts and verification markers to Supabase.
- Support for PDF, DOCX, and TXT source material.

### Out of Scope
- Direct deployment/posting to social media APIs.
- Automated image generation for blog posts.
- Global prompt management UI.

## 6. System Context and Flow

### 6.1 High-Level Flow
1. **Upload:** User provides source material; text is parsed and stored in Supabase.
2. **Orchestration:** Backend triggers the LangGraph assembly line.
3. **Research:** The Researcher agent distills the document into a Fact-Sheet.
4. **Draft:** The Copywriter generates multi-channel drafts (Blog, Social, Email).
5. **Audit:** The Editor checks for accuracy. If rejected, it triggers a revision loop (max 3 cycles).
6. **Delivery:** Progress is streamed to the user via SSE. Once complete, results are saved to Supabase.
7. **Verification:** User reviews, verifies (approves), or regenerates specific channels as needed.

### 6.2 Architectural Pattern
- **Graph Type:** Directed Cyclic Graph (DCG) using LangGraph.
- **Delivery Model:** Server-Sent Events (SSE) for one-way live logging and typing.
- **Persistence Layer:** Supabase PostgreSQL with JSONB columns for agent results.

## 7. Functional Requirements

### FR-1: Parser & Ingestion
- Extract clean text from PDF, Word, and Text documents.
- Handle large document downloads from Supabase Storage for backend parsing.

### FR-2: Researcher Node
- Create a normalized Fact-Sheet containing core facts, value propositions, and brand voice directives.

### FR-3: Copywriter Node
- Generate drafts as strict JSON mapped to Pydantic schemas.
- Support platform-specific instruction tags (e.g., `[ONLY::email]`) for selective updates.

### FR-4: Editor Node
- Compare Copywriter drafts against the Fact-Sheet to identify speculation or missing facts.
- Trigger iterative refinement cycles with specific correction notes.

### FR-5: Real-time Observers
- Report "Thinking" and "Typing" phases for every agent node in the pipeline via the stream bus.

## 8. Non-Functional Requirements

- **Reliability:** Graceful degradation during Gemini API outages; fallback to user-friendly error logs.
- **Latency:** Real-time progressive SSE updates during long-running generation (no "black box" waiting).
- **Usability:** Human-readable feedback and targeted regeneration controls per channel.
- **Portability:** Container-ready backend (Docker) and edge-ready frontend (Vercel).
- **Maintainability:** Typed state contracts and separable agent nodes for independent logic updates.

## 9. Component Design

### 9.1 Backend Agent Nodes
- **Researcher:** Model: `models/gemini-2.5-flash`. Focused on data extraction.
- **Copywriter:** Model: `models/gemini-2.5-flash`. Focused on tone, formatting, and PAS frameworks.
- **Editor:** Model: `models/gemini-2.5-flash`. Focused on verification and groundedness.

### 9.2 Data Model (Supabase)
- **Table:** `campaigns`
- **Columns:** `results` (JSONB), `source_text` (TEXT), `status` (TEXT), `approvals` (JSONB).

## 10. API Contract Summary

- `POST /campaign/upload`: Source text ingestion and Supabase Storage upload.
- `GET /campaign/{id}/stream`: Persistent SSE log feed for the live "Agent Room."
- `PATCH /campaign/{id}/approve`: Cloud-synchronized approval toggle.
- `POST /campaign/{id}/refine`: Manual feedback/regeneration trigger.

## 11. Tech Stack Rationale

- **FastAPI:** Essential for high-performance async streaming and real-time SSE management.
- **Next.js 15:** Utilized for rapid UI composition and server-side authentication handling.
- **LangGraph:** Best-in-class for stateful, cyclic AI workflows and multi-agent grounding.
- **Google Gemini 2.5 Flash:** Provides an massive context window (1M+) enabling the processing of high-density technical documents at low latency.
- **Supabase:** Provides instant, scalable cloud persistence and Google OAuth without managing infrastructure.

## 12. Trade-offs Made

- **Stateful vs Stateless:** Chose stateful orchestration (LangGraph) over simple chains to ensure feedback loops actually improve output quality.
- **SSE vs WebSocket:** Chose SSE for simplicity in one-way telemetry; bidirectional needs (like approval) are handled via separate REST calls.
- **No Vector DB:** The source document is small enough to fit in the LLM context window directly, making RAG unnecessary for single-document tasks.

## 13. Edge Case Handling

| Edge Case | Detection | Handling |
|---|---|---|
| AI returns malformed JSON | Pydantic validation error | Caught by the node; reports error to logs and triggers a retry. |
| Gemini API 429 (Quota) | Exception text check | Surfaced to UI as "API key exhausted, try again later." |
| Campaign missing in DB | 404 from Supabase | Frontend displays "Campaign context not found." |
| File size > 50 MB | Frontend validation | Blocked before upload to preserve bandwidth. |
| Unlimited Revision Loops | `loop_count` check | Halted after 3 iterations to prevent token runaway. |
| Partial SSE Chunks | Stream framing logic | Frontend buffers and splits chunks by double newline to avoid UI flickering. |

## 14. Security and Privacy Considerations

- **CORS Hardening:** Backend strictly allows only production Vercel and local development origins.
- **Secret Management:** API keys (Gemini, Supabase) are never exposed to the frontend; they reside exclusively in Render/Vercel ENV vars.
- **Data Privacy:** Source content is sent to Google Gemini in cloud mode; Supabase Storage is configured with secure RLS policies.

## 15. Performance and Scalability

- **Async Concurrency:** Backend handles concurrent streams using Python's `asyncio` and `stream_bus`.
- **Scaling:** Vertical scaling on Render is sufficient for current traffic; horizontally scalable if moved to a job queue (Redis/Celery).

## 16. Browser and UX Compatibility Notes

- Optimized for modern Chromium-based browsers (Chrome, Edge).
- Visual glassmorphism effects degrade gracefully on older engines.
- Responsive design handles mobile review but is optimized for desktop "Command Center" usage.

## 17. Visual & Manual QA Strategy

Given the current focus on prototyping and real-time observability, the project currently prioritizes manual and visual testing strategies over automated unit testing:

- **UI/UX Visual Audits:** Manual verification of responsive design across breakpoints, glassmorphism backdrop stability, and high-quality font rendering (Playfair & Outfit).
- **Telemetry Synchronization:** Real-time manual observation of the "Typewriter Effect" and "Thinking/Typing" state transitions to ensure SSE events are correctly mapped to UI bubbles.
- **Manual AI-Resilience Testing:** Stress-testing the Researcher and Copywriter nodes with complex or intentionally malformed PDF documents to verify the robustness of the Editor's rejection feedback in the UI.
- **Cross-Browser Layout Verification:** Visual smoke testing in multiple Chromium environments to ensure the 3-column "Campaign Room" remains stable during long-running streams.

## 18. Future Enhancements

- **HITL Integration:** Expose the Fact-Sheet for manual editing before drafting starts.
- **Multi-Document Support:** Combine research from multiple PDFs.
- **Custom Personas:** Allow users to define their own Editor/Copywriter tone settings.

## 19. Conclusion

The **Autonomous Content Factory** leverages a state-of-the-art multi-agent architecture to ensure factual grounding and high creative output. By combining LangGraph with real-time SSE observability and Supabase persistence, it provides a robust, professional framework for multi-channel content production.
