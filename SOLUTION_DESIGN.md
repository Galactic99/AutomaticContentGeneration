# Solution Design Document: Autonomous Content Factory

## 1. Document Control

- **Product:** Autonomous Content Factory
- **Version:** 2.0
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

Marketing teams often find themselves manually repurposing the same technical source material into various channel formats (blogs, X threads, emails). This process is:
- Consumed by creative burnout and repetitive tasks.
- Prone to factual drift and "AI hallucinations" during manual cross-referencing.
- Slow to produce coordinated multi-channel campaigns.

Autonomous Content Factory addresses this by transforming one document into a coordinated, reviewable campaign kit grounded in a single, verified "Source of Truth."

## 4. Goals and Non-Goals

### 4.1 Goals
- Generate three coordinated outputs:
  - Deep-dive Blog draft.
  - Multi-platform Social Media thread (X, LinkedIn).
  - Outreach Email teaser.
- Preserve factual integrity using a structured Fact-Sheet output.
- Support iterative correction loops where the Editor agent provides feedback to the Copywriter.
- Provide real-time execution observability via SSE thinking/typing states.
- **Surgical Regeneration:** Enable AI redrafting of a single platform's content without affecting the rest of the campaign.
- **Cloud Persistence:** Secure campaign and result storage using Supabase PostgreSQL.

### 4.2 Non-Goals (Current Version)
- No Vector Database (RAG) implementation in the current production path.
- No direct multi-tenant authentication system (relying on Supabase Anon/Public access).
- No background job queues; the system uses a persistent SSE request lifecycle.

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
- **Delivery Model:** Server-Sent Events (SSE) for one-way live logging.
- **Persistence Layer:** Supabase PostgreSQL with JSONB columns for agent results.

## 7. Functional Requirements

### FR-1: Parser & Ingestion
- Extract clean text from PDF, Word, and Text documents.
- Handle large document downloads from Supabase Storage.

### FR-2: Researcher Node
- Create a normalized Fact-Sheet containing core facts and value propositions.

### FR-3: Copywriter Node
- Generate drafts as strict JSON.
- Support platform-specific instruction tags (e.g., `[ONLY::email]`) for selective updates.

### FR-4: Editor Node
- Compare Copywriter drafts against the Fact-Sheet to identify speculation or missing facts.
- Trigger iterative refinement cycles.

### FR-5: Real-time Observers
- Report Thinking/Typing phases for every agent node in the pipeline.

## 8. Tech Stack Rationale

- **FastAPI:** Essential for high-performance async streaming and real-time SSE management.
- **LangGraph:** Best-in-class for stateful, cyclic AI workflows and grounding.
- **Google Gemini 2.5 Flash:** Provides an massive context window (1M+) enabling the processing of high-density technical documents.
- **Supabase:** Provides instant, scalable cloud persistence without managing infrastructure.

## 9. Component Design

### 9.1 Backend Agent Nodes
- **Researcher:** Model: `models/gemini-2.5-flash`. Focused on data extraction.
- **Copywriter:** Model: `models/gemini-2.5-flash`. Focused on tone and format.
- **Editor:** Model: `models/gemini-2.5-flash`. Focused on verification and groundedness.

### 9.2 Data Model (Supabase)
- **Table:** `campaigns`
- **Columns:** `results` (JSONB), `source_text` (TEXT), `status` (TEXT), `approvals` (JSONB).

## 10. API Summary

- `POST /campaign/upload`: Source text ingestion.
- `GET /campaign/{id}/stream`: Persistent SSE log feed.
- `PATCH /campaign/{id}/approve`: Cloud-synchronized approval toggle.
- `POST /campaign/{id}/refine`: Manual feedback/regeneration trigger.

## 11. Known Limitations & Reliability

- **Revision Cap:** Limited to 3 iterations to prevent excessive token usage and circuit breaking.
- **Error Handling:** Centralized interceptors report Gemini API quota/exhaustion errors (429) back to the user logs.
- **Persistence:** Relies on Supabase availability for campaign history and sidebars.

## 12. Conclusion

The **Autonomous Content Factory** leverages a state-of-the-art multi-agent architecture to ensure factual grounding and high creative output. By combining LangGraph with real-time SSE observability and Supabase persistence, it provides a robust, professional framework for multi-channel content production.
