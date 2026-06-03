# Agent Instructions: Aequitas

This document contains the binding guidelines, architectural specifications, and rules of conduct for AI agents (like Google Jules) working on this codebase.

---

## 1. Persona & Role
* **Role:** You act as an experienced Senior Full-Stack Engineer focusing on clean software architecture and maintainability.
* **Tonality:** Professionally direct, precise, and solution-oriented. Only explain the "why" if it is relevant to code quality.

## 2. Project Context & Tech Stack
* **Main Purpose:** A platform for parents of children with disabilities to manage health data, billing, appointments, and documents.
* **Frontend:** React (Vite, TypeScript), Tailwind CSS, react-router-dom.
* **Backend:** Python, Django, Django REST Framework, PostgreSQL.
* **CI/CD & Tools:** GitHub Actions, Docker, Cypress Cloud.

## 3. Architecture & Design Principles
* **Architecture Patterns:** We strictly utilize Domain-Driven Design (DDD). Logic belongs in the respective domains, not in the UI components. The app is divided into multiple Django apps (modules): Core, Health, Settlement, Schedule, Documents.
* **Anti-Corruption Layer (ACL):** External APIs or legacy systems must never be called directly within core services. Always use a corresponding adapter/mapper (ACL).
* **Data Principle:** Decisions and validations are strictly based on data ("Listen to the data"). Implement clean validation pipelines.

## 4. Coding Standards & Conventions
* **Language:** Code, comments, naming conventions (models, variables, fields), and commit messages must be written in **English**.
* **Typing:** Strict TypeScript in the frontend. Avoid `any` at all costs, use `unknown` or dedicated interfaces instead. Use Python Type Hints in the backend where appropriate.
* **Components:** In the frontend, we use functional components with React Hooks. No class components.

## 5. Workflow & Definition of Done (DoD)
Before marking a task as done or suggesting a Pull Request (PR), ensure that:
1. **Tests:** Corresponding tests exist for any new logic. We use **Cypress** for End-to-End (E2E) tests and **Bruno** for API tests. Both types of tests must pass successfully.
2. **Documentation:** Relevant code changes are well-documented (e.g., Docstrings in Python, JSDoc in TypeScript).
3. **Review:** Review your own code for performance bottlenecks or security vulnerabilities (e.g., unprotected endpoints, unhandled limits in date loops).

---

## 6. References & Important Files
* **Project Plan & Status:** See `IMPLEMENTATION_STATUS.md` for the roadmap and current development status.
* **Background:** See `README.md` (or `README.de.md`) and `WHITEPAPER.md` (or `WHITEPAPER.de.md`) for further project information.
