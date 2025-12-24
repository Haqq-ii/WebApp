# AI Chat Web Application

A modern, clean AI chat application built with Next.js, TypeScript, TailwindCSS, and Supabase. The application integrates with n8n webhooks to connect to AI services (like OpenAI) without directly calling the API from the client.

## 🚀 Features

- **Clean, Minimal UI**: White-themed, modern interface similar to ChatGPT
- **Authentication**: Email/password and Google OAuth via Supabase Auth
- **Persistent Chat History**: All conversations saved in Supabase database
- **Session Management**: Create, view, and delete chat sessions
- **n8n Integration**: Server-side webhook calls to n8n workflows
- **Row Level Security**: Secure data access with Supabase RLS policies
- **Responsive Design**: Works on desktop and mobile devices

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account and project
- n8n instance with a webhook workflow configured
- (Optional) Google OAuth credentials for Google sign-in

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd webapp
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
APP_NAME="AI Chat"
OPENAI_MODEL=gpt-4

# N8N Webhook Configuration (Server-side only)
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/your-webhook-id
N8N_WEBHOOK_SECRET=your_webhook_secret_here  # Optional
```

**Important Notes:**
- `NEXT_PUBLIC_*` variables are exposed to the client
- `N8N_WEBHOOK_URL` and `N8N_WEBHOOK_SECRET` are server-only (never exposed to client)
- Get your Supabase credentials from: Project Settings → API

### 3. Set Up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/001_init.sql`
4. Paste and run the SQL in the SQL Editor
5. Verify tables are created: `profiles`, `chat_sessions`, `chat_messages`

### 4. Configure Supabase Authentication

#### Enable Email/Password Auth:
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. Ensure **Email** provider is enabled

#### Enable Google OAuth (Optional):
1. Go to **Authentication** → **Providers** → **Google**
2. Enable Google provider
3. Add your Google OAuth credentials (Client ID and Secret)
4. Add redirect URLs:
   - **Local**: `http://localhost:3000/auth/callback`
   - **Production**: `https://yourdomain.com/auth/callback`

### 5. Configure n8n Webhook

Your n8n workflow should:

1. **Receive** a POST request with this payload structure:
   ```json
   {
     "app": "AI Chat",
     "user_id": "<uuid>",
     "session_id": "<uuid>",
     "message": "<latest user message>",
     "history": [
       {"role": "user", "content": "..."},
       {"role": "assistant", "content": "..."}
     ],
     "metadata": {
       "timestamp": "<ISO>",
       "source": "webapp",
       "model": "gpt-4"
     }
   }
   ```

2. **Return** a JSON response with this format:
   ```json
   {
     "reply": "AI response text here"
   }
   ```

   Optional fields:
   ```json
   {
     "reply": "AI response text here",
     "sources": ["source1", "source2"],
     "metadata": {}
   }
   ```

3. **Handle** the `x-webhook-secret` header if `N8N_WEBHOOK_SECRET` is set

**TODO in code:** Adjust the payload/response format in `/app/api/chat/route.ts` and `/lib/n8n.ts` to match your n8n workflow.

### 6. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Application

1. **Register/Login:**
   - Go to `/auth`
   - Create an account or login
   - Or use Google OAuth

2. **Create a Chat:**
   - After login, you'll be redirected to `/chat`
   - Click "New Chat" in the sidebar
   - Type a message and send

3. **Verify n8n Integration:**
   - Check your n8n workflow execution logs
   - Verify the webhook receives the request
   - Check that the AI response appears in the chat

4. **Test Persistence:**
   - Refresh the page
   - Your chat history should persist
   - Create multiple sessions and switch between them

## 📁 Project Structure

```
webapp/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # n8n webhook proxy
│   │   └── sessions/               # Session CRUD APIs
│   ├── auth/
│   │   ├── page.tsx                # Login/Register UI
│   │   └── callback/route.ts      # OAuth callback handler
│   ├── chat/
│   │   └── page.tsx                # Main chat interface
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout
│   └── globals.css                 # Global styles
├── components/
│   ├── AuthTabs.tsx                # Login/Register tabs
│   ├── ChatLayout.tsx              # Chat page layout
│   ├── MessageBubble.tsx           # Individual message UI
│   ├── MessageInput.tsx            # Message input component
│   ├── MessageList.tsx             # Messages container
│   ├── Navbar.tsx                  # Navigation bar
│   ├── Sidebar.tsx                 # Chat sessions sidebar
│   └── SessionList.tsx             # Session list component
├── lib/
│   ├── db.ts                       # Database query helpers
│   ├── n8n.ts                      # n8n webhook helper
│   ├── requireUser.ts              # Auth guard helper
│   ├── supabaseClient.ts           # Client-side Supabase
│   ├── supabaseServer.ts           # Server-side Supabase
│   ├── types.ts                    # TypeScript types
│   └── database.types.ts           # Supabase type definitions
├── supabase/
│   └── migrations/
│       └── 001_init.sql            # Database schema + RLS
└── package.json
```

## 🔒 Security Notes

- **Row Level Security (RLS)**: All database tables have RLS enabled. Users can only access their own data.
- **Server-side Webhooks**: n8n webhook URL is never exposed to the client. All calls go through `/api/chat`.
- **Environment Variables**: Sensitive keys (like `N8N_WEBHOOK_SECRET`) are server-only.
- **Authentication**: All protected routes require valid Supabase session.

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

**Important:** Update Supabase OAuth redirect URLs to include your production domain.

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- AWS Amplify
- Self-hosted with Node.js

## 🐛 Troubleshooting

### "N8N_WEBHOOK_URL is not configured"
- Make sure `.env` file exists and `N8N_WEBHOOK_URL` is set
- Restart the dev server after changing `.env`

### "Session not found or unauthorized"
- Check that RLS policies are correctly set up in Supabase
- Verify the user is logged in

### Google OAuth not working
- Check redirect URLs in Supabase dashboard
- Verify Google OAuth credentials are correct
- Ensure callback route is accessible

### Messages not persisting
- Check Supabase database connection
- Verify RLS policies allow inserts
- Check browser console for errors

## 📝 Customization

### Change App Name
Update `APP_NAME` in `.env` file.

### Adjust n8n Payload/Response
Edit `/app/api/chat/route.ts` and `/lib/n8n.ts` to match your n8n workflow format.

### Modify UI Theme
Edit `tailwind.config.ts` and component files to change colors, spacing, etc.

### Add More Auth Providers
Follow Supabase docs to add GitHub, Discord, etc. Update `AuthTabs.tsx` to add buttons.

## 📄 License

This project is open source and available for use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase and n8n documentation
3. Check Next.js documentation for framework-specific issues

---

**Happy Chatting! 🎉**

