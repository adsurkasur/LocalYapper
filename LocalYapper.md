# LocalYapper — Concept Paper (2025)

---

## Part I — Executive Overview

### 1. Background and Vision

**LocalYapper** is a **privacy-first, locally hosted roleplay chatbot platform** built for immersive, character-driven conversations. It is not an AI productivity tool, but rather a space for expressive and emotional roleplay interactions — allowing users to create, customize, and converse with multiple AI personas while maintaining full control over data, privacy, and personality tuning.

Unlike traditional online chat systems, LocalYapper runs entirely on local infrastructure using **Ollama** as the language model handler. It combines realism, memory, and personality flexibility with an elegantly animated and modern interface.

### 2. Purpose and Scope

The project aims to deliver a **personalizable and locally-contained chatbot world**, emphasizing creative interaction, memory retention, and visual storytelling rather than functional assistance. The concept paper defines LocalYapper’s features, architecture, and design direction.

---

## Part II — System Concept

### 1. Goals and Philosophy

- **Privacy-first**: All inference and data are processed locally through Ollama.
- **Emotionally engaging**: Built for character conversations, companionship, and creative simulation.
- **Extensible AI realism**: Internet access, time awareness, and memory depth enhance believability.
- **Personalization-first**: Custom bots, personas, and immersive profiles.
- **Fun yet elegant UI**: Fully animated, visually rich, and calming design with intuitive interactions.

### 2. Key Features

1. **Custom Bot Creation** — Users can define unique bots with custom prompts and traits (name, backstory, behavior style, tone, speaking pattern).
2. **User Persona Creation** — Users can design personal profiles that the AI recognizes and responds to accordingly.
3. **Persona Chooser** — Switch between multiple user personas (e.g., casual self, roleplay character, storyteller) to shape conversation tone.
4. **Web Search Access** — Optional internet capability to allow the AI to fetch real-time information or enhance realism.
5. **Time Awareness** — The AI is aware of real-world time and date to adapt responses contextually.
6. **Adjustable Memory Context Window** — Configure how much chat history the model remembers, balancing immersion with performance.
7. **Persistent Data Storage** — All sessions, bots, personas, and settings are stored locally, ensuring continuity without relying on GPU VRAM.
8. **Fully Animated UI** — Smooth, delightful motion design across transitions, chat flow, and character feedback.
9. **Multi-profile support** — Multiple users can have their own collections of bots, personas, and settings.

---

## Part III — Architecture Overview

### 1. High-Level Design

- **Frontend**: Built on **Next.js 15+ (React)** with **TypeScript**, Tailwind, and Framer Motion for animation.
- **Backend**: Integrated directly within the app, serving as a local API for Ollama proxy, persona/bot CRUD, and session handling.
- **Database**: SQLite with Prisma ORM, managing bots, users, sessions, and memory contexts.
- **Storage**: Local filesystem for avatars, images, and session data.
- **Streaming**: Server-Sent Events (SSE) for live chat streaming.
- **Integration**: Ollama endpoints for model chat and tag management, plus optional web search API bridge.

### 2. Core Components

| Component | Function |
| --- | --- |
| **Bot Engine** | Handles bot creation, persona prompt, and context assembly. |
| **Memory Manager** | Controls memory window and stores prior interactions. |
| **Persona Module** | Defines user identity and manages active persona context. |
| **Ollama Proxy** | Communicates with local models via `/api/chat` and `/api/tags`. |
| **Web Search Handler** | Optional connector to enable external data retrieval. |
| **Time Module** | Syncs real-world time and timezone for contextual replies. |
| **Storage Layer** | Persists chat logs, persona definitions, and metadata. |

---

## Part IV — Product Experience

### 1. Core User Flows

1. **First Run**: Create user profile → connect Ollama → choose or import models → set default persona.
2. **Bot Creation**: Define bot name, persona prompt, avatar, and memory size.
3. **Chat**: Pick bot and user persona → start immersive conversation with animated flow.
4. **Switch Persona**: Instantly switch between user personas during sessions.
5. **Model Selection**: Choose and adjust model settings like temperature, top-p, or context size.
6. **Session Continuity**: Resume prior chats seamlessly using stored memory data.
7. **Internet Mode**: Enable web search for knowledge-based responses (optional).

### 2. Immersive Features

- AI remembers user traits, style, and prior interactions.
- Roleplay sessions can mimic relationships, storylines, or persistent worlds.
- The system maintains a local event timeline to help bots reference past events.

### 3. Experience Goals

- Immediate startup (no cloud latency).
- Feels emotionally consistent, not robotic.
- Visual delight via micro-animations, transitions, and glow effects.
- Encourages long-term engagement with memory continuity.

---

## Part V — Visual and Interaction Design

### 1. Design Philosophy

**“Fun meets Serenity.”** The interface blends warm expressiveness with clarity and balance — allowing emotional engagement without distraction.

### 2. Visual Language

- **Rounded corners** (12–16px), soft gradients, and glassy surfaces.
- **Typography**: Plus Jakarta Sans or Inter; smooth, readable, approachable.
- **Color Theme**: Light & Dark modes, both calm and vivid.
- **Primary Accent**: #4C82FF; with mint (#3AD29F) and lilac (#A97FFF) for highlights.
- **Motion**: Framer Motion-powered smooth transitions and expressive chat animations.

### 3. Component Style Summary

| Component | Key Traits |
| --- | --- |
| **Buttons** | Rounded, glowing hover, elastic press animation |
| **Inputs** | Gradient borders with subtle focus bloom |
| **Chat Bubble** | Asymmetric shapes, glow pulse during streaming |
| **Sidebar** | Frosted-glass blur with animated expand/collapse |
| **Avatars** | Dynamic accent ring animations |
| **Modals** | Floating panels with depth and subtle parallax |

---

## Part VI — Intelligence and Memory System

### 1. Context Memory Adjustment

Users can adjust how much chat history is remembered by each bot. Lower memory improves performance, while higher memory enhances realism. Data beyond the memory window is archived locally for retrieval.

### 2. Persistent Storage

- Every message and event is stored in a lightweight SQLite database.
- Archived sessions can be reloaded to restore long-term memory.
- Reduces VRAM dependence by managing memory in disk-based context slices.

### 3. Internet and Time Modules

- **Internet Module**: Optional connector enabling real-time web access through approved APIs or local bridges.
- **Time Module**: Syncs with the system clock to provide situational awareness (day/night, greetings, etc.).

---

## Part VII — Technical Direction

### 1. Stack Overview

- **Frontend**: Next.js 15+, TypeScript, Tailwind, Framer Motion, Zustand
- **Backend**: Local API endpoints, Ollama proxy
- **Database**: SQLite (Prisma)
- **Runtime**: Node.js
- **AI Engine**: Ollama local model server

### 2. Data Flow

User → Persona Selector → Bot → Ollama Proxy → Model Response → Memory Manager → Storage

### 3. Testing Focus

- Persona switching consistency
- Context window persistence
- Internet and time awareness reliability
- UI performance (animation FPS > 55 average)

---

## Part VIII — Roadmap

- **MVP**: Profiles, Bots, Chat, Memory, Animation, Light/Dark Theme
- **V1**: Personas, Internet Access, Time Awareness
- **V2**: Long-term memory replay, RAG, Voice Mode, LAN Sync

---

## Part IX — Conclusion

**LocalYapper** represents the next evolution of locally hosted AI roleplay experiences — merging **expressive character interaction**, **privacy-respecting architecture**, and **visually rich design**. It enables immersive storytelling, companionship, and simulation, all powered entirely on the user’s machine.

Its foundation balances emotion, function, and freedom — creating a world where every conversation feels alive, personal, and truly yours.

---

## Appendix — Technical Architecture Diagram (Textual)

### A. Layered View

1. **Experience Layer (Client UI)**
    - Screens: Profile, Persona Selector, Bots, Chat, Settings, Model Chooser
    - Animation: Framer Motion (page transitions, chat streaming pulse, hover/press)
    - Theme: Light/Dark tokens; accent chip per active persona/bot
2. **Application Layer (In‑App Services)**
    - **Persona Module**: active user persona state; persona switcher; persona metadata provider
    - **Bot Engine**: bot registry, persona prompt builder, system prompt composer, parameter resolver (model, temp, top‑p, memory window)
    - **Session Manager**: session lifecycle (create, archive, rename), message draft queue, regenerate handling
    - **Memory Manager**: rolling context window, summarization/condense policies, long‑term archive access
    - **Search/Time Modules** (optional): outbound web search broker; time provider (timezone, absolute timestamp)
3. **Integration Layer (APIs/Bridges)**
    - **Ollama Proxy API**: `/api/ollama/chat` (SSE streaming), `/api/ollama/tags` (models)
    - **Web Search Bridge** (opt‑in): `/api/search/query` (provider‑agnostic)
    - **System Time**: local time service (no external calls)
4. **Data Layer**
    - **SQLite (Prisma)**: Users, Personas, Bots, Sessions, Messages, Settings, MemoryPolicy
    - **Filesystem**: Avatars, attachments, exports/imports under `/data`

---

### B. Request/Response Sequence (Happy Path)

1. **User action**: chooses Persona A → opens Bot X → types a message → presses Send.
2. **Bot Engine** assembles **context pack**:
    - Persona A traits → `{ name, style, speaking_patterns, preferences }`
    - Bot X prompt → `{ system_prompt, guardrails, tone }`
    - Memory Manager → **context slice** of recent messages sized by **MemoryPolicy** (e.g., 4–32 turns)
    - Optional Time Module → `{ now_iso, weekday, locale }`
    - Optional Search Module (if enabled + requested by the bot or slash command) → inserts retrieved snippets with attributions
3. **Ollama Proxy** sends `{ model, messages, options, stream:true }` to local Ollama.
4. **Streaming** tokens arrive via SSE → UI renders incremental response with typing pulse.
5. **Persistence**: Session Manager commits user msg + assistant msg to SQLite; Memory Manager updates rolling window; long messages beyond window archived.

---

### C. Web Search Extension (Opt‑in)

- Trigger modes: explicit user slash command (`/web`), bot tool request, or UI toggle per session.
- Flow: Query → Provider adapter → Snippet set `{title, url, excerpt, timestamp}` → Ranking → Deduplicate → Inject into context as **facts block** with source list.
- Safety: rate limiting; domain allowlist; cache to reduce repeat lookups.

---

### D. Time Awareness

- Source: local system clock + user timezone from Profile.
- Injected fields: `{ now_iso, local_time_str, weekday_name, time_of_day }`.
- Usage: greetings, temporal references, scheduling language in roleplay.

---

### E. Memory Policies

- **Window**: number of turns or token budget per bot/session (user adjustable).
- **Decay**: summarization of older segments into compact memory notes (per bot).
- **Pinning**: allow certain facts (persona traits, relationship beats) to stay always‑on in context.
- **Cold Storage**: full chat history remains in SQLite and is recallable on demand.

---

### F. Error & Edge Handling

- **Ollama offline** → UI banner, retry/backoff, quick link to local guide.
- **Model missing** → inline chip “Missing model” with chooser CTA.
- **Context too large** → Memory Manager trims to budget and surfaces note to user.
- **Search failure** → graceful fallback; continue without web snippets.

---

### G. Data Contracts (Conceptual)

- `ContextPack`: `{ persona, bot, time?, searchFacts?, messages[], params }`
- `MemoryPolicy`: `{ windowTurns|tokenBudget, decay:true|false, pins:[factId], summarizer: 'simple|llm' }`
- `SearchResult`: `{ title, url, excerpt, fetchedAt }`

This diagram clarifies how **LocalYapper** composes persona, bot, memory, time, and (optionally) web search into a coherent, streamed conversation while persisting everything locally.

---

## Appendix — MVP Acceptance Criteria

### A. Profiles & Personas

**Goal:** Users can create a profile and multiple personas and switch between them in-session.

- **Create Profile**
    - *Given* the first run, *when* the user enters display name, avatar, locale, timezone, theme, *then* the profile saves and is used as default.
- **Create Persona**
    - *Given* a profile, *when* the user creates a persona with name, short bio, tone, speaking style, and optional tags, *then* the persona appears in the chooser and can be set active.
- **Switch Persona**
    - *Given* an active chat, *when* the user switches persona, *then* new turns use the new persona context; history remains intact and labeled.
- **Persistence**
    - Closing and reopening the app preserves profiles and personas.

### B. Bot Creation & Management

**Goal:** Users can define and organize roleplay bots.

- **Create Bot**
    - *Given* the bot form is filled (name, avatar, system prompt, default model, default parameters, color), *then* the bot card appears in the grid.
- **Edit Bot**
    - *When* the user edits any property, *then* changes are reflected in new sessions and (optionally) prompted to apply to current session.
- **Delete/Archive**
    - *When* the user archives a bot, *then* the bot is hidden from quick pick but sessions remain accessible.

### C. Model Chooser

**Goal:** Select an installed Ollama model per bot or per session.

- **List Models**
    - *Given* Ollama is running with installed models, *then* the list shows names, sizes, and modified dates in < 250 ms after opening the modal.
- **Fallback**
    - *If* a bot’s default model is missing, *then* show a "Missing model" chip and prompt to pick another.
- **Override**
    - Per-session override is clearly indicated by a model chip and can be reset to bot default.

### D. Chat Sessions & Streaming

**Goal:** Smooth, immersive roleplay chat with streaming responses.

- **Start Session**
    - *Given* a bot and active persona, *when* the user sends a message, *then* the response begins streaming in < 1s (local model permitting).
- **Stop/Regenerate**
    - *When* Stop is clicked, streaming halts within 200 ms; *when* Regenerate is clicked, the last assistant turn is replaced with a new one.
- **Edit & Copy**
    - Messages support inline edit (user only) and copy actions.
- **Search in Session**
    - *When* user searches, matches are highlighted and navigable.

### E. Memory Context Window

**Goal:** Adjustable, clear memory policy that balances immersion and performance.

- **Adjust Window**
    - *When* user sets a window by turns or tokens, *then* the context pack respects that limit on the next assistant turn.
- **Pin Facts**
    - *When* user pins facts (e.g., persona traits), *then* they are always included regardless of window.
- **Summarize/Decay**
    - *If* history exceeds the budget, *then* older content is summarized into memory notes stored in SQLite and referenceable on demand.

### F. Internet Access (Opt‑in)

**Goal:** Real-time knowledge injection without breaking privacy expectations.

- **Enable/Disable**
    - *When* Internet Mode is toggled on per session (or triggered via `/web`), *then* search results can be fetched and injected as facts with source titles and timestamps.
- **Policies**
    - If disabled, any tool request to search fails gracefully with a visible note.

### G. Time Awareness

**Goal:** Accurate temporal context.

- **Injection**
    - *When* a turn is generated, *then* the current ISO timestamp, weekday, and local time string are available to the prompt builder.
- **Display**
    - Time references in the chat (e.g., “good evening”) align with system time.

### H. Persistence & Portability

**Goal:** All data persists locally; easy export/import.

- **Local Save**
    - Sessions, bots, personas, and settings survive app restarts.
- **Export/Import**
    - Export produces a single JSON (+ media folder) bundle; Import validates and lists items to add/merge.

### I. UI & Animation

**Goal:** Fully animated but performant.

- **Performance**
    - Animated interactions maintain average ≥ 55 FPS on a midrange machine.
- **Accessibility**
    - Respect “reduced motion” system setting by disabling intensive animations.

---

## Appendix — Prompt Assembly Spec (Context Pack)

### A. Inputs

- **Persona** (active user persona): `{ name, style, speaking_patterns, preferences, tags }`
- **Bot**: `{ name, system_prompt, safety_rules, tone, world_notes }`
- **MemoryPolicy**: `{ windowTurns|tokenBudget, pins[], summarizer }`
- **Messages**: recent turns as `[ {role, content, createdAt} ]`
- **Time** (optional): `{ now_iso, local_time_str, weekday_name, time_of_day }`
- **SearchFacts** (optional): `[ {title, url, excerpt, fetchedAt} ]`

### B. Assembly Order (Conceptual)

1. **System**
    - Bot system prompt
    - Safety/guardrails (concise)
    - Persona meta (how the AI should treat the user)
    - Time awareness block (if enabled)
    - Search facts block (if present)
    - Behavior directives (roleplay focus, never claim external execution)
2. **Conversation**
    - Most recent messages up to **MemoryPolicy** budget
    - Pinned facts appended after system and before messages

### C. Sample Context Pack (Pseudo‑JSON)

```json
{
  "system": [
    "You are Aria, a warm, empathetic roleplay companion. Stay in-character at all times.",
    "Safety: avoid explicit illegal content; keep language respectful; no real-world instructions for harm.",
    "Treat the user as 'Nova' unless they switch persona. Match Nova's tone and vocabulary preferences.",
    "Time: 2025-10-08T17:25:00+07:00 (Wednesday, evening).",
    "If web facts are present, reference them conversationally and include the source title in parentheses."
  ],
  "pins": [
    "Nova prefers short paragraphs and asks lots of clarifying questions.",
    "Aria likes cozy, slice-of-life scenes and gentle humor."
  ],
  "facts": [
    {"title": "Tea Types", "url": "https://example.com/teas", "excerpt": "Green teas brew at ~80°C, black at ~95°C.", "fetchedAt": "2025-10-08T10:15:00Z"}
  ],
  "messages": [
    {"role": "user", "content": "Let's watch the rain together on the porch."},
    {"role": "assistant", "content": "I’ll grab a blanket—do you like chamomile or jasmine tonight?"}
  ],
  "params": { "model": "llama3.2:3b", "temperature": 0.7, "top_p": 0.9 }
}

```

### D. Behavioral Directives (Roleplay Focus)

- Stay in-character for the selected bot; avoid meta talk about being an AI unless asked.
- Use the active user persona name, tone, and preferences.
- Use time-awareness naturally (greetings, pacing, day/night ambience).
- If **Internet Mode** is on and facts exist, weave them in softly: *“I read earlier (Tea Types) that…”*
- Never claim to have executed external tasks; if asked, respond in-character with suggestions.

### E. Memory Management Rules

- If token budget exceeded: summarize the oldest chunk into a compact note; keep conversation coherence.
- Always include **pins** and a minimal “relationship recap” note for continuity in roleplay.
- Allow per-bot overrides for memory policy (e.g., “Aria keeps 8 turns; summarize beyond”).

### F. Validation & Logging (Local Only)

- Log the final **context pack size** and **token estimate** per turn (local console/debug panel only).
- Provide a “View Prompt” debug toggle for transparency.

These additions ensure **LocalYapper** is testable, predictable, and tuned for immersive roleplay while preserving privacy and local control.