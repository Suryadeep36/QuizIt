# QuizIt

[![Frontend: React](https://img.shields.io/badge/Frontend-React_19-blue?logo=react)](https://react.dev/)
[![Backend: Spring Boot](https://img.shields.io/badge/Backend-Spring_Boot-green?logo=springboot)](https://spring.io/projects/spring-boot)
[![Database: PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)](https://www.postgresql.org/)
[![Caching: Redis](https://img.shields.io/badge/Caching-Redis-red?logo=redis)](https://redis.io/)

**QuizIt** is a secure, highly customizable quiz and examination platform tailored for colleges, institutions, and live events. Whether you need a strict, proctored environment for serious academic examinations or a lively, host-controlled interactive quiz, QuizIt handles it effortlessly.

---

## Core Features

### Exam Mode (Institutional Testing)
Designed for serious examinations with strict access control and anti-cheat mechanisms.
* **Access Control:** Invite-only access via email registration (manual or Excel upload).
* **Randomization:** Randomized question order and MCQ option shuffling per participant.
* **Advanced Timing:** Individual timers for specific questions alongside a global exam timer. 
* **CBT-Style Interface:** A JEE-style Computer-Based Test experience. Participants can navigate freely, select/unselect answers, and "Mark for Review."
* **Anti-Cheat Mechanics:** Tracks and flags tab switches or window unfocus events to administrators.
* **Automated Submissions:** Auto-submits the exam when the time limit is reached.
* **Result Management:** Admins can publish results immediately or hold them for manual release.

### Interactive Mode (Live Events)
A real-time, Slido-style interactive quiz designed for live audiences.
* **Frictionless Entry:** No accounts required. Participants join via a shared link or QR code using just their name.
* **Host-Controlled:** The admin controls the pace of the quiz, displaying the same question to all participants simultaneously.
* **Real-time Sync:** Live dashboard for admins to see participant activity and submissions as they happen.

### Comprehensive Question Management
Create diverse assessments with multiple question formats and importing methods.
* **Question Types:** Multiple Choice (MCQ), Multiple Select, Numeric, Short Answer, and Match the Following.
* **Media Support:** Attach images to any question to enhance context.
* **Smart Imports (3 Ways to Add):**
  1. **Manual:** Build questions directly in the platform.
  2. **Google Forms Integration:** Import questions directly from Google Forms (requires Google OAuth permission).
  3. **AI Generation:** Provide a quick prompt and let AI generate a customized question set for you.

### Deep Analytics & Leaderboards
* **Global Leaderboards:** Ranks participants by score and total time taken.
* **Participant Analytics:** Detailed breakdowns of individual performance.
* **Question Analytics:** Insights into the hardest/easiest questions, fastest answer times, and average correct rates.

---

## Technology Stack

### Frontend
* **Core:** React 19, React Router v7, React DOM
* **Styling & UI:** Tailwind CSS v4, Material UI (MUI), Emotion, Framer Motion, Lucide React
* **State Management:** Zustand
* **WebSockets / Real-time:** Socket.io-client, SockJS-client, StompJS
* **Utilities:** Axios, React Hot Toast, QRCode.react, XLSX (for Excel processing)

### Backend
* **Core:** Java, Spring Boot 3.x
* **Security:** Spring Security, OAuth2 Client, JWT (JSON Web Tokens)
* **Data Access:** Spring Data JPA, PostgreSQL (Supabase)
* **Caching & Real-time:** Spring Data Redis, Spring WebSockets
* **Email:** Spring Boot Starter Mail (JavaMailSender)
* **Utilities:** ModelMapper, Jackson Databind, Lombok

### Infrastructure & Deployment
* **Frontend Hosting:** Vercel
* **Backend Hosting:** Render (Temporary) / AWS EC2
* **Database:** Supabase (PostgreSQL)
* **Cache:** RedisCloud
* **SMTP:** Gmail SMTP (Temp for Dev) -> Production Email Service planned

---

## Workflows

### 1. Setting up an Exam
1. **Create & Configure:** Admin creates a quiz, selects "Exam Mode," and defines the exam window (Start/End time).
2. **Import Roster:** Admin uploads candidate emails via Excel or adds them manually.
3. **Registration Phase:** Admin sends a registration email blast. Candidates click the link, register their First Name, Last Name, and Date of Birth (DOB). Status updates to *Registered*.
4. **Invite Phase:** Admin sends the final exam invite links.
5. **Execution:** Candidates use their DOB to authenticate and start the quiz within the allowed window.
6. **Completion:** Exams are auto-submitted when time runs out. Admin releases results and views analytics.

### 2. Setting up an Interactive Quiz
1. **Create & Configure:** Admin creates a quiz, selects "Interactive Mode," and sets a start/end time.
2. **Go Live:** Admin adds questions and clicks "Start Quiz." 
3. **Audience Join:** Admin displays the generated QR code or shares the link. Users join instantly by entering their name.
4. **Live Execution:** Admin pushes questions to the audience's screens in real-time, monitoring live participation.
5. **Completion:** Results and leaderboards are generated immediately after the final question.
