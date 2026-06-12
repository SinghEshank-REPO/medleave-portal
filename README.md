# MedLeave Portal

An AI-powered Medical Leave Management and Attendance Condonation Portal for colleges and universities, fully compliant with the JUIT PS-08 condonation specifications.

This portal digitizes and automates the fragmented medical leave process: from student/proxy submissions, sequential health verification, warden sign-offs, and advisor approvals, to automated timetable mapping and one-click faculty condonations.

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide icons, Recharts (analytics)
- **Backend**: Node.js, Express, TypeScript, Multer, Prisma ORM
- **Database**: PostgreSQL (via Docker)
- **AI Engine**: OpenAI API (GPT-4o-mini Vision / Text OCR) with instant mock fallback
- **File Storage**: Cloudinary with instant local filesystem fallback

---

## Folder Structure

```
medleave-portal/
├── docker-compose.yml       # PostgreSQL & pgAdmin services config
├── README.md                # Project manuals & execution instructions
├── .env.example             # Template env config
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma    # Prisma PostgreSQL relational schema
│   │   └── seed.ts          # Comprehensive JUIT timetable & accounts seed
│   └── src/
│       ├── server.ts        # App runner
│       ├── app.ts           # Express routing and config entry
│       ├── config/          # Prisma database client & env setups
│       ├── middleware/      # JWT RBAC verification & Multer validation
│       ├── services/        # AI (OpenAI), Storage (Cloudinary), Timetable, and SLAs
│       ├── controllers/     # Auth, Leaves, Condonation, and Admin reports
│       └── routes/          # API route mappings
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts   # Glassmorphic colors & Dark mode
    └── src/
        ├── app/
        │   ├── globals.css  # Custom glass-panel / glass-card tokens
        │   ├── layout.tsx   # Google font & html tags
        │   ├── page.tsx     # Premium marketing hero landing page
        │   ├── login/       # Login controls with demo account cheat sheet
        │   ├── register/    # Selective dynamic signups by role
        │   ├── student/     # Student dashboards, apply forms, timelines
        │   ├── approver/    # Unified review queue for Med Officer, Warden, & Advisor
        │   ├── faculty/     # One-click class-level condonation requests
        │   └── admin/       # System metrics, Audit logs, and Repeat pattern referrals
        ├── components/      # Global navigation frames & notification bells
        └── lib/
            └── api.ts       # Central fetch client mapping endpoints
```

---

## JUIT PS-08 Business Rules & Flow

1. **Proxy Submission**: If a student is too ill to apply, parents/guardians can check the "Proxy Submission" box and supply their name and relationship.
2. **Sequential Approval Workflow**:
   - `Health Centre (Medical Officer)`: Evaluates the uploaded certificate. AI extracts OCR details (Diagnosis, Hospital, Doctor, Rest days) and checks names. Mismatches trigger a high-risk `SUSPICIOUS` flag.
   - `Hostel Warden` (Residential Students only): Welfare checks.
   - `Faculty Advisor / HOD`: Final leave approval.
3. **Approval Turnaround SLAs (Escalations)**:
   - Health Centre: 24 Hours
   - Hostel Warden: 24 Hours
   - Faculty Advisor: 48 Hours
   - If the deadline lapses, a single-window escalation trigger marks it `isEscalated` and alerts reviewers. A double-window lapse auto-forwards the leave to the next stage.
4. **Attendance Condonation Pipeline**:
   - On final leave approval, the system queries the student's section timetable (e.g. LECTURE vs LAB schedules) and generates targeted class absences (`MissedClass`).
   - Respective teaching faculty members receive alerts and can condone absences with a single click.
   - Student dashboards display **Raw Attendance** vs. **Condoned Attendance** percentages. If a student falls below 75% raw but condones enough classes, the portal highlights them as "Condoned to Safe."
5. **Repeat Leave Counseling Flags**: Students submitting more than 2 medical leave claims per semester are flagged in the Admin panel for counseling follow-ups.

---

## Setup & Running Locally

### Step 1: Clone and Configure Environment

1. Copy `.env.example` to `.env` in the root:
   ```bash
   cp .env.example .env
   ```
2. By default, `OPENAI_API_KEY`, `CLOUDINARY_CLOUD_NAME` are set to `mock`. This allows the application to be tested immediately without external accounts:
   - File uploads will save to `backend/uploads/` and serve statically.
   - AI OCR will run a simulated analyzer yielding realistic extractions and a 15% chance of triggering suspicion alerts (student name mismatches, altered font detections).

### Step 2: Spin Up PostgreSQL Database

Start the database container via Docker Compose:
```bash
docker-compose up -d
```
*Note: This launches PostgreSQL on port `5432` and pgAdmin (visual viewer) on port `5050` (`admin@medleave.com` / `adminpassword`).*

### Step 3: Run Database Migrations & Seeds

Navigate to the `backend` folder, apply Prisma migrations, and seed the JUIT sample data:
```bash
cd backend
npx prisma migrate dev --name init
npx prisma db seed
```
*This seeds: CSE and ECE departments, 5 core CSE courses, a section A1 timetable (Lectures/Tutorials/Labs), and a default set of users for testing.*

### Step 4: Launch the Services

1. **Start Backend Server** (port 5000):
   ```bash
   cd backend
   npm run dev
   ```
2. **Start Frontend Server** (port 3000):
   ```bash
   cd frontend
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## Testing / Evaluation Checklist

To evaluate the complete flow:
1. **Log in as Student** (`student@juit.ac.in` / `password123`):
   - Notice the raw vs. condoned attendance gauges.
   - Go to "Apply for Medical Leave", choose dates, select "Afternoon Only" on start date, check "Proxy", upload an image, and submit.
2. **Log in as Medical Officer** (`doctor@juit.ac.in` / `password123`):
   - View the verification queue.
   - Click "Review" on the student's request, examine the AI OCR side-by-side extracts, add remarks, and click "Approve".
3. **Log in as Hostel Warden** (`warden@juit.ac.in` / `password123`):
   - Open approvals, select the student, add remarks, and click "Approve".
4. **Log in as Faculty Advisor** (`advisor@juit.ac.in` / `password123`):
   - Access approvals and click "Approve" to complete the sequence.
5. **Log in as Teaching Faculty** (`prof.os@juit.ac.in` / `password123`):
   - Look at the condonations list, see the student's missed class on the date matching the timetable, and click "Condone Class".
6. **Log back in as Student**:
   - Confirm their attendance gauge has increased! Download the approved condonation slip.
7. **Log in as Admin** (`admin@juit.ac.in` / `password123`):
   - Verify the audit logs registry, check the repeat leave pattern flags, and click "Assess SLA Escalations" to simulate timeout checks.
