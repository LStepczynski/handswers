# Handswers

**Handswers** is a conceptual AI-powered education platform where teachers create topic-based question rooms, and students engage in threaded conversations guided by a Socratic AI tutor. The app is designed to save teachers time by offloading repeated student questions while encouraging critical thinking and self-directed learning through natural dialogue.

> ⚠️ This is a **portfolio project** built to demonstrate full-stack development, AI integration, and UI/UX design. It is not a real service or affiliated with any school district or institution.

# 🧠 Functionality & Step-by-Step Tutorial

Handswers is an interactive educational web app where teachers and students engage in structured, AI-supported conversations through "question rooms." These rooms help offload repeated student questions and guide learners using a Socratic AI assistant built with the Gemini API.

Below is a walkthrough of what users can do in the app and how each step works in practice.

---

### 👩‍🏫 Step 1: Teachers Create a Room

- Teachers log in using their Google Workspace account.
- From the dashboard, they click "Create Room" to instantly generate a new question room.
- Each room is uniquely identified and can be shared with students via a room code.

**Purpose**: Organize student questions efficiently and give them a structured place to ask for help.

---

### 👨‍🎓 Step 2: Students Join the Room

- Students log in with their own accounts to access the platform.
- They join rooms using a code  from their teacher.
- Once inside, they can begin submitting questions to the teacher and receive help from the AI.

**Purpose**: Ensure secure participation and enable student access to guided help in the correct room.

---

### ❓ Step 3: Students Ask Questions

- Students type in their questions — anything from "What’s a dependent variable?" to "Why did WWII start?"
- Each question becomes a dedicated thread, tracked under the active room.

**Purpose**: Keep conversations clean and organized while giving every student their own space to explore a topic.

---

### 🤖 Step 4: AI Responds with Socratic Prompts

- The AI (powered by Gemini) responds using open-ended, guiding questions that stimulate critical thinking.
- Instead of giving direct answers, it helps students work through problems logically and reflectively.
- If a student isn't satisfied with the AI's guidance, they can choose to request help from the teacher directly.

**Purpose**: Promote deeper understanding and give students options for both automated and human support.

---

### 🔁 Step 5: Continued Conversations

- Students can reply to the AI to continue the thread and dig deeper into the topic.
- Teachers can step in at any point to offer clarification, additional context, or direct instruction.

**Purpose**: Foster dynamic, multi-turn conversations that provide personalized support without overwhelming teachers.

---

### 📊 Step 6: Teachers Monitor Activity

- Teachers have access to an overview of rooms, questions, and active conversations.
- They can filter unanswered threads or close rooms when a topic is complete.

**Purpose**: Maintain visibility and control while allowing the AI to handle the initial load.

---

### 🧑‍💼 Admin Dashboard Access

- Admin accounts have access to a dedicated dashboard where they can manage the platform.
- They can create new schools and add teacher and student accounts as needed.

**Purpose**: Provide centralized control and onboarding for school-wide deployments.

# 🧰 Tech Stack

This section outlines the core technologies used in the Handswers project, broken down by frontend and backend.

---

### 🌐 Frontend
- **Framework**: React (via Vite)
- **Styling**: Tailwind CSS, shadcn/ui
- **Markdown/Math Rendering**: `react-markdown`, `remark-math`, `rehype-katex`, `katex`
- **Code Highlighting**: `react-syntax-highlighter`
- **Routing**: `react-router-dom`
- **Utilities**: `js-cookie`, `input-otp`, `lucide-react`
- **TypeScript & Dev Tools**: TypeScript, ESLint, Prettier, Vite

---

### 🛠️ Backend
- **Runtime**: Node.js with Express
- **AI Integration**: Gemini API via `@google/genai`
- **Auth**: Google OAuth via `google-auth-library`, JWT (`jsonwebtoken`)
- **Database**: DynamoDB with AWS SDK (`@aws-sdk/client-dynamodb`, `@aws-sdk/util-dynamodb`)
- **Environment**: `dotenv`, `serverless-dotenv-plugin`
- **Serverless Framework**: Deployed with Serverless, supports local dev with `serverless-offline`
- **Dev Tools**: TypeScript, Serverless Esbuild, `tsconfig-paths`, typed middleware and utilities

# 🚀 Getting Started

Follow the steps below to run the project locally. This project is divided into two parts: `frontend` (the client app) and `backend` (the API + database layer).

---

### 📀 Clone the Repository

```bash
git clone https://github.com/your-username/handswers.git
cd handswers
```

---

### 💻 Frontend Setup

Navigate to the frontend folder, install dependencies, and start the development server:

```bash
cd frontend
npm install
```

In the `frontend` folder, there is a `.env` file already committed to the repo. The only variable stored is `VITE_BACKEND_URL`, which you need to set to your backend URL, e.g.:

```env
VITE_BACKEND_URL=http://localhost:3000/dev
```

Then, run the development server:

```bash
npm run dev
```

This will launch the app on [http://localhost:5173](http://localhost:5173).

---

### 🛠️ Backend Setup

The backend handles API logic and manages the database using DynamoDB Local inside Docker.

```bash
cd backend
npm install
npm run docker         # Starts a local DynamoDB instance in Docker
npm run createTables   # Creates required DynamoDB tables
npm run createEnv      # Guides you to set up environment variables
npm run studio         # Opens a web UI for editing and previewing the DynamoDB state (Optional)
npm run dev            # Starts the local backend server
```

Once both servers are running, the frontend will communicate with the backend and database as expected.

---
