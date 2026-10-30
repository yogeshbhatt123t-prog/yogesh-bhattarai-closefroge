# FrogeClose: System Design & Technical Architecture Document

## 1. High-Level Architecture Diagram

```mermaid
graph TD
    Client[FrogeClose Minimalist Executive UI\nReact 19 + Tailwind v4]
    
    subgraph Edge & API Gateway
        Gateway[API Gateway\nRate Limiting & Tenant JWT Auth]
    end
    
    subgraph Agentic Orchestration Layer
        StateMachine[State Machine Engine\nPlan -> Gather -> Reconcile -> Analyze -> Draft -> Self-Critique -> Finalize]
        GeminiEngine[Gemini 3.8 Flash / Gemini 4 Argon\nStructured Tool Calling & Long Context]
        CodeSandbox[Deterministic Mathematical Sandbox\nMath Invariants & Tie-Out Checks]
    end

    subgraph Storage & Data Layer
        PostgreSQL[(PostgreSQL 16 with RLS\nTenant Isolation)]
        PgVector[(pgvector Extension\nASC 606 & Accounting Policies)]
        EncryptedS3[(Encrypted Object Storage\nS3 / GCS with SSE-KMS)]
        ImmutableAudit[(Cryptographic Audit Log\nSHA-256 Chained Hashes)]
    end

    subgraph Integrations & Ingestion
        StripeAPI[Stripe Webhooks & Payouts API]
        ERP[NetSuite / QuickBooks Online REST]
        BankConnect[Plaid / SVB Direct Statements]
        OCR[PDF Table Extractor / Vision Engine]
    end

    Client -->|HTTPS / SSE Stream| Gateway
    Gateway -->|Tenant Context (app.current_org_id)| StateMachine
    StateMachine <--> GeminiEngine
    StateMachine <--> CodeSandbox
    StateMachine -->|Policy Embedding Lookup| PgVector
    StateMachine -->|Relational State & Jobs| PostgreSQL
    StateMachine -->|Raw Invoices & CSVs| EncryptedS3
    StateMachine -->|Append-Only Tool Calls| ImmutableAudit
    
    IngestEngine[File Ingestion & Parsing] --> EncryptedS3
    OCR --> IngestEngine
    ERP --> IngestEngine
    StripeAPI --> IngestEngine
    BankConnect --> IngestEngine
```

---

## 2. PostgreSQL Schema with Row-Level Security (RLS)

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Organizations (Tenants)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) NOT NULL UNIQUE,
    arr_usd NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    fiscal_year_end VARCHAR(5) NOT NULL DEFAULT '12-31',
    accounting_basis VARCHAR(10) NOT NULL DEFAULT 'GAAP',
    pricing_tier VARCHAR(50) NOT NULL DEFAULT 'outcome_based',
    outcome_rate_per_close NUMERIC(10, 2) NOT NULL DEFAULT 1250.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Users with Roles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('controller', 'external_auditor', 'board_observer')),
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Close Jobs (State Machine Instances)
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    period VARCHAR(50) NOT NULL, -- e.g. '2026-Q3'
    status VARCHAR(50) NOT NULL CHECK (
        status IN ('idle', 'planning', 'gathering', 'reconciling', 'analyzing_variance', 'drafting_package', 'self_critiquing', 'completed', 'failed')
    ),
    outcome_score NUMERIC(5, 2) DEFAULT 0.00,
    screen_time_saved_hours NUMERIC(6, 2) DEFAULT 0.00,
    outcome_fee_usd NUMERIC(10, 2) DEFAULT 0.00,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 4. Job Steps (Deterministic Agent Steps & Tool Invocations)
CREATE TABLE job_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    step_number INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    state VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'warn')),
    duration_ms INT NOT NULL DEFAULT 0,
    tool_invocations JSONB NOT NULL DEFAULT '[]'::jsonb,
    reasoning TEXT,
    confidence_score NUMERIC(4, 3) NOT NULL DEFAULT 1.000,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Files & Uploaded Invoices (Encrypted S3 metadata)
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    s3_key VARCHAR(512) NOT NULL,
    sha256_checksum VARCHAR(64) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    pii_redacted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Immutable Audit Logs (Cryptographically Chained)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    job_id UUID REFERENCES jobs(id),
    actor_type VARCHAR(50) NOT NULL CHECK (actor_type IN ('agent', 'user', 'system')),
    action VARCHAR(100) NOT NULL,
    tool_called VARCHAR(100),
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    previous_hash VARCHAR(64),
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Knowledge Base with pgvector
CREATE TABLE knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation_jobs ON jobs
    USING (org_id = current_setting('app.current_org_id')::uuid);
```

---

## 3. Mathematical Invariant Verification Sandbox
- LLMs are probabilistic, but double-entry accounting is non-negotiably deterministic.
- Mathematical computations execute inside a deterministic sandbox:
  1. $\sum \text{Debits} \equiv \sum \text{Credits}$ across all journal entries.
  2. $\text{Suspense Account Ending Balance} = \$0.00$.
  3. $\text{Ending Retained Earnings} = \text{Beginning Retained Earnings} + \text{GAAP Net Income} - \text{Dividends}$.
  4. $\text{Ending Operating Cash} = \text{Bank Verified Depository Balance}$.
