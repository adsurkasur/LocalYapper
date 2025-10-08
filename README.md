# LocalYapper

A privacy-first, locally-hosted roleplay chatbot platform built with Next.js and Ollama.

## Features

- **Roleplay-focused**: Immersive character conversations with custom bots and user personas
- **Local-first**: All data stored locally, no cloud dependencies
- **Streaming chat**: Real-time responses with smooth animations
- **Persona switching**: Change user personas mid-conversation
- **Custom bots**: Create and manage AI characters with unique prompts
- **Memory management**: Adjustable context windows for conversation depth
- **Modern UI**: Animated interface with light/dark themes

## Quick Start

### Prerequisites

1. **Node.js 18+** and **npm**
2. **Ollama** installed and running locally

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd localyapper

# Install dependencies
npm install

# Set up the database
npm run prisma:migrate
npm run seed

# Start the development server
npm run dev
```

### Ollama Setup

1. Install Ollama from [ollama.ai](https://ollama.ai)
2. Start Ollama server:
   ```bash
   ollama serve
   ```
3. Pull a model (in another terminal):
   ```bash
   ollama pull llama3.2:3b
   ```

### Usage

1. Open [http://localhost:3000](http://localhost:3000)
2. The app will redirect to the chat page with demo data
3. Select a persona from the dropdown
4. Start chatting!

## Architecture

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes
- **Database**: SQLite with Prisma ORM
- **AI**: Ollama local models
- **State**: Zustand + React Query
- **UI**: shadcn/ui + Framer Motion

## API Routes

- `GET /api/ollama/models` - List available Ollama models
- `POST /api/ollama/chat` - Stream chat responses
- `GET/POST /api/personas` - Persona management
- `GET/POST /api/bots` - Bot management
- `GET/POST /api/sessions` - Session management
- `POST /api/sessions/:id/message` - Send messages

## Development

```bash
# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
npm run prisma:migrate  # Apply migrations
npm run prisma:generate # Generate Prisma client
npm run prisma:studio   # Open database UI
```

## Environment Variables

Create `.env.local`:

```env
OLLAMA_HOST=http://127.0.0.1:11434
```

## Project Structure

```
localyapper/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── chat/              # Chat page
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # React Query provider
├── lib/                   # Utilities
│   ├── prisma.ts         # Database client
│   ├── query-client.ts   # React Query client
│   └── store.ts          # Zustand store
├── prisma/               # Database schema and migrations
│   ├── schema.prisma
│   └── seed.ts
└── data/                 # Local data storage
    └── uploads/          # File uploads
```

## Contributing

This is a demo implementation of the LocalYapper concept. For production use, additional features like authentication, multi-user support, and advanced memory management would be needed.

## License

MIT