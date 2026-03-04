# UIGen

AI-powered UI generation app built with Next.js. Users chat with an AI assistant that generates and edits UI components in a virtual file system with live preview.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Turbopack, RSC)
- **Language**: TypeScript (strict mode)
- **UI**: shadcn/ui (new-york style), Tailwind CSS v4, Radix UI primitives, Lucide icons
- **AI**: Vercel AI SDK (`ai`) + Anthropic provider (`@ai-sdk/anthropic`)
- **Database**: SQLite via Prisma (schema at `prisma/schema.prisma`, client output at `src/generated/prisma`)
- **Auth**: JWT-based with `jose`, passwords hashed with `bcrypt`
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Testing**: Vitest + React Testing Library + jsdom

## Project Structure

```
src/
  app/              # Next.js App Router pages and API routes
    api/chat/       # AI chat streaming endpoint
    [projectId]/    # Project editor page
  components/
    ui/             # shadcn/ui components
    chat/           # Chat interface (MessageList, MessageInput, ChatInterface)
    editor/         # Code editor (CodeEditor, FileTree)
    preview/        # Live preview (PreviewFrame)
    auth/           # Auth forms (SignInForm, SignUpForm, AuthDialog)
  lib/
    contexts/       # React contexts (file-system, chat)
    tools/          # AI tools (str-replace, file-manager)
    transform/      # JSX transformer (Babel standalone)
    prompts/        # System prompts for AI
  actions/          # Server actions (create/get projects)
  hooks/            # Custom hooks (use-auth)
prisma/             # Prisma schema and migrations
```

## Commands

- `npm run dev` — Start dev server with Turbopack
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm test` — Run tests (Vitest)
- `npm run setup` — Install deps + Prisma generate + migrate
- `npm run db:reset` — Reset database

## Path Aliases

- `@/*` maps to `./src/*`

## Conventions

- Use `@/` import alias for all project imports
- Components go in `src/components/` organized by feature
- Server actions go in `src/actions/`
- Tests live next to source files in `__tests__/` directories
- shadcn/ui components in `src/components/ui/` — do not manually edit these
- Use comments infrequently — only when logic isn't self-evident
