# SchoolOS — Frontend

> **The operating system for schools.** A Next.js web application providing the school management interface for administrators, teachers, parents, and students.

SchoolOS Frontend is a **white-label, multi-tenant** UI. The school name, logo, and icon are dynamically loaded from the API — nothing is hardcoded.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State | Zustand |
| API Client | Axios |
| Auth | JWT (Access + Refresh token rotation) |

---

## User Roles & Portals

| Role | Access |
|---|---|
| **Platform Super Admin** | `/platform-admin` — manages all schools, subscriptions |
| **School Super Admin** | Full school dashboard, settings, all modules |
| **School Admin** | Admissions, students, attendance, academics |
| **Teacher** | Attendance marking, marks entry, homework |
| **Accountant** | Fee collection, invoices, receipts, financial reports |
| **Receptionist** | Front office — visitors, calls, postal, enquiries |
| **Librarian** | Book catalog, issue/return |
| **Parent** | Child's attendance, marks, fees, homework |
| **Student** | Own timetable, homework, results, study material |

---

## Getting Started (Local Development)

### Prerequisites

- Node.js 18+
- npm or yarn
- SchoolOS Backend running at `http://localhost:3001`

### Setup

```bash
# Clone the repo
git clone https://github.com/cyberhive54/SchoolOS-frontend.git
cd SchoolOS-frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your backend URL
```

### Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Run

```bash
npm run dev
```

App will be available at `http://localhost:3000`.

---

## White-Label Design

SchoolOS Frontend has **zero hardcoded school identity**. On load, the app fetches school settings from the API and dynamically applies:

- School name (shown in header, page titles, documents)
- School logo (shown in sidebar, report cards, PDF receipts)
- School icon / Favicon
- Theme color (optional)

Schools configure all of this from their settings panel. When a new school is onboarded, they simply upload their logo and their branded portal is ready instantly.

---

## Key Pages

| Route | Description |
|---|---|
| `/login` | School login (dynamic branding) |
| `/dashboard` | Role-based dashboard |
| `/students` | Student management |
| `/attendance` | Daily attendance marking |
| `/fees` | Fee collection & invoices |
| `/academics` | Classes, subjects, timetables |
| `/exams` | Exam scheduling, marks, report cards |
| `/front-office` | Visitors, enquiries, calls |
| `/staff` | Staff management |
| `/communication` | Announcements, messages |
| `/settings` | School configuration (name, logo, academic year, fee structure) |
| `/platform-admin` | Platform super admin panel |

---

## Related Repositories

| Repo | Description |
|---|---|
| [SchoolOS-backend](https://github.com/cyberhive54/SchoolOS-backend) | NestJS API server |

---

## License

Proprietary. All rights reserved.
