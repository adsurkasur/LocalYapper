# LocalYapper

<div align="center">
  <h3>🗣️ A Privacy-First, Locally-Hosted Roleplay Chatbot Platform</h3>
  <p><em>Experience immersive AI conversations with complete data privacy and control</em></p>

  ![LocalYapper Demo](https://img.shields.io/badge/Next.js-15-black)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
  ![Ollama](https://img.shields.io/badge/Ollama-Supported-green)
  ![SQLite](https://img.shields.io/badge/SQLite-Database-blue)
  ![License](https://img.shields.io/badge/License-MIT-yellow)
</div>

---

## ✨ Features

### 🎭 **Roleplay-Focused Experience**
- **Custom Personas**: Create and switch between different user identities
- **AI Characters**: Design unique bots with custom prompts and personalities
- **Immersive Conversations**: Deep, contextual roleplay with memory management
- **Real-time Streaming**: Smooth, animated chat responses

### 🔒 **Privacy-First Architecture**
- **100% Local**: No cloud dependencies or data transmission
- **Self-Hosted AI**: Uses Ollama for local model inference
- **Data Portability**: Export/import all your data as JSON
- **SQLite Storage**: Fast, reliable local database

### 🎨 **Modern User Experience**
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Themes**: Automatic theme switching
- **Smooth Animations**: Framer Motion powered transitions
- **Intuitive Navigation**: Easy access to all features

### 🔍 **Advanced Features**
- **Internal Search**: Find conversations, personas, and bots instantly
- **Memory Management**: Adjustable context windows and token limits
- **File Uploads**: Attach documents and images to conversations
- **Session Management**: Organize chats by topic and bot

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** ([Download](https://nodejs.org/))
- **Ollama** ([Download](https://ollama.ai))
- **Git** ([Download](https://git-scm.com/))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd localyapper
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Ollama**
   ```bash
   # Install Ollama from https://ollama.ai
   # Start the Ollama server
   ollama serve

   # In another terminal, pull a model
   ollama pull llama3.2:3b
   ```

4. **Initialize the database**
   ```bash
   # Apply database migrations
   npm run prisma:migrate

   # Seed with demo data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Start chatting with the demo persona and bot!

---

## 📖 User Guide

### Getting Started

1. **First Launch**: The app automatically loads with demo data
2. **Select a Persona**: Choose from available user personas in the chat interface
3. **Choose a Bot**: Pick an AI character to converse with
4. **Start Chatting**: Begin your roleplay conversation!

### Managing Personas

- **View Personas**: Navigate to the Profile page to see all personas
- **Create New**: Click "Add Persona" to create custom identities
- **Edit Existing**: Click on any persona to modify their details
- **Delete**: Remove personas you no longer need

### Creating Custom Bots

1. **Access Bots Page**: Use the navigation to reach the Bots section
2. **Add New Bot**: Click "Create Bot" button
3. **Configure**:
   - **Name & Description**: Basic bot identity
   - **Color**: Visual theme for the bot
   - **System Prompt**: Core personality and behavior instructions
   - **Model Settings**: Choose AI model and parameters
4. **Test**: Start a new session to test your bot

### Chat Sessions

- **New Sessions**: Automatically created when you start chatting
- **Session History**: View past conversations in the Sessions page
- **Resume Chats**: Click on any session to continue where you left off
- **Delete Sessions**: Remove conversations you don't want to keep

### Data Management

#### Export Your Data
1. Go to Settings page
2. Click "Export Data"
3. Download your complete data as JSON
4. Save the file securely

#### Import Data
1. Go to Settings page
2. Click "Import Data"
3. Select your exported JSON file
4. Confirm import to restore your data

#### Search
- Use the Search page to find:
  - Conversations by content
  - Personas by name or description
  - Bots by name or prompt
  - Sessions by title

---

## 🛠️ Technical Architecture

### Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15 + React 19 | Modern web framework with App Router |
| **Language** | TypeScript 5 | Type-safe development |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first CSS with component library |
| **Animations** | Framer Motion | Smooth, performant animations |
| **Backend** | Next.js API Routes | Serverless API endpoints |
| **Database** | SQLite + Prisma ORM | Local data persistence |
| **AI Integration** | Ollama HTTP API | Local model inference |
| **State Management** | Zustand + React Query | Client and server state |
| **Streaming** | Server-Sent Events | Real-time chat responses |

### Project Structure

```
localyapper/
├── app/                          # Next.js App Router
│   ├── api/                      # API endpoints
│   │   ├── bots/                 # Bot management
│   │   ├── export/               # Data export
│   │   ├── import/               # Data import
│   │   ├── ollama/               # AI integration
│   │   │   ├── chat/             # Chat streaming
│   │   │   └── models/           # Model listing
│   │   ├── personas/             # Persona management
│   │   ├── search/               # Internal search
│   │   │   └── internal/         # Search implementation
│   │   └── sessions/             # Session management
│   │       └── [id]/
│   │           ├── message/      # Message sending
│   │           └── route.ts      # Session CRUD
│   ├── bots/                     # Bots management page
│   ├── chat/                     # Chat interface
│   ├── profile/                  # Persona management
│   ├── search/                   # Search interface
│   ├── settings/                 # App settings
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Landing page
├── components/                   # React components
│   ├── navigation.tsx            # Site navigation
│   ├── model-chooser.tsx         # Model selection
│   ├── providers.tsx             # React context providers
│   ├── theme-provider.tsx        # Theme management
│   └── ui/                       # shadcn/ui components
├── lib/                          # Utilities and business logic
│   ├── auth.ts                   # User authentication
│   ├── prisma.ts                 # Database client
│   ├── prompt-assembly.ts        # Context building
│   ├── query-client.ts           # React Query setup
│   ├── store.ts                  # Zustand state
│   ├── types.ts                  # TypeScript definitions
│   └── utils.ts                  # Helper functions
├── prisma/                       # Database layer
│   ├── data/
│   │   └── app.db                # SQLite database
│   ├── migrations/               # Schema migrations
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Demo data seeding
├── data/
│   └── uploads/                  # File attachments
├── public/                       # Static assets
└── Configuration files
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── tsconfig.json
    ├── components.json
    └── package.json
```

### Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  theme     String   @default("system")
  defaultModel String @default("llama3.2:3b")
  temperature Float  @default(0.7)
  topP      Float   @default(0.9)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  personas    Persona[]
  bots        Bot[]
  sessions    ChatSession[]
}

model Persona {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  systemPrompt String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user       User
  messages   Message[]
}

model Bot {
  id           String   @id @default(cuid())
  userId       String
  name         String
  description  String?
  color        String
  systemPrompt String
  modelName    String
  temperature  Float
  topP         Float
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user       User
  sessions   ChatSession[]
}

model ChatSession {
  id          String   @id @default(cuid())
  userId      String
  botId       String
  title       String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user       User
  bot        Bot
  messages   Message[]
}

model Message {
  id          String   @id @default(cuid())
  sessionId   String
  personaId   String?
  role        String   // 'user' or 'assistant'
  content     String
  createdAt   DateTime @default(now())

  session    ChatSession
  persona    Persona?
}
```

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Database
npm run prisma:migrate   # Apply database migrations
npm run prisma:generate  # Generate Prisma client
npm run prisma:studio    # Open Prisma Studio
npm run prisma:reset     # Reset database
npm run seed             # Seed with demo data

# Testing
npm run test             # Run tests (when implemented)
npm run test:watch       # Run tests in watch mode
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
# Ollama Configuration
OLLAMA_HOST=http://127.0.0.1:11434

# Optional: Database Configuration
DATABASE_URL="file:./prisma/data/app.db"

# Optional: Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### API Reference

#### Chat & AI
- `GET /api/ollama/models` - List available Ollama models
- `POST /api/ollama/chat` - Stream chat responses from Ollama

#### Data Management
- `GET /api/personas` - List user personas
- `POST /api/personas` - Create new persona
- `GET /api/bots` - List user bots
- `POST /api/bots` - Create new bot
- `GET /api/sessions` - List chat sessions
- `POST /api/sessions` - Create new session
- `POST /api/sessions/:id/message` - Send message to session

#### Search & Export
- `GET /api/search/internal?q=query` - Search across all user data
- `GET /api/export` - Export all user data as JSON
- `POST /api/import` - Import user data from JSON

### Development Tips

1. **Hot Reload**: Changes are automatically reflected in development
2. **Type Safety**: Full TypeScript coverage with strict mode
3. **Database Changes**: Use `npm run prisma:migrate` after schema changes
4. **Seed Data**: Run `npm run seed` to reset demo data
5. **Debugging**: Use browser dev tools and `console.log` for debugging

---

## 🔍 Troubleshooting

### Common Issues

#### Ollama Connection Issues
```
Error: Failed to connect to Ollama
```
**Solutions**:
1. Ensure Ollama is running: `ollama serve`
2. Check OLLAMA_HOST environment variable
3. Verify model is pulled: `ollama pull llama3.2:3b`

#### Database Errors
```
Error: P1001: Can't reach database server
```
**Solutions**:
1. Run migrations: `npm run prisma:migrate`
2. Reset database: `npm run prisma:reset`
3. Check file permissions on `prisma/data/app.db`

#### Build Errors
```
Error: Module not found
```
**Solutions**:
1. Clear Next.js cache: `rm -rf .next`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check Node.js version: `node --version` (requires 18+)

#### Streaming Issues
```
Chat responses not streaming
```
**Solutions**:
1. Check browser console for errors
2. Verify Ollama model supports streaming
3. Check network/firewall settings

### Performance Optimization

1. **Database Queries**: Use React Query for caching
2. **Bundle Size**: Components are tree-shaken automatically
3. **Images**: Optimize images in `/public` directory
4. **Memory**: Adjust context windows in bot settings

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Run tests**: `npm run lint && npm run type-check`
5. **Commit**: `git commit -m "Add your feature"`
6. **Push**: `git push origin feature/your-feature`
7. **Create a Pull Request**

### Development Guidelines

- **TypeScript**: Strict type checking enabled
- **ESLint**: Follow the configured linting rules
- **Commits**: Use conventional commit format
- **Testing**: Add tests for new features
- **Documentation**: Update docs for API changes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Ollama** for making local AI accessible
- **Next.js** for the amazing React framework
- **shadcn/ui** for beautiful UI components
- **Prisma** for the excellent ORM
- **Tailwind CSS** for utility-first styling

---

<div align="center">
  <p><strong>Built with ❤️ for privacy-conscious AI enthusiasts</strong></p>
  <p>
    <a href="#features">Features</a> •
    <a href="#quick-start">Quick Start</a> •
    <a href="#user-guide">User Guide</a> •
    <a href="#technical-architecture">Architecture</a> •
    <a href="#development">Development</a> •
    <a href="#troubleshooting">Troubleshooting</a>
  </p>
</div>