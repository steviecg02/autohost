# Org-Service P0 Implementation - Continuation Instructions

**Context**: You were working on implementing the P0 org structure (organizations, departments, roles, org_members) in org-service.

---

## What Was Decided

### Authentication Architecture

Complete authentication architecture has been documented in the autohost-ui repository:

- **[docs/planning/authentication-security-architecture.md](https://github.com/[your-username]/autohost-ui/blob/main/docs/planning/authentication-security-architecture.md)**

**Key Decisions**:

1. **JWT Authentication**: User → Backend uses JWT with full org/department/role context
2. **API Keys**: Service → Service uses API keys (Phase 1), mTLS later (Phase 2)
3. **Multi-tenancy**: ALL queries filter by org_id from JWT
4. **Secrets**: Store in database encrypted (Phase 1), migrate to secret store (Phase 2)

### Future Features

Tasks, workflows, projects, AI agents, and automation have been documented (as PROPOSALS, not finalized):

- **[docs/planning/future-architecture-work-management.md](https://github.com/[your-username]/autohost-ui/blob/main/docs/planning/future-architecture-work-management.md)**

**Decision**: These features will live in a separate work-service (NOT in org-service). Don't build them yet.

---

## What Needs To Be Done Now (P0)

### 1. Create SQLAlchemy Models

**DO NOT create migrations manually. Create models FIRST, then generate migrations.**

**Files to create**:

**org_service/models/organization.py**:

```python
from sqlalchemy import Column, String, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base

class Organization(Base):
    __tablename__ = "organizations"

    org_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    type = Column(String(50), default='individual')  # individual, company
    created_at = Column(DateTime, server_default=func.now())
```

**org_service/models/department.py**:

```python
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base

class Department(Base):
    __tablename__ = "departments"

    department_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_system_default = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
```

**org_service/models/role.py**:

```python
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base

class Role(Base):
    __tablename__ = "roles"

    role_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    is_system_default = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
```

**org_service/models/org_member.py**:

```python
from sqlalchemy import Column, Boolean, DateTime, ForeignKey, func, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
import uuid
from .base import Base

class OrgMember(Base):
    __tablename__ = "org_members"

    member_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    org_id = Column(UUID(as_uuid=True), ForeignKey("organizations.org_id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"), nullable=False)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.department_id"))
    role_id = Column(UUID(as_uuid=True), ForeignKey("roles.role_id"))
    is_owner = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, server_default=func.now())

    __table_args__ = (
        UniqueConstraint('org_id', 'user_id', name='uq_org_user'),
    )
```

**Update org_service/models/**init**.py**:

```python
from .base import Base
from .user import User
from .organization import Organization
from .department import Department
from .role import Role
from .org_member import OrgMember

__all__ = ["Base", "User", "Organization", "Department", "Role", "OrgMember"]
```

---

### 2. Delete Existing Migrations

```bash
# Delete all existing migration files (but keep alembic/ directory)
rm org_service/alembic/versions/*.py
```

---

### 3. Generate New Migration

```bash
# Generate migration from SQLAlchemy models
alembic revision --autogenerate -m "P0: org structure with departments and roles"

# Review the generated migration file to ensure it looks correct

# Apply migration
alembic upgrade head
```

---

### 4. Update User Model

**org_service/models/user.py**:

Remove `account_id` references if they exist. Users are linked to orgs via `org_members` table.

---

### 5. Update JWT Generation

**org_service/services/auth_service.py**:

Update the JWT generation logic to include new fields:

```python
async def create_user_jwt(user: User, org_member: OrgMember) -> str:
    """
    Create JWT token for authenticated user.

    Args:
        user: User object
        org_member: OrgMember object linking user to org/department/role

    Returns:
        JWT token string
    """
    token_data = {
        "sub": str(user.user_id),
        "org_id": str(org_member.org_id),
        "department_id": str(org_member.department_id) if org_member.department_id else None,
        "role_id": str(org_member.role_id) if org_member.role_id else None,
        "is_owner": org_member.is_owner,
        "email": user.email,

        # Future fields (empty for now)
        "permissions": [],
        "account_ids": [],
        "project_ids": [],
    }

    return create_jwt_token(token_data)
```

---

### 6. Update Signup Flow

When a user signs up via Google OAuth:

1. Create `Organization` (type="individual", name=user's name or email)
2. Create `User`
3. Create default `Department` (name="Owner", is_system_default=True)
4. Create default `Role` (name="Owner", is_system_default=True)
5. Create `OrgMember` linking user to org with is_owner=True

**Pseudocode**:

```python
async def handle_oauth_callback(oauth_user_data):
    # Create org
    org = Organization(
        name=oauth_user_data.name or oauth_user_data.email,
        type="individual"
    )
    db.add(org)
    await db.flush()  # Get org_id

    # Create user
    user = User(
        email=oauth_user_data.email,
        name=oauth_user_data.name,
        # ... other fields
    )
    db.add(user)
    await db.flush()  # Get user_id

    # Create default department
    dept = Department(
        org_id=org.org_id,
        name="Owner",
        description="Default department for organization owner",
        is_system_default=True
    )
    db.add(dept)
    await db.flush()

    # Create default role
    role = Role(
        department_id=dept.department_id,
        name="Owner",
        description="Full access to organization",
        is_system_default=True
    )
    db.add(role)
    await db.flush()

    # Link user to org
    org_member = OrgMember(
        org_id=org.org_id,
        user_id=user.user_id,
        department_id=dept.department_id,
        role_id=role.role_id,
        is_owner=True
    )
    db.add(org_member)

    await db.commit()

    # Generate JWT
    jwt_token = await create_user_jwt(user, org_member)

    return jwt_token
```

---

### 7. Update JWT Middleware

**org_service/middleware/jwt_middleware.py**:

No changes needed. It already extracts payload and attaches to `request.state.user`.

**Update route handlers** to use new fields:

```python
org_id = request.state.user.get("org_id")
department_id = request.state.user.get("department_id")
role_id = request.state.user.get("role_id")
is_owner = request.state.user.get("is_owner")
```

---

## Testing

**Test scenarios**:

1. **New user signup**:
   - User signs in with Google OAuth
   - Org, user, department, role, org_member all created
   - JWT contains correct org_id, department_id, role_id
   - User can access protected endpoints

2. **JWT validation**:
   - Invalid JWT returns 401
   - Expired JWT returns 401
   - Valid JWT allows access

3. **Future multi-user scenario** (manual testing):
   - Create second user
   - Add to same org (same org_id, different department/role)
   - Both users get JWTs with same org_id but different roles
   - Verify both can access org's data

---

## What NOT To Build Yet

- ❌ Tasks, workflows, projects (future work-service)
- ❌ AI agents (except as users with roles)
- ❌ Automation system (future)
- ❌ Permissions/RBAC (Phase 2)
- ❌ Multi-account access (Phase 3)

**Just build**: orgs, users, departments, roles, org_members, JWT generation

---

## Questions?

If you have questions about:

- **Authentication patterns**: See authentication-security-architecture.md in autohost-ui
- **Future features**: See future-architecture-work-management.md in autohost-ui (but don't build yet)
- **What to build now**: Follow this document (P0 only)

---

## Success Criteria

✅ P0 is complete when:

1. SQLAlchemy models created for org, department, role, org_member
2. Migrations generated and applied
3. User signup creates org + default department/role
4. JWT includes org_id, department_id, role_id
5. User can log in and access protected routes
6. No references to old `account_id` field

---

**Ready to implement P0. Go!**
