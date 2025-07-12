# Flashcards AI - AI-Powered Flashcard Generator

Transform any text or video into smart flashcards using AI. Export to Anki and boost your learning efficiency.

## Features

- 🤖 **AI-Powered Generation**: Convert text and YouTube videos into intelligent flashcards
- 📱 **Modern UI**: Beautiful, responsive interface with smooth animations
- 🔐 **Authentication**: Secure user authentication with Supabase
- 💾 **Cloud Storage**: Save and manage your flashcard sets in the cloud
- 📊 **Dashboard**: Track your learning progress and manage flashcard collections
- 📥 **Anki Export**: Seamlessly export flashcards to Anki format
- 🎥 **Video Support**: Extract content from YouTube videos automatically

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS
- **Backend**: Supabase (Database + Authentication)
- **AI**: OpenAI GPT for flashcard generation
- **Animation**: Framer Motion
- **Video Processing**: ytdl-core for YouTube content extraction

## Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd flashcards-ai/my-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the API settings
3. In your Supabase dashboard, go to the SQL Editor
4. Run the SQL schema from `schema.sql` to create the required tables

### 4. Configure Environment Variables

Create a `.env.local` file in the my-app directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key
```

### 5. Set Up Authentication (Optional)

To enable Google OAuth:

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set the redirect URL to: `http://localhost:3000/auth/callback`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### Creating Flashcards

1. **Sign up or sign in** to your account
2. **Navigate to the converter** by clicking "Get Started" or "Create New Flashcards"
3. **Choose your input method**:
   - **Text Input**: Paste any long text, article, or study material
   - **YouTube Link**: Provide a YouTube video URL for automatic transcript extraction
4. **Generate flashcards** using AI
5. **Review and edit** the generated flashcards
6. **Download as Anki file** or save to your dashboard

### Managing Flashcard Sets

- **Dashboard**: View all your saved flashcard sets
- **Statistics**: Track your learning progress
- **Organization**: Manage and organize your flashcard collections

## Database Schema

The application uses the following Supabase tables:

### flashcard_sets
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key to auth.users)
- `title`: VARCHAR(255)
- `description`: TEXT
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

### flashcards
- `id`: UUID (Primary Key)
- `set_id`: UUID (Foreign Key to flashcard_sets)
- `question`: TEXT
- `answer`: TEXT
- `created_at`: TIMESTAMP

## API Endpoints

### POST /api/generate-flashcards
Generates flashcards from text or YouTube video.

**Request Body:**
```json
{
  "type": "text" | "youtube",
  "value": "content or URL"
}
```

**Response:**
```json
{
  "result": "generated flashcards in pipe-separated format"
}
```

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Add environment variables in the Vercel dashboard
3. Deploy automatically with git push

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Contact support through the app interface

---

**Happy Learning! 🎓**
