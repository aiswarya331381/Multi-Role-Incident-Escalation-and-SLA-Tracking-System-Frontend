# Incident Escalation & SLA Tracking System (Frontend)

## Project Overview

This project is a **React-based frontend application** that simulates an enterprise **Incident Escalation and SLA Tracking System**.
It allows users to create incidents, manage their lifecycle, track SLA deadlines, and automatically escalate incidents when deadlines are breached.

The system demonstrates **state-based workflow management**, **role-based permissions**, **SLA monitoring**, and **audit logging**.

---

## Features

### Role-Based Access

The system supports three roles:

* **Reporter**

  * Create incidents
  * View incidents

* **Resolver**

  * Accept assigned incidents
  * Change status to *In Progress*
  * Mark incidents as *Resolved*

* **Admin**

  * Assign incidents to resolvers
  * Close resolved incidents
  * Manually escalate incidents

---

### Incident Lifecycle

The incident status follows a strict workflow:

```
Open → Assigned → In Progress → Resolved → Closed
```

Additional state:

```
Escalated
```

Illegal transitions are prevented in the UI.

---

### SLA Tracking

Each incident has an SLA based on severity:

| Severity | SLA Time |
| -------- | -------- |
| Critical | 4 hours  |
| High     | 8 hours  |
| Medium   | 24 hours |
| Low      | 48 hours |

If the SLA deadline is exceeded, the system automatically escalates the incident.

---

### Escalation System

Escalation levels:

* Level 0 (Normal)
* Level 1
* Level 2 (Maximum)

Rules:

* Escalation level cannot exceed **2**
* When Level 2 is reached, the incident is automatically assigned to **Admin**

---

### Validation Rules

* Title must contain **at least 8 characters**
* Description must contain **at least 20 characters**
* Severity must be one of:

  * Low
  * Medium
  * High
  * Critical
* Resolution notes are required when:

  * Resolving an incident
  * Closing an incident

---

### Audit Log

Every status change creates an **audit record** including:

* Previous status
* New status
* User who performed the action
* Timestamp
* Reason (if provided)

This ensures **full traceability of incident actions**.

---

## Technology Stack

* React (Frontend)
* Vite (Development environment)
* CSS (Custom styling)

---

## How to Run the Project

Clone the repository and run the following commands:

```
npm install
npm run dev
```

Then open the local development URL displayed in the terminal.

---

## Project Structure

```
incident-ui
 ├── src
 │   ├── App.jsx
 │   ├── App.css
 │   └── main.jsx
 ├── index.html
 ├── package.json
 └── README.md
```

---

## Purpose of the Project

This project demonstrates:

* Frontend system design
* State management in React
* Workflow/state machine logic
* UI validation
* Role-based action control
* SLA-based automation
* Audit logging

---

## Author

Frontend implementation created as part of a **React-based incident management system prototype**.
