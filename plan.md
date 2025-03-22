# Database Schema Outline for School Question & Chat Application

## Overview

This schema is designed for a non-relational database (such as DynamoDB) to support a multi-school educational application. It includes:

- Multiple schools
- Teachers and students belonging to schools
- Question rooms within each school
- Questions submitted by students in question rooms
- Conversation messages between AI, students, and teachers for each question

Message storage uses **GSI-based indexing** to allow chatroom-wide message queries without duplicating records.

---

## Entity Structure and Keys

### 1. **School Entity**

- **PK**: `SCHOOL#<schoolId>`
- **SK**: `METADATA`
- **Attributes**:
  - `name`: School name
  - `address`: School address
  - `createdAt`: Timestamp of creation

**Example:**

```json
{
  "PK": "SCHOOL#school123",
  "SK": "METADATA",
  "name": "Greenwood High",
  "address": "1234 Main St, City",
  "createdAt": "2025-01-01T12:00:00Z"
}
```

---

### 2. **Teacher Entity**

- **PK**: `SCHOOL#<schoolId>`
- **SK**: `TEACHER#<teacherId>`
- **Attributes**:
  - `teacherId`: Unique teacher identifier
  - `name`: Teacher's name
  - `subject`: Subject taught
  - `email`: Contact email

**Example:**

```json
{
  "PK": "SCHOOL#school123",
  "SK": "TEACHER#teacher789",
  "teacherId": "teacher789",
  "name": "Ms. Johnson",
  "subject": "Mathematics",
  "email": "johnson@greenwood.edu"
}
```

---

### 3. **Student Entity**

- **PK**: `SCHOOL#<schoolId>`
- **SK**: `STUDENT#<studentId>`
- **Attributes**:
  - `studentId`: Unique student identifier
  - `name`: Student's name
  - `grade`: Grade level
  - `email`: Contact email

**Example:**

```json
{
  "PK": "SCHOOL#school123",
  "SK": "STUDENT#student456",
  "studentId": "student456",
  "name": "Alex Brown",
  "grade": "10",
  "email": "alex.brown@student.com"
}
```

---

### 4. **Question Room Entity**

- **PK**: `SCHOOL#<schoolId>`
- **SK**: `QUESTIONROOM#<questionRoomId>`
- **Attributes**:
  - `questionRoomId`: Unique question room identifier
  - `title`: Title or subject of the room
  - `createdAt`: Creation timestamp
  - `createdByTeacherId`: The teacher who created the question room

**Example:**

```json
{
  "PK": "SCHOOL#school123",
  "SK": "QUESTIONROOM#room001",
  "questionRoomId": "room001",
  "title": "Algebra Q&A",
  "createdAt": "2025-02-10T08:30:00Z",
  "createdByTeacherId": "teacher789"
}
```

Additionally, to relate teachers to chatrooms they created, we add a secondary GSI entry:

- **GSI2PK**: `TEACHER#<teacherId>`
- **GSI2SK**: `QUESTIONROOM#<questionRoomId>`

This allows queries for all question rooms created by a teacher.

---

### 5. **Question Entity**

- **PK**: `QUESTIONROOM#<questionRoomId>`
- **SK**: `QUESTION#<timestamp>#<questionId>`
- **Attributes**:
  - `questionId`: Unique question identifier
  - `studentId`: ID of the student who asked the question
  - `text`: The question text
  - `status`: `pending`, `resolved`, or `escalated`
  - `createdAt`: Timestamp of creation

**Example:**

```json
{
  "PK": "QUESTIONROOM#room001",
  "SK": "QUESTION#2025-02-10T09:00:00Z#qstn101",
  "questionId": "qstn101",
  "studentId": "student456",
  "text": "What is the quadratic formula?",
  "status": "pending",
  "createdAt": "2025-02-10T09:00:00Z"
}
```

---

### 6. **Conversation Message Entity (Option B — GSI-based)**

- **PK**: `QUESTION#<questionId>`
- **SK**: `MESSAGE#<timestamp>#<messageId>`
- **Attributes**:
  - `messageId`: Unique message identifier
  - `sender`: `AI`, `student`, or `teacher`
  - `text`: Message content
  - `timestamp`: Time sent
  - `GSI1PK`: `CHATROOM#<schoolId>#<questionRoomId>`
  - `GSI1SK`: `MESSAGE#<timestamp>#<messageId>`

**Example:**

```json
{
  "PK": "QUESTION#qstn101",
  "SK": "MESSAGE#2025-02-10T09:05:00Z#msg201",
  "messageId": "msg201",
  "sender": "AI",
  "text": "The quadratic formula is x = (-b ± √(b²-4ac))/(2a).",
  "timestamp": "2025-02-10T09:05:00Z",
  "GSI1PK": "CHATROOM#school123#room001",
  "GSI1SK": "MESSAGE#2025-02-10T09:05:00Z#msg201"
}
```

---

## Common Query Patterns

### School-Level:

- Fetch school metadata
- List teachers and students for a school
- List all question rooms in a school

### Teacher-Level:

- Query all question rooms created by a teacher using `GSI2PK = TEACHER#<teacherId>`

### Question Room-Level:

- Get question room metadata
- List all questions (ordered by creation time)
- Paginate through question history

### Question-Level:

- Fetch single question metadata
- Get conversation history (messages) sorted by timestamp

### Chatroom-Wide Messages (via GSI):

- Query all messages in a chatroom by `GSI1PK = CHATROOM#<schoolId>#<roomId>`
- Order by `GSI1SK` ascending/descending for pagination

## Visual Hierarchy Summary

```
SCHOOL#<schoolId>
 ├─ TEACHER#<teacherId>
 ├─ STUDENT#<studentId>
 └─ QUESTIONROOM#<questionRoomId> (GSI2 entry for teacher)
      └─ QUESTION#<timestamp>#<questionId>
          └─ MESSAGE#<timestamp>#<messageId> (GSI indexed)
```
