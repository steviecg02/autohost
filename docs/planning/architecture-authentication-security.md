# Authentication & Security Architecture

**Status**: Feature Specification - In Progress
**Created**: October 25, 2025
**Last Updated**: October 25, 2025
**Applies To**: All services (org-service, sync-airbnb, sync-hostaway, work-service, future services)
**Current Focus**: Building for solo use (Stephen), multi-tenant ready for future customers

---

## Product Vision: Why Authentication Matters

This platform is a **business operating system** that manages sensitive business data across multiple external services (Airbnb, Hostaway, pricing tools, financial data). Security is foundational, not optional.

**Key Requirements**:

1. **Multi-tenancy**: Multiple organizations use the platform, data must be completely isolated
2. **Role-based access**: Users have different permissions based on their role (owner, manager, analyst, AI agent)
3. **External integrations**: We authenticate TO external services (Airbnb cookies, Hostaway API keys)
4. **Service mesh**: Multiple internal services need to communicate securely
5. **User experience**: Seamless authentication - users log in once via Google OAuth

**Security Principles**:

- **Defense in depth**: Multiple layers of security
- **Zero trust**: Every request is authenticated and authorized
- **Least privilege**: Users/services only get access they need
- **Auditability**: All access is logged and traceable

---

## Authentication Patterns: Options & Roadmap

### Pattern 1: User-to-Backend Authentication (JWT)

**Use Case**: UI → org-service, UI → sync-airbnb, UI → work-service

**How It Works**:

1. User logs in via Google OAuth (handled by org-service)
2. org-service generates JWT token with user context
3. UI stores JWT in localStorage/sessionStorage
4. UI includes JWT in `Authorization: Bearer <token>` header on every request
5. Each backend service validates JWT signature and extracts user context

**Why JWT**:

- **Stateless**: No session storage needed, scales horizontally
- **Self-contained**: Token carries all user context (org_id, role_id, permissions)
- **Standard**: Industry-standard, works with all modern frameworks
- **Single sign-on**: One token works across all services

**Current Implementation**: ✅ Implementing Now (Phase 1)

**JWT Payload (Phase 1 - Minimal)**:

```json
{
  "sub": "user_id", // User identifier ('sub' is JWT standard for 'subject')
  "org_id": "uuid", // Organization (tenant) - CRITICAL for multi-tenancy
  "email": "user@example.com", // User email
  "is_owner": true, // Organization owner flag
  "exp": 1234567890 // Token expiration (Unix timestamp)
}
```

**Token TTL (Phase 1)**: 7 days - Good balance of security and UX for solo use

**On Expiration (Phase 1)**: User redirected to login page (no refresh token in Phase 1)

**Token Strategy (Phase 2 - Before Customers)**:

- **Access token**: 15 minutes (short-lived for security)
- **Refresh token**: 30 days (long-lived, stored securely)
- **Auto-refresh**: Background token renewal keeps user logged in
- **Why**: More secure for customer data - stolen access token only valid 15 minutes

**Future Fields** (will be added when features are built):

- `department_id`, `role_id` - When org structure is implemented
- `permissions` - When RBAC is implemented (Phase 2)
- `account_ids` - When multi-account access is needed (e.g., limit user to specific Airbnb/Hostaway accounts)
- `project_ids` - When project-based access control is implemented
- `user_type` - When AI agents or service accounts are added

---

### Pattern 2: Service-to-Service Authentication (API Keys)

**Use Case**: analytics-service → sync-airbnb, analytics-service → sync-hostaway (FUTURE - not implemented yet)

**How It Works**:

1. Each service has a secret API key in environment variables
2. Internal endpoints require `X-API-Key` header
3. Service validates API key before processing request
4. Used ONLY for service-to-service communication (not user-facing)

**Why API Keys**:

- **Simple**: Easy to implement and manage
- **Fast**: No JWT encoding/decoding overhead
- **Internal**: Only for trusted internal services
- **Sufficient for Phase 1**: Good enough for containers on same network (nook)

**Current Implementation**: ⏳ NOT IMPLEMENTED YET - No service-to-service calls exist yet

**Current Architecture** (Phase 1):

```
UI → org-service (JWT)
UI → sync-airbnb (JWT)
UI → sync-hostaway (JWT)
```

All services validate JWT and filter by org_id. No service-to-service calls yet.

**Future Architecture** (Phase 2 - if UI performance becomes issue):

```
UI → analytics-service (JWT)
  ↓
analytics-service → sync-airbnb (API key)
analytics-service → sync-hostaway (API key)
```

Analytics service aggregates data from sync services, caches it, returns combined results to UI.

**Example** (when implemented):

```python
# analytics-service calling sync-airbnb
headers = {
    "X-API-Key": SYNC_AIRBNB_API_KEY
}
response = requests.get("http://sync-airbnb/internal/listings", headers=headers)
```

**Note on Background Jobs**:

- sync-airbnb has scheduled jobs (e.g., nightly scrape at 10:05 PM)
- sync-hostaway has scheduled jobs (polling Hostaway API)
- These jobs write directly to their own databases (managed by Alembic)
- No authentication needed for the job itself (runs in container)
- Jobs don't call other services, so no API keys needed yet

**Limitations**:

- Not as secure as mTLS (keys can be stolen if exposed)
- No automatic rotation
- No identity verification (just "do you know the key?")

---

### Pattern 3: Mutual TLS (mTLS)

**Use Case**: Service-to-service authentication in production

**How It Works**:

1. Each service has its own SSL certificate
2. Services authenticate each other using certificates
3. Encrypted communication + identity verification

**Why mTLS**:

- **Strongest security**: Both client and server verify identity
- **No secrets in environment**: Uses certificates instead
- **Automatic encryption**: All traffic encrypted
- **Standard for microservices**: Industry best practice

**Current Implementation**: ⏳ Future (Phase 2+)

**Current Deployment**: Containers on nook, communicating via Docker network - API keys sufficient

**When to implement**:

- Before deploying to Kubernetes (whether on-prem server or cloud)
- Can be configured via Kubernetes service mesh (Istio) or NetworkPolicies
- NOT implemented in application code - infrastructure configuration
- Phase 2: Before onboarding paying customers

---

### Pattern 4: OAuth2 Service-to-Service (Client Credentials)

**Use Case**: Service-to-service with fine-grained permissions

**How It Works**:

1. Each service registers as OAuth2 client
2. Service requests access token with specific scopes
3. Token grants limited permissions (e.g., "read:listings")
4. Token expires after short time, must be refreshed

**Why OAuth2**:

- **Fine-grained permissions**: Scope-based access control
- **Token expiration**: Short-lived tokens reduce risk
- **Standard**: Well-understood, lots of tooling
- **Auditable**: Can track which service accessed what

**Current Implementation**: ⏳ Future (Phase 3+)

**When to implement**:

- When you have many services with complex permission needs
- When you need to audit/revoke service access dynamically
- When third-party services need to integrate

---

### Pattern 5: External Service Authentication

**Use Case**: Authenticating TO external services (Airbnb, Hostaway, etc.)

**Approaches**:

**A. Cookie-based (Airbnb)**:

- Store browser cookies after user logs into Airbnb
- Use cookies to make authenticated requests
- Brittle, but necessary when no API exists

**B. API Keys (Hostaway, PriceLabs)**:

- User provides their API key
- Store encrypted in database
- Use key in API requests

**C. OAuth2 (future integrations)**:

- User authorizes our app via OAuth flow
- We get refresh token, store securely
- Request access tokens as needed

**Current Implementation**:

- ✅ Cookies (Airbnb) - stored in database (encrypted)
- ✅ API Keys (Hostaway) - stored in database (encrypted)
- ⏳ OAuth2 - future integrations
- ⏳ **Secret Store** (Vault, AWS Secrets Manager) - production requirement

**Security Note**: Currently storing external credentials (Airbnb cookies, Hostaway API keys) encrypted in database. This is acceptable for solo use (Stephen's own credentials), but **MUST** migrate to dedicated secret store (HashiCorp Vault, AWS Secrets Manager, Google Secret Manager) before onboarding first paying customer. See Secrets Management section below.

---

## Current Architecture (Phase 1)

### Authentication Flow

```
┌─────────────┐
│   Browser   │
│     UI      │
└──────┬──────┘
       │ 1. Login via Google OAuth
       ↓
┌─────────────────┐
│  org-service    │  Port: 8000
│  - Google OAuth │
│  - Generate JWT │
└────────┬────────┘
         │ 2. Return JWT
         ↓
┌─────────────┐
│   Browser   │ Stores JWT in localStorage
│     UI      │
└──────┬──────┘
       │ 3. API requests with JWT (all direct from UI)
       ├──────────────────────┬──────────────────────┐
       ↓                      ↓                      ↓
┌──────────────┐       ┌──────────────┐      ┌──────────────┐
│ org-service  │       │sync-airbnb   │      │sync-hostaway │
│- Validate JWT│       │- Validate JWT│      │- Validate JWT│
│- Extract org │       │- Extract org │      │- Extract org │
└──────────────┘       └──────────────┘      └──────────────┘

Background Jobs (No Authentication):
┌──────────────┐
│ sync-airbnb  │  Scheduled job (10:05 PM nightly)
│ container    │  Writes to own database (Alembic)
└──────────────┘

┌──────────────┐
│sync-hostaway │  Scheduled job (polling Hostaway API)
│ container    │  Writes to own database (Alembic)
└──────────────┘

Service-to-Service (FUTURE - not implemented yet):
┌──────────────────┐  X-API-Key  ┌──────────────┐
│analytics-service │─────────────>│ sync-airbnb  │
│  (future)        │             │              │
└──────────────────┘             └──────────────┘
```

**Key Points**:

- UI talks directly to ALL services via JWT
- No service-to-service calls exist yet
- Background jobs run in containers, write to own databases, don't call other services
- Future: analytics-service MAY aggregate data if UI performance becomes issue

### What Gets Implemented Where

**org-service** (IMPLEMENTING NOW):

- ✅ Google OAuth integration
- ✅ JWT generation with minimal Phase 1 payload (sub, org_id, email, is_owner, exp)
- ⏳ User/org management (departments/roles are FUTURE)
- ✅ JWT validation middleware (for its own routes)

**sync-airbnb, sync-hostaway** (data services - IMPLEMENTING NOW):

- ✅ JWT validation middleware
- ✅ Extract org_id from JWT
- ✅ Filter all queries by org_id (CRITICAL for multi-tenancy)
- ⏳ API key validation for internal endpoints (FUTURE - when analytics-service exists)

**UI (autohost - this repo - IMPLEMENTING NOW)**:

- ✅ Google OAuth login flow
- ✅ Store JWT in localStorage
- ✅ Include JWT in Authorization header for ALL requests (org-service, sync-airbnb, sync-hostaway)
- ✅ Handle token expiration (redirect to login on 401, no refresh token in Phase 1)
- ⏳ Token refresh (FUTURE - Phase 2)

---

## Multi-Tenancy: org_id Isolation

**Critical Security Requirement**: Every service MUST filter all data by `org_id`

### Why This Matters

Without org_id filtering, users from Organization A could see data from Organization B. This would be a catastrophic security breach.

**Example of WRONG code**:

```python
# ❌ DANGEROUS - No org_id filter
listings = db.query(Listing).all()  # Returns ALL orgs' listings!
```

**Example of CORRECT code**:

```python
# ✅ SAFE - Filters by org_id from JWT
org_id = request.state.org_id  # Extracted from JWT by middleware
listings = db.query(Listing).filter(Listing.org_id == org_id).all()
```

### How org_id Flows Through System

```
User logs in
  ↓
JWT created with org_id
  ↓
JWT sent to backend service
  ↓
Middleware extracts org_id from JWT
  ↓
request.state.org_id available in route handlers
  ↓
ALL database queries filter by org_id
```

---

## Implementation Roadmap

### Phase 1: JWT Authentication (Implementing Now)

**Timeline**: Immediate (solo use - Stephen)
**Services**: org-service, sync-airbnb, sync-hostaway
**UI**: autohost (this repo)

**Deliverables**:

1. **org-service**: Google OAuth + JWT generation
   - Hardcode org_id: `11111111-1111-1111-1111-111111111111` (for now)
   - JWT payload: `{sub, org_id, email, is_owner, exp}`
   - No database needed yet (just hardcoded values)
   - Return JWT after Google OAuth succeeds

2. **sync-airbnb**: JWT validation + org_id filtering
   - JWT validation middleware (extract org_id from token)
   - **Hardcode org_id in background jobs**: When scraping Airbnb, set `org_id = "11111111-1111-1111-1111-111111111111"` on all INSERTs
   - **Backfill existing data**: `UPDATE <table> SET org_id = '11111111-1111-1111-1111-111111111111' WHERE org_id IS NULL`
   - Filter ALL queries by org_id from JWT

3. **sync-hostaway**: JWT validation + org_id filtering
   - JWT validation middleware (extract org_id from token)
   - **Hardcode org_id in background jobs**: When syncing Hostaway, set `org_id = "11111111-1111-1111-1111-111111111111"` on all INSERTs
   - **Backfill existing data**: `UPDATE <table> SET org_id = '11111111-1111-1111-1111-111111111111' WHERE org_id IS NULL`
   - Filter ALL queries by org_id from JWT

4. **autohost UI**: Google OAuth login + JWT storage
   - Google OAuth login flow
   - Store JWT in localStorage
   - Include `Authorization: Bearer <token>` header on ALL requests to all services
   - Redirect to login on 401

5. **Token TTL**: 7 days (no refresh token yet)

**Implementation Notes**:

- Same hardcoded `org_id` UUID across ALL services (org-service, sync-airbnb, sync-hostaway)
- Multi-tenant architecture from day 1, just with hardcoded org_id for solo use
- When adding second customer: Remove hardcoded org_id, add organizations table, look up org_id from database

**Success Criteria**:

- User (Stephen) can log in via Google OAuth
- JWT works across all services (org-service, sync-airbnb, sync-hostaway)
- All data filtered by hardcoded org_id (multi-tenant ready)
- Token expires after 7 days, redirects to login

---

### Phase 2: Production Hardening (Before First Customer)

**Timeline**: Before onboarding first paying customer (not Stephen, not property manager)
**Trigger**: When ready to onboard external users

**Deliverables**:

1. **Token Refresh** - Implement refresh token flow
   - Access token: 15 minutes (short-lived)
   - Refresh token: 30 days (long-lived, stored securely)
   - Auto-refresh in background (user stays logged in)
   - More secure for customer data

2. **Secret Store Migration** - Move external credentials from database to secret store
   - HashiCorp Vault, AWS Secrets Manager, or Google Secret Manager
   - Migrate Airbnb cookies, Hostaway API keys
   - Stop storing secrets in database

3. **mTLS** - Service-to-service authentication (if deploying to Kubernetes)
   - Configure via Kubernetes service mesh (Istio) or NetworkPolicies
   - Not implemented in code - infrastructure config

4. **Rate Limiting** - Protect against abuse
   - Per org_id, per endpoint
   - Prevent single org from overwhelming system

5. **Audit Logging** - Track all access
   - Log user/org access for compliance
   - Support security investigations

**Success Criteria**:

- Tokens refresh automatically (user never logged out)
- External credentials stored in secret store (not database)
- Services communicate securely (mTLS if on Kubernetes)
- Rate limits prevent abuse
- All access logged for auditability

---

### Phase 3: Advanced Features (Scale & Compliance)

**Timeline**: As needed for enterprise customers
**When**: Multiple organizations, compliance requirements

**Deliverables**:

1. **OAuth2 for service-to-service** - Fine-grained scopes
2. **Multi-account access** - `account_ids` array in JWT
3. **Project-based access** - `project_ids` array in JWT
4. **SSO integrations** - SAML, Okta, Azure AD
5. **2FA/MFA** - Multi-factor authentication

**Success Criteria**:

- Enterprise customers can use their own SSO
- Users can access multiple external accounts
- Compliance requirements met (SOC 2, GDPR, etc.)

---

## Service Implementation Prompts

### Prompt for org-service

**Paste this into org-service chat**:

````
Implement Google OAuth and JWT generation in org-service:

**Context**: org-service is the central authentication authority for the platform. For Phase 1 (solo use), we're keeping it minimal with hardcoded values.

**Phase 1 - Minimal Implementation**:
- Google OAuth login (user clicks "Login with Google")
- Generate JWT with hardcoded org_id
- No database needed yet (departments, roles, users tables come later)

**Hardcoded Values**:
- org_id: `11111111-1111-1111-1111-111111111111`
- is_owner: `true` (always)

**Implementation Requirements**:

1. **Google OAuth Flow**:
   - Set up Google OAuth client (Google Cloud Console)
   - `/auth/google` endpoint redirects to Google
   - `/auth/google/callback` endpoint handles OAuth callback
   - Extract user info (email, Google user ID)

2. **JWT Generation**:
   - After successful OAuth, generate JWT
   - Payload (Phase 1 minimal):
     ```
     {
       "sub": google_user_id,
       "org_id": "11111111-1111-1111-1111-111111111111",  # HARDCODED
       "email": user_email,
       "is_owner": true,  # HARDCODED
       "exp": current_time + 7 days
     }
     ```
   - Sign with JWT_SECRET_KEY (HS256 algorithm)
   - Return JWT to UI (via redirect or JSON response)

3. **JWT Validation Middleware** (for org-service's own routes):
   - Extract token from Authorization header
   - Validate signature and expiration
   - Attach payload to request.state

**Environment Variables**:
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- JWT_SECRET_KEY (generate random 256-bit key)
- JWT_ALGORITHM=HS256
- HARDCODED_ORG_ID=11111111-1111-1111-1111-111111111111

**Testing**:
- User can log in via Google OAuth
- JWT is returned after successful login
- JWT contains hardcoded org_id
- JWT expires after 7 days

**Phase 2 (Future)**:
- Add organizations, users tables
- Look up org_id from database based on user email
- Support multiple orgs

Please implement this following FastAPI best practices.
````

---

### Prompt for Data Services (sync-airbnb, sync-hostaway)

**Paste this into each service chat**:

```
Implement JWT authentication in this service based on the platform authentication architecture:

**Context**: This service is part of a multi-tenant platform. org-service is the central authentication authority that issues JWTs after Google OAuth login. This service needs to:

1. Validate JWTs on every request (except health checks)
2. Extract org_id from JWT and attach to request.state
3. Filter ALL database queries by org_id for multi-tenancy

**Phase 1 - Hardcoded org_id**:
For solo use (Stephen only), we're hardcoding org_id across all services:
- Hardcoded org_id: `11111111-1111-1111-1111-111111111111`
- Background jobs: Set this org_id on all INSERTs
- Backfill existing data: `UPDATE <table> SET org_id = '11111111-1111-1111-1111-111111111111' WHERE org_id IS NULL`

**JWT Structure** (from org-service - Phase 1 minimal payload):
{
  "sub": "user_id",          # Google user ID
  "org_id": "uuid",          # CRITICAL - hardcoded "11111111-1111-1111-1111-111111111111" for now
  "email": "string",
  "is_owner": boolean,       # Always true for now
  "exp": timestamp           # 7 days from issue
}

**Environment Variables Needed**:
- JWT_SECRET_KEY (must match org-service)
- JWT_ALGORITHM=HS256
- HARDCODED_ORG_ID=11111111-1111-1111-1111-111111111111

**Implementation Requirements**:
1. Create utils/jwt.py with decode_jwt() function
2. Create middleware/jwt_middleware.py that:
   - Extracts token from Authorization header
   - Validates signature and expiration
   - Attaches payload to request.state.user
   - Attaches org_id to request.state.org_id
3. Register middleware in main.py
4. Update ALL database queries to filter by org_id
5. Update background jobs to set HARDCODED_ORG_ID on all INSERTs
6. Backfill existing data with HARDCODED_ORG_ID

**Testing**:
- Without JWT: requests should return 401
- With valid JWT: requests should succeed and return only that org's data
- Verify all data has org_id set

Please implement this authentication system following FastAPI best practices.
```

---

### Prompt for UI (autohost)

**Paste this into UI chat**:

```
Implement JWT authentication in the UI based on the platform authentication architecture:

**Context**: Users log in via Google OAuth through org-service. After successful login, org-service returns a JWT token. The UI needs to:

1. Handle Google OAuth callback
2. Store JWT in localStorage
3. Include JWT in all API requests
4. Handle token expiration/refresh

**JWT Lifecycle**:
1. User clicks "Login with Google"
2. Redirect to org-service OAuth endpoint
3. After OAuth, org-service redirects back with JWT
4. Store JWT in localStorage
5. Include in all requests: Authorization: Bearer <token>
6. On 401 response, redirect to login

**Implementation Requirements**:
1. Create auth context/provider
2. Store JWT in localStorage (key: "auth_token")
3. Create axios/fetch interceptor to add Authorization header
4. Handle token expiration (7 days - Phase 1, will add refresh tokens in Phase 2)
5. Redirect to login on 401 response
6. Clear token on logout

**API Calls**:
All requests to backend services (org-service, sync-airbnb, sync-hostaway) must include:
```

headers: {
'Authorization': `Bearer ${token}`
}

```

Please implement this authentication flow following React/Next.js best practices.
```

---

## Secrets Management

### Current Approach (Phase 1 - Development)

**What We're Storing**:

- External service credentials (Airbnb cookies, Hostaway API keys)
- User passwords (hashed via bcrypt) - actually using Google OAuth, no passwords
- Service-to-service API keys (environment variables)
- JWT secret key (environment variable)

**Where We're Storing It**:

- **Database**: External credentials (encrypted at application level)
- **Environment Variables**: Service secrets (JWT_SECRET_KEY, INTERNAL_API_KEY)
- **Not tracked in git**: .env files in .gitignore

**Encryption**:

```python
# Example: Encrypting API keys before storing in database
from cryptography.fernet import Fernet

# Key stored in environment variable
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")
cipher = Fernet(ENCRYPTION_KEY)

# Encrypt before storing
encrypted_api_key = cipher.encrypt(api_key.encode())
db.store(encrypted_api_key)

# Decrypt when retrieving
decrypted_api_key = cipher.decrypt(encrypted_api_key).decode()
```

**Limitations of Current Approach**:

- ❌ Encryption key stored in environment variable (single point of failure)
- ❌ No automatic secret rotation
- ❌ No audit trail of secret access
- ❌ Environment variables can leak in logs/errors
- ❌ Difficult to manage across multiple environments (dev/staging/prod)

---

### Production Approach (Phase 2 - Before Launch)

**Migrate to Dedicated Secret Store**

**Options**:

**A. HashiCorp Vault** (Self-hosted or HCP)

- ✅ Open source option available
- ✅ Dynamic secrets (generate on-demand, auto-rotate)
- ✅ Detailed audit logs
- ✅ Encryption as a service
- ❌ Requires management/maintenance (if self-hosted)

**B. AWS Secrets Manager**

- ✅ Fully managed (no infrastructure)
- ✅ Automatic rotation for RDS, etc.
- ✅ Integrated with AWS IAM
- ✅ CloudTrail audit logs
- ❌ AWS-specific (vendor lock-in)
- ❌ Costs money per secret

**C. Google Secret Manager**

- ✅ Fully managed
- ✅ Integrated with GCP IAM
- ✅ Audit logs via Cloud Audit Logs
- ❌ GCP-specific (vendor lock-in)

**D. Azure Key Vault**

- ✅ Fully managed
- ✅ Integrated with Azure AD
- ❌ Azure-specific (vendor lock-in)

**Recommendation**: Start with AWS Secrets Manager or Google Secret Manager (whichever cloud you deploy to). Migrate to Vault if you need multi-cloud or self-hosted.

---

### Migration Plan (Database Credentials → Secret Store)

**What to Migrate**:

1. External service credentials (Airbnb cookies, Hostaway API keys)
2. Database connection strings
3. Service-to-service API keys
4. JWT secret key
5. Encryption keys

**Migration Steps**:

**Step 1: Set up Secret Store**

```bash
# Example: AWS Secrets Manager
aws secretsmanager create-secret \
  --name prod/airbnb/account-123/cookies \
  --secret-string '{"cookies": "..."}'
```

**Step 2: Update Code to Fetch from Secret Store**

```python
# Before (Phase 1):
api_key = decrypt_from_db(account.encrypted_api_key)

# After (Phase 2):
import boto3
client = boto3.client('secretsmanager')

response = client.get_secret_value(
    SecretId=f'prod/hostaway/account-{account_id}/api-key'
)
api_key = response['SecretString']
```

**Step 3: Implement Caching**

```python
# Don't fetch from secret store on EVERY request
# Cache secrets in memory with TTL
from functools import lru_cache
from datetime import datetime, timedelta

class SecretCache:
    def __init__(self, ttl_minutes=60):
        self.cache = {}
        self.ttl = timedelta(minutes=ttl_minutes)

    def get(self, secret_id):
        if secret_id in self.cache:
            value, timestamp = self.cache[secret_id]
            if datetime.now() - timestamp < self.ttl:
                return value

        # Fetch from secret store
        value = fetch_secret(secret_id)
        self.cache[secret_id] = (value, datetime.now())
        return value
```

**Step 4: Migrate Data**

1. Read encrypted credentials from database
2. Decrypt using current encryption key
3. Store in secret store
4. Delete from database (or keep as backup temporarily)

**Step 5: Update Environment Variables**

```bash
# Before:
JWT_SECRET_KEY=abc123...
HOSTAWAY_API_KEY=xyz789...

# After:
SECRET_STORE_TYPE=aws  # or google, vault
SECRET_STORE_REGION=us-east-1
# No actual secrets in environment!
```

---

### Secret Rotation

**Why Rotate Secrets**:

- Limit damage if secret is compromised
- Comply with security policies (rotate every 90 days)
- Detect if old secrets are still in use

**Rotation Strategy**:

**Automatic Rotation** (AWS Secrets Manager):

```python
# Lambda function that runs every 90 days
def rotate_secret(event, context):
    secret_id = event['SecretId']

    # Generate new API key in external service (if supported)
    new_api_key = generate_new_hostaway_api_key()

    # Test new key works
    if test_api_key(new_api_key):
        # Store new key
        update_secret(secret_id, new_api_key)
        # Revoke old key
        revoke_old_key()
```

**Manual Rotation** (for services without API rotation):

1. Generate new secret
2. Store as new version in secret store
3. Update services to use new version
4. Monitor for errors
5. Delete old version after grace period

---

### Secrets in Development vs Production

**Development** (current):

- `.env` files (not committed to git)
- Can use fake/test credentials
- Can store in database encrypted

**Staging**:

- Use secret store (same as prod)
- Separate secrets from production
- Test secret rotation procedures

**Production**:

- **MUST** use secret store
- **MUST** enable audit logging
- **MUST** implement rotation
- **MUST** use least-privilege IAM policies

---

### Roadmap

**Phase 1 (Now - Development)**:

- ✅ Store external credentials encrypted in database
- ✅ Use environment variables for service secrets
- ✅ .env files in .gitignore

**Phase 2 (Before Production Launch)**:

- ⏳ Set up AWS Secrets Manager or Google Secret Manager
- ⏳ Migrate external credentials to secret store
- ⏳ Update code to fetch from secret store
- ⏳ Implement secret caching
- ⏳ Remove credentials from database
- ⏳ Enable audit logging

**Phase 3 (Production Hardening)**:

- ⏳ Implement automatic secret rotation
- ⏳ Set up alerts for secret access anomalies
- ⏳ Document secret recovery procedures
- ⏳ Implement secret versioning strategy

---

## Security Best Practices

### Never Do This ❌

1. **Don't hardcode secrets**: Use environment variables
2. **Don't log JWTs**: They contain sensitive data
3. **Don't store JWTs in cookies** (CSRF risk): Use localStorage
4. **Don't skip org_id filtering**: ALWAYS filter by org_id
5. **Don't trust client input**: Validate everything server-side
6. **Don't use HTTP**: Always HTTPS in production
7. **Don't share API keys**: Each service has its own key

### Always Do This ✅

1. **Use HTTPS** in production
2. **Validate JWTs** on every request
3. **Filter by org_id** on every query
4. **Log access** for auditability
5. **Rotate secrets** periodically
6. **Use environment variables** for secrets
7. **Test multi-tenancy isolation** thoroughly

---

## Testing Multi-Tenancy

### Test Scenario 1: Data Isolation

**Setup**:

1. Create Organization A with User A
2. Create Organization B with User B
3. User A creates a listing
4. User B creates a listing

**Test**:

- User A should see only their listing
- User B should see only their listing
- User A should NOT see User B's listing
- User B should NOT see User A's listing

**How to Test**:

```bash
# Login as User A, get JWT_A
# Login as User B, get JWT_B

# User A requests listings
curl -H "Authorization: Bearer $JWT_A" http://localhost:8001/listings
# Should return only User A's listings

# User B requests listings
curl -H "Authorization: Bearer $JWT_B" http://localhost:8001/listings
# Should return only User B's listings
```

---

## Reference Documentation

- **JWT Standard**: https://jwt.io/
- **OAuth2**: https://oauth.net/2/
- **mTLS**: https://www.cloudflare.com/learning/access-management/what-is-mutual-tls/
- **FastAPI Security**: https://fastapi.tiangolo.com/tutorial/security/

---

## Questions & Decisions Log

**Q: Why JWT over sessions?**
A: Stateless, scales horizontally, works across microservices

**Q: Why API keys for internal services?**
A: Simple for Phase 1, will upgrade to mTLS for production

**Q: Why include empty arrays in JWT?**
A: Future-proofing - services can ignore them now, use them later

**Q: Why org_id instead of account_id?**
A: Clearer naming, aligns with multi-tenancy concepts

**Q: When to implement mTLS?**
A: Before production, when services communicate over network

---

This document should be referenced when implementing authentication in ANY service in the platform.
