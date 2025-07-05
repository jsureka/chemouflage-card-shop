# Chemouflage Card Shop - System Architecture

## Overview
This document provides a comprehensive architectural overview of the Chemouflage Card Shop application, including deployment infrastructure, data flow, and component interactions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                AWS LIGHTSAIL                                    │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐   │
│  │   NGINX PROXY   │────▶│    FRONTEND      │     │      CERTBOT SSL        │   │
│  │   Port: 80/443  │     │  (React + Vite)  │     │   (Let's Encrypt)       │   │
│  │                 │     │   Port: 3000→80  │     │                         │   │
│  └─────────────────┘     └──────────────────┘     └─────────────────────────┘   │
│           │                        │                           │                │
│           ▼                        ▼                           ▼                │
│  ┌─────────────────────────────────────────────────────────────────────────────┐ │
│  │                        DOCKER BRIDGE NETWORK                               │ │
│  │                        (chemouflage-network)                               │ │
│  └─────────────────────────────────────────────────────────────────────────────┘ │
│           │                        │                           │                │
│           ▼                        ▼                           ▼                │
│  ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐   │
│  │   BACKEND API   │     │     MONGODB      │     │        REDIS            │   │
│  │   (FastAPI)     │────▶│   Database       │     │      Cache/Session      │   │
│  │   Port: 8000    │     │   Port: 27017    │     │      Port: 6379         │   │
│  └─────────────────┘     └──────────────────┘     └─────────────────────────┘   │
│           │                        │                           │                │
│           ▼                        ▼                           ▼                │
│  ┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────────┐   │
│  │   PERSISTENT    │     │   PERSISTENT     │     │    PERSISTENT           │   │
│  │   VOLUMES       │     │   VOLUMES        │     │    VOLUMES              │   │
│  │   (app.log)     │     │   (mongodb_data) │     │    (redis_data)         │   │
│  └─────────────────┘     └──────────────────┘     └─────────────────────────┘   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend (React + TypeScript + Vite)
```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │    UI LAYER     │    │   STATE MGMT    │    │  ROUTING     │ │
│  │                 │    │                 │    │              │ │
│  │ • shadcn/ui     │    │ • React Context │    │ • React      │ │
│  │ • Tailwind CSS  │    │ • TanStack      │    │   Router     │ │
│  │ • Radix UI      │    │   Query         │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                        │                     │      │
│           ▼                        ▼                     ▼      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    BUSINESS LOGIC                           │ │
│  │                                                             │ │
│  │ • Authentication (Firebase)    • Product Management        │ │
│  │ • Order Management             • Payment Processing        │ │
│  │ • Image Upload (Cloudinary)    • Quiz System              │ │
│  │ • Theme Management             • Analytics (GTM)           │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    API INTEGRATION                          │ │
│  │                                                             │ │
│  │ • Backend API calls            • Firebase Auth             │ │
│  │ • Cloudinary Integration       • Error Handling            │ │
│  │ • Payment Gateway (AamarPay)   • Loading States            │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Backend (FastAPI + Python)
```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   API LAYER     │    │   MIDDLEWARE    │    │  SECURITY    │ │
│  │                 │    │                 │    │              │ │
│  │ • FastAPI       │    │ • CORS          │    │ • Firebase   │ │
│  │ • Pydantic      │    │ • Rate Limiting │    │   Auth       │ │
│  │ • OpenAPI/Swagger│   │ • Logging       │    │ • JWT Tokens │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                        │                     │      │
│           ▼                        ▼                     ▼      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    BUSINESS LOGIC                           │ │
│  │                                                             │ │
│  │ • User Management              • Order Processing          │ │
│  │ • Product CRUD                 • Payment Integration       │ │
│  │ • Quiz Management              • Email Services            │ │
│  │ • Premium Code System          • Cache Management          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│           │                                                     │
│           ▼                                                     │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    DATA ACCESS LAYER                        │ │
│  │                                                             │ │
│  │ • MongoDB (Motor)              • Redis (async)             │ │
│  │ • Repository Pattern           • Caching Strategies        │ │
│  │ • Database Migrations          • Connection Pooling        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

### User Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Frontend   │    │  Backend    │    │  Firebase   │
│  (Browser)  │    │ (React App) │    │  (FastAPI)  │    │    Auth     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Login Request │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Firebase Auth │                  │
       │                  ├─────────────────────────────────────▶│
       │                  │                  │ 3. Verify Token  │
       │                  │ 4. ID Token      │◀─────────────────┤
       │                  │◀─────────────────┤                  │
       │                  │ 5. API Request   │                  │
       │                  │   + ID Token     │                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 6. Validate      │
       │                  │                  ├─────────────────▶│
       │                  │ 7. API Response  │ 7. Valid User    │
       │ 8. UI Update     │◀─────────────────┤◀─────────────────┤
       │◀─────────────────┤                  │                  │
```

### Order Processing Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │  Backend    │    │   MongoDB   │    │  AamarPay   │
│  (Frontend) │    │  (FastAPI)  │    │  Database   │    │  Gateway    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Create Order  │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Save Order    │                  │
       │                  ├─────────────────▶│                  │
       │                  │ 3. Order Created │                  │
       │                  │◀─────────────────┤                  │
       │                  │ 4. Payment Init  │                  │
       │                  ├─────────────────────────────────────▶│
       │ 5. Payment URL   │ 5. Payment URL   │                  │
       │◀─────────────────┤◀─────────────────────────────────────┤
       │ 6. Payment Page  │                  │                  │
       ├─────────────────────────────────────────────────────────▶│
       │                  │ 7. Payment Status │                 │
       │                  │◀─────────────────────────────────────┤
       │                  │ 8. Update Order  │                  │
       │                  ├─────────────────▶│                  │
       │ 9. Order Status  │                  │                  │
       │◀─────────────────┤                  │                  │
```

## Database Schema Overview

### MongoDB Collections
```
┌─────────────────────────────────────────────────────────────────┐
│                        MONGODB SCHEMA                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │     USERS       │    │    PRODUCTS     │    │    ORDERS    │ │
│  │                 │    │                 │    │              │ │
│  │ • _id           │    │ • _id           │    │ • _id        │ │
│  │ • email         │    │ • name          │    │ • user_id    │ │
│  │ • firebase_uid  │    │ • description   │    │ • products   │ │
│  │ • role          │    │ • price         │    │ • total      │ │
│  │ • created_at    │    │ • category      │    │ • status     │ │
│  │ • updated_at    │    │ • images        │    │ • payment_id │ │
│  └─────────────────┘    │ • is_active     │    │ • created_at │ │
│                         │ • created_at    │    └──────────────┘ │
│  ┌─────────────────┐    └─────────────────┘    ┌──────────────┐ │
│  │ PREMIUM_CODES   │                           │ QUIZ_TOPICS  │ │
│  │                 │    ┌─────────────────┐    │              │ │
│  │ • _id           │    │ QUIZ_QUESTIONS  │    │ • _id        │ │
│  │ • code          │    │                 │    │ • name       │ │
│  │ • is_used       │    │ • _id           │    │ • is_active  │ │
│  │ • used_by       │    │ • question      │    │ • created_at │ │
│  │ • created_at    │    │ • options       │    └──────────────┘ │
│  └─────────────────┘    │ • correct_answer│                     │
│                         │ • topic_id      │    ┌──────────────┐ │
│  ┌─────────────────┐    │ • difficulty    │    │   SETTINGS   │ │
│  │ QUIZ_ATTEMPTS   │    │ • is_active     │    │              │ │
│  │                 │    └─────────────────┘    │ • _id        │ │
│  │ • _id           │                           │ • key        │ │
│  │ • user_id       │                           │ • value      │ │
│  │ • topic_id      │                           │ • updated_at │ │
│  │ • score         │                           └──────────────┘ │
│  │ • total_questions│                                            │
│  │ • completed_at  │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Redis Cache Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                        REDIS CACHE LAYERS                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SESSION CACHE                            │ │
│  │                     TTL: 3600s                              │ │
│  │                                                             │ │
│  │ • user_sessions:<user_id>     • auth_tokens:<token_hash>    │ │
│  │ • rate_limit:<ip>:<endpoint>  • password_reset:<email>      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    PRODUCT CACHE                            │ │
│  │                     TTL: 600s                               │ │
│  │                                                             │ │
│  │ • products:all               • products:category:<cat>      │ │
│  │ • products:featured          • products:active              │ │
│  │ • products:by_id:<id>        • products:search:<query>      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    QUIZ CACHE                               │ │
│  │                     TTL: 300s                               │ │
│  │                                                             │ │
│  │ • quiz:topics                • quiz:questions:<topic_id>    │ │
│  │ • quiz:leaderboard:<topic>   • quiz:user_stats:<user_id>    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

### CI/CD Pipeline
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   GitHub    │    │   GitHub    │    │ AWS Lightsail│   │ Production  │
│ Repository  │    │   Actions   │    │   Server     │   │ Application │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       │                  │                  │                  │
       │ 1. Push to main  │                  │                  │
       ├─────────────────▶│                  │                  │
       │                  │ 2. Build & Test  │                  │
       │                  ├─────────────────▶│                  │
       │                  │ 3. Deploy via SSH│                  │
       │                  ├─────────────────▶│                  │
       │                  │                  │ 4. Pull & Build  │
       │                  │                  ├─────────────────▶│
       │                  │                  │ 5. Health Check  │
       │                  │ 6. Status Report │◀─────────────────┤
       │                  │◀─────────────────┤                  │
       │ 7. Notification  │                  │                  │
       │◀─────────────────┤                  │                  │
```

### Container Orchestration
```
┌─────────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE SERVICES                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │   FRONTEND      │    │    BACKEND      │    │   MONGODB    │ │
│  │                 │    │                 │    │              │ │
│  │ Image: nginx    │    │ Image: python   │    │ Image: mongo │ │
│  │ Port: 3000:80   │    │ Port: 8000      │    │ Port: 27017  │ │
│  │                 │    │                 │    │              │ │
│  │ Health: /health │    │ Health: /health │    │ Health: ping │ │
│  │ Restart: unless │    │ Restart: unless │    │ Restart:     │ │
│  │          stopped│    │          stopped│    │   unless     │ │
│  └─────────────────┘    └─────────────────┘    │   stopped    │ │
│           │                        │           └──────────────┘ │
│           ▼                        ▼                     │      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    SHARED NETWORK                           │ │
│  │                 (chemouflage-network)                      │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                  │
│  ┌─────────────────┐         ▼                ┌──────────────┐  │
│  │     REDIS       │    ┌──────────────┐     │   VOLUMES    │  │
│  │                 │    │   NGINX      │     │              │  │
│  │ Image: redis    │    │   PROXY      │     │ • mongodb    │  │
│  │ Port: 6379      │    │              │     │ • redis      │  │
│  │                 │    │ SSL/TLS      │     │ • logs       │  │
│  │ Health: ping    │    │ Port: 80/443 │     └──────────────┘  │
│  │ Restart: unless │    │              │                       │
│  │          stopped│    └──────────────┘                       │
│  └─────────────────┘                                           │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

### Security Layers
```
┌─────────────────────────────────────────────────────────────────┐
│                        SECURITY LAYERS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   NETWORK SECURITY                          │ │
│  │                                                             │ │
│  │ • UFW Firewall (SSH, HTTP, HTTPS only)                     │ │
│  │ • SSL/TLS Encryption (Let's Encrypt)                       │ │
│  │ • NGINX Security Headers                                   │ │
│  │ • Rate Limiting (60 req/min, 1000 req/hour)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 APPLICATION SECURITY                        │ │
│  │                                                             │ │
│  │ • Firebase Authentication                                   │ │
│  │ • JWT Token Validation                                     │ │
│  │ • CORS Policy                                              │ │
│  │ • Input Validation (Pydantic)                              │ │
│  │ • SQL Injection Prevention (MongoDB ODM)                   │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DATA SECURITY                             │ │
│  │                                                             │ │
│  │ • Password Hashing (bcrypt)                                │ │
│  │ • Database Authentication                                   │ │
│  │ • Redis Password Protection                                │ │
│  │ • Environment Variable Encryption                          │ │
│  │ • Secret Management                                        │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Monitoring & Observability

### Health Check System
```
┌─────────────────────────────────────────────────────────────────┐
│                      HEALTH CHECK MATRIX                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Component     │ Endpoint/Method    │ Frequency │ Timeout      │ │
│  ──────────────│───────────────────│───────────│──────────────│ │
│  Frontend      │ GET /health        │ 30s       │ 10s          │ │
│  Backend API   │ GET /health        │ 30s       │ 10s          │ │
│  MongoDB       │ db.adminCommand    │ 30s       │ 10s          │ │
│  Redis         │ PING command       │ 10s       │ 10s          │ │
│  System        │ Custom script      │ 30m       │ 30s          │ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    LOG AGGREGATION                          │ │
│  │                                                             │ │
│  │ • Application logs: /var/log/chemouflage/                  │ │
│  │ • Docker logs: json-file driver (10MB max, 3 files)        │ │
│  │ • System logs: journalctl                                  │ │
│  │ • Automated log rotation                                   │ │
│  │ • Centralized error tracking                               │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Performance Optimization

### Caching Strategy
```
┌─────────────────────────────────────────────────────────────────┐
│                      CACHING STRATEGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    CLIENT SIDE                              │ │
│  │                                                             │ │
│  │ • Browser Cache (Static Assets)                            │ │
│  │ • React Query Cache (API Responses)                        │ │
│  │ • Local Storage (User Preferences)                         │ │
│  │ • Service Worker (PWA Features)                            │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   APPLICATION SIDE                          │ │
│  │                                                             │ │
│  │ • Redis Cache (Session Data, Products, Quiz Data)          │ │
│  │ • MongoDB Indexes (Optimized Queries)                      │ │
│  │ • Connection Pooling (Database & Redis)                    │ │
│  │ • Background Tasks (Email, Image Processing)               │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   INFRASTRUCTURE                            │ │
│  │                                                             │ │
│  │ • NGINX Static File Caching                                │ │
│  │ • GZIP Compression                                         │ │
│  │ • CDN for Static Assets (Cloudinary)                       │ │
│  │ • Database Query Optimization                              │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Backup & Recovery

### Backup Architecture
```
┌─────────────────────────────────────────────────────────────────┐
│                       BACKUP STRATEGY                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    AUTOMATED BACKUPS                        │ │
│  │                                                             │ │
│  │ • MongoDB Dump (Daily at 2 AM)                             │ │
│  │ • Redis Snapshot (Daily at 2 AM)                           │ │
│  │ • Application Logs (Rotated Weekly)                        │ │
│  │ • Configuration Files (On Change)                          │ │
│  │ • Retention: 7 Days Local Storage                          │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    RECOVERY PROCEDURES                      │ │
│  │                                                             │ │
│  │ • Database Restore from Backup                             │ │
│  │ • Container Recreation from Images                         │ │
│  │ • Configuration Restoration                                │ │
│  │ • Health Check Verification                                │ │
│  │ • Service Endpoint Testing                                 │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Third-Party Integrations

### External Services
```
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL INTEGRATIONS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │    FIREBASE     │    │   CLOUDINARY    │    │  AAMARPAY    │ │
│  │                 │    │                 │    │              │ │
│  │ • Authentication│    │ • Image Storage │    │ • Payment    │ │
│  │ • User Management│   │ • Image CDN     │    │   Gateway    │ │
│  │ • Google/FB Auth│    │ • Optimization  │    │ • Sandbox    │ │
│  │ • Token Validation│  │ • Transformations│   │ • Webhooks   │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│           │                        │                     │      │
│           ▼                        ▼                     ▼      │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   INTEGRATION LAYER                         │ │
│  │                                                             │ │
│  │ • API Key Management           • Error Handling             │ │
│  │ • Rate Limit Compliance        • Retry Logic               │ │
│  │ • Data Transformation          • Webhook Processing        │ │
│  │ • Security Best Practices      • Monitoring & Alerts       │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                   │                             │
│  ┌─────────────────┐              ▼               ┌──────────────┐ │
│  │ EMAIL SERVICE   │    ┌─────────────────┐       │ ANALYTICS    │ │
│  │                 │    │   API GATEWAY   │       │              │ │
│  │ • SMTP Server   │    │                 │       │ • Google     │ │
│  │ • Email Templates│   │ • Rate Limiting │       │   Tag Mgr    │ │
│  │ • Delivery Status│   │ • Authentication│       │ • Event      │ │
│  │ • Bounce Handling│   │ • Load Balancing│       │   Tracking   │ │
│  └─────────────────┘    └─────────────────┘       └──────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Infrastructure Requirements

### AWS Lightsail Specifications
```
┌─────────────────────────────────────────────────────────────────┐
│                    INFRASTRUCTURE SPECS                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Minimum Requirements:                                          │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • CPU: 2 vCPUs                                             │ │
│  │ • RAM: 2 GB                                                │ │
│  │ • Storage: 40 GB SSD                                       │ │
│  │ • Network: 3 TB Transfer                                   │ │
│  │ • OS: Ubuntu 22.04 LTS                                     │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Recommended Production:                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • CPU: 4 vCPUs                                             │ │
│  │ • RAM: 4 GB                                                │ │
│  │ • Storage: 80 GB SSD                                       │ │
│  │ • Network: 5 TB Transfer                                   │ │
│  │ • Load Balancer: Optional                                  │ │
│  └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Scaling Considerations:                                        │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ • Monitor resource usage with built-in scripts             │ │
│  │ • Scale vertically first (upgrade instance size)           │ │
│  │ • Consider load balancer for horizontal scaling            │ │
│  │ • Database optimization before scaling infrastructure      │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Development & Production Environments

### Environment Configuration
```
┌─────────────────────────────────────────────────────────────────┐
│                    ENVIRONMENT MATRIX                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Component         │ Development        │ Production           │ │
│  ──────────────────│───────────────────│─────────────────────│ │
│  Frontend Build    │ npm run dev        │ npm run build        │ │
│  Backend Server    │ uvicorn --reload   │ gunicorn + uvicorn   │ │
│  Database          │ Local MongoDB      │ Docker MongoDB       │ │
│  Cache             │ Local Redis        │ Docker Redis         │ │
│  SSL/TLS           │ Self-signed        │ Let's Encrypt        │ │
│  CORS Origins      │ localhost:*        │ Domain-specific      │ │
│  Log Level         │ DEBUG              │ INFO                 │ │
│  Hot Reload        │ Enabled            │ Disabled             │ │
│  Debug Mode        │ Enabled            │ Disabled             │ │
│  Payment Gateway   │ Sandbox            │ Production           │ │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                   DEPLOYMENT PIPELINE                       │ │
│  │                                                             │ │
│  │ Development → Feature Branch → Pull Request → Main Branch  │ │
│  │      ↓              ↓              ↓            ↓           │ │
│  │ Local Testing → CI Tests → Code Review → Auto Deploy       │ │
│  │                                                             │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Context + TanStack Query
- **Routing**: React Router
- **Authentication**: Firebase Auth
- **Image Management**: Cloudinary
- **Analytics**: Google Tag Manager

### Backend Stack
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB with Motor (async driver)
- **Cache**: Redis with async support
- **Authentication**: Firebase Admin SDK + JWT
- **Email**: FastAPI-Mail
- **Payment**: AamarPay Gateway
- **Image Processing**: Cloudinary Python SDK
- **API Documentation**: OpenAPI/Swagger

### Infrastructure Stack
- **Hosting**: AWS Lightsail
- **Containerization**: Docker + Docker Compose
- **Web Server**: NGINX (reverse proxy + static files)
- **SSL/TLS**: Let's Encrypt (Certbot)
- **CI/CD**: GitHub Actions
- **Monitoring**: Custom health checks + system monitoring
- **Backup**: Automated MongoDB + Redis backups

This architecture provides a scalable, secure, and maintainable e-commerce platform with integrated quiz functionality and comprehensive monitoring capabilities.
