# Multi-Tenant SaaS Engine 

> An enterprise-grade backend architecture demonstrating a zero-trust, multi-tenant database environment powered by PostgreSQL Row Level Security (RLS).

[![Deployment Status](https://img.shields.io/badge/Deployment-Vercel-success?style=flat-square)](https://multi-tenant-saas-engine.vercel.app/dashboard)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%28Supabase%29-blue?style=flat-square)](https://supabase.com/)
[![Security](https://img.shields.io/badge/Security-Row%20Level%20Security%20%28RLS%29-red?style=flat-square)](https://www.postgresql.org/docs/current/ddl-rls.html)

---

## 📋 Executive Summary
The **Multi-Tenant SaaS Engine** is a purpose-built database architecture showcasing a best-in-class backend layer. Engineered to handle secure, compartmentalized data for SaaS applications, this infrastructure guarantees strict tenant isolation at the database level, bypassing the vulnerabilities of traditional client-side filtering.

This asset was architected with a heavy bias toward data security, automated provisioning, and optimized server-side querying.

* **Live Dashboard:** [multi-tenant-saas-engine.vercel.app/dashboard](https://multi-tenant-saas-engine.vercel.app/dashboard)

---

## 🛠️ The Tech Stack

| Layer | Technology | Operational Purpose |
| :--- | :--- | :--- |
| **Database Engine** | `PostgreSQL (via Supabase)` | Scalable relational storage with native real-time and auth integrations. |
| **Security Architecture** | `Row Level Security (RLS) & Supabase Auth` | Perimeter and table-level data protection framework. |
| **Automation** | `Postgres PL/pgSQL Database Triggers` | Encapsulated server-side business logic and event automation. |
| **Application Layer** | `Next.js (Server Components)` | High-performance, edge-rendered consumer of backend services. |

---

## ⚙️ Core Infrastructure & Architectural Strategy

### 1. Zero-Trust Data Isolation (RLS)
* **Technology Implemented:** Advanced PostgreSQL Row Level Security policies tied to a `SECURITY DEFINER` context-wrapping function.
* **Business Value:** Data leaks destroy SaaS companies. By hard-coding security policies directly into the Postgres engine, it becomes mathematically impossible for a tenant to query or mutate another organization's data, regardless of frontend vulnerabilities or API flaws. 

### 2. Zero-Touch Onboarding Automation
* **Technology Implemented:** Postgres `AFTER INSERT` event triggers and PL/pgSQL functions.
* **Business Value:** Reduces server round-trips and mitigates race conditions during user signup. The database autonomously intercepts authentication events to provision tenant workspaces and map roles, keeping the frontend application layer lean and performant.

### 3. Server-Side Data Orchestration
* **Technology Implemented:** Next.js App Router (Server Components) and `@supabase/ssr`.
* **Business Value:** Fetches data entirely on the server edge, utilizing the underlying RLS policies to implicitly filter data without complex query logic. This eliminates client-side data exposure and drastically improves Time to First Byte (TTFB).

---

**Architected and maintained by [Yodsran Phiewpong](https://multi-tenant-saas-engine.vercel.app/dashboard).**
