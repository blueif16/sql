# Backend API Rewrite Checklist

## Overview
Complete rewrite of backend models, serializers, views, and admin based on schema.sql.
- **No compatibility needed** - fresh start
- **No data migration** - new database structure
- Models simplified from 4-layer hierarchy to flat structure

---

## Model Changes Summary

### ✅ COMPLETED: Models Updated (models.py)
Based on schema.sql:

| Model | Status | Description |
|-------|--------|-------------|
| **UserRole** | ✅ New | User roles (admin, user, premium_user) |
| **Preference** | ✅ New | User preferences (difficulty, learning_style, interest_areas, learned_concepts, ui_theme) |
| **Problem** | ✅ Rewritten | Flat structure with title, difficulty, primary_concept, secondary_concepts, interest_tags, sql_schema |
| **Submission** | ✅ New | Replaces QuerySubmission - stores sql_code, is_correct |
| **UserProgress** | ✅ Rewritten | One record per user with solved_problem_ids JSON field |
| **ChatThread** | ✅ Kept | No changes needed |
| **ChatMessage** | ✅ Kept | No changes needed |

### ❌ DELETED: Old Models
- Theme (removed)
- Section (removed)
- Concept (removed)
- QuerySubmission (replaced by Submission)

---

## Rewrite Checklist

### 1. ✅ Serializers (serializers.py) - COMPLETED

#### DELETE - Remove old serializers:
- [x] Delete `ThemeSerializer`
- [x] Delete `SectionSerializer`
- [x] Delete `ConceptSerializer`
- [x] Delete `DetailedThemeSerializer`
- [x] Delete `DetailedSectionSerializer`
- [x] Delete `DetailedConceptSerializer`
- [x] Delete `QuerySubmissionSerializer`

#### CREATE - New serializers:
- [x] `UserRoleSerializer`
  - Fields: id, user, username, role
  
- [x] `PreferenceSerializer`
  - Fields: id, user, username, difficulty_preference, learning_style, interest_areas, learned_concepts, ui_theme, updated_at
  
- [x] `ProblemSerializer` (rewrite)
  - Fields: id, title, description, difficulty, primary_concept, secondary_concepts, interest_tags, sql_schema, is_active
  
- [x] `ProblemListSerializer` (lightweight version)
  - Fields: id, title, difficulty, primary_concept, interest_tags, is_active
  
- [x] `SubmissionSerializer` (replaces QuerySubmissionSerializer)
  - Fields: id, user, username, problem, problem_title, problem_difficulty, sql_code, is_correct, submitted_at
  
- [x] `UserProgressSerializer` (rewrite)
  - Fields: id, user, username, solved_problem_ids, total_solved
  - Computed field: total_solved

#### KEEP - Existing serializers:
- [x] `ChatThreadSerializer` - Updated with new Problem fields
- [x] `ChatMessageSerializer` - No changes needed
- [x] `ChatRequestSerializer` - No changes needed
- [x] `UserSerializer` - No changes needed

---

### 2. ✅ Views (views.py) - COMPLETED

#### DELETE - Remove old viewsets:
- [x] Delete `ThemeViewSet`
- [x] Delete `SectionViewSet`
- [x] Delete `ConceptViewSet`

#### REWRITE - Problem views:
- [x] `ProblemViewSet` (complete rewrite)
  - list() - Get all problems with filtering (difficulty, primary_concept, interest_tag)
  - retrieve(id) - Get single problem with full details
  - submit() - Submit SQL solution, create Submission, update UserProgress
  - progress() - Get user's progress for specific problem

#### REWRITE - Progress views:
- [x] `UserProgressViewSet` (complete rewrite)
  - me() - Get current user's progress
  - stats() - Calculate detailed stats (total, by difficulty)
  - concepts() - Get learned concepts from solved problems

#### CREATE - New viewsets:
- [x] `UserRoleViewSet`
  - Full CRUD operations
  - Admin only access
  - Filter by user_id

- [x] `PreferenceViewSet`
  - me() action - GET/PUT/PATCH user's preferences
  - Auto-create if not exists
  - Users access only their own preferences

- [x] `SubmissionViewSet`
  - list() - Get user's submissions with filtering
  - retrieve() - Get submission details
  - history() - Submission history for specific problem
  - statistics() - Submission stats (total, correct, accuracy)

#### UPDATE - Chat views:
- [x] `ChatViewSet` - No changes needed (functionality unchanged)

---

### 3. ✅ URLs (urls.py) - COMPLETED

#### DELETE - Remove old routes:
- [x] Remove `router.register(r'themes', ...)`
- [x] Remove `router.register(r'sections', ...)`
- [x] Remove `re_path(r'^concepts/...')`

#### ADD - New routes:
- [x] `router.register(r'roles', UserRoleViewSet, basename='role')`
- [x] `router.register(r'preferences', PreferenceViewSet, basename='preference')`
- [x] `router.register(r'submissions', SubmissionViewSet, basename='submission')`

#### UPDATE - Existing routes:
- [x] `router.register(r'problems', ...)` - Uses new ProblemViewSet
- [x] `router.register(r'progress', ...)` - Uses new UserProgressViewSet
- [x] `router.register(r'chat', ...)` - Unchanged

---

### 4. ✅ Admin (admin.py) - COMPLETED

#### DELETE - Remove old admin classes:
- [x] Delete `ThemeAdmin`
- [x] Delete `SectionAdmin`
- [x] Delete `ConceptAdmin`
- [x] Delete `QuerySubmissionAdmin`

#### CREATE - New admin classes:
- [x] `UserRoleAdmin`
  - list_display = ['user', 'role']
  - list_filter = ['role']
  - search_fields = ['user__username', 'user__email']

- [x] `PreferenceAdmin`
  - list_display = ['user', 'difficulty_preference', 'learning_style', 'ui_theme', 'updated_at']
  - list_filter = ['difficulty_preference', 'learning_style', 'ui_theme']
  - search_fields = ['user__username', 'user__email']
  - fieldsets organized by category

#### REWRITE - Existing admin classes:
- [x] `ProblemAdmin`
  - list_display = ['id', 'title', 'difficulty', 'primary_concept', 'is_active']
  - list_filter = ['difficulty', 'primary_concept', 'is_active']
  - list_editable = ['is_active']
  - fieldsets organized

- [x] `SubmissionAdmin` (replaces QuerySubmissionAdmin)
  - list_display = ['id', 'user', 'problem_title', 'is_correct', 'submitted_at']
  - list_filter = ['is_correct', 'submitted_at', 'problem__difficulty']
  - date_hierarchy = 'submitted_at'

- [x] `UserProgressAdmin`
  - list_display = ['user', 'total_solved', 'display_solved_ids']
  - Custom methods for displaying data

#### KEEP - Unchanged admin:
- [x] `ChatThreadAdmin` - No changes needed
- [x] `ChatMessageAdmin` - No changes needed

---

### 5. ✅ Other Files - COMPLETED

#### DELETE/REWRITE:
- [x] `populate_data.py` - Completely rewritten
  - Creates sample problems based on schema.sql structure
  - Creates test users with preferences and roles
  - Creates 5 sample problems (easy to hard difficulty)
  - Covers different concepts and interest tags

#### UPDATE:
- [x] `chatbot.py`
  - Updated `_build_context()` to use new Problem fields
  - Now uses: problem.title, problem.description, problem.difficulty, problem.primary_concept, problem.sql_schema

- [x] Updated imports in:
  - [x] `learning/__init__.py` - Cleaned up
  - [x] `learning/management/__init__.py` - Cleaned up
  - [x] `learning/management/commands/__init__.py` - Cleaned up

---

## API Endpoint Changes

### ❌ REMOVED Endpoints:
```
DELETE /api/themes/
DELETE /api/themes/{id}/
DELETE /api/themes/{id}/sections/
DELETE /api/sections/
DELETE /api/sections/{id}/
DELETE /api/sections/{id}/concepts/
DELETE /api/concepts/{name}/info/
```

### ✅ NEW Endpoints:
```
# User Roles
GET    /api/roles/                    # List all roles (admin only)
GET    /api/roles/{id}/               # Get specific role
POST   /api/roles/                    # Create role (admin only)
DELETE /api/roles/{id}/               # Delete role (admin only)

# User Preferences
GET    /api/preferences/me/           # Get current user's preferences
PUT    /api/preferences/me/           # Update preferences
PATCH  /api/preferences/me/           # Partial update

# Problems (revised)
GET    /api/problems/                 # List problems (filter by difficulty, concept, tags)
GET    /api/problems/{id}/            # Get problem details
POST   /api/problems/{id}/submit/    # Submit SQL solution
GET    /api/problems/{id}/progress/  # Get user progress for problem

# Submissions (new)
GET    /api/submissions/              # List user's submissions
GET    /api/submissions/{id}/         # Get submission details
POST   /api/submissions/              # Create submission (submit SQL)
GET    /api/submissions/history/      # Submission history for problem

# User Progress (revised)
GET    /api/progress/me/              # Get current user's progress
PATCH  /api/progress/me/              # Update progress (add solved problem)
GET    /api/progress/stats/           # Get statistics
GET    /api/progress/concepts/        # Get learned concepts

# Chat (unchanged)
POST   /api/chat/message/
POST   /api/chat/stream/
GET    /api/chat/history/
GET    /api/chat/threads/
```

---

## Database Migration Steps

Since this is a complete rewrite with no data to preserve:

```bash
# 1. Delete old migrations
rm backend/learning/migrations/0*.py

# 2. Create new migrations
python manage.py makemigrations learning

# 3. Apply migrations
python manage.py migrate learning

# 4. Create superuser (if needed)
python manage.py createsuperuser

# 5. Populate test data
python manage.py populate_data
```

---

## Testing Checklist

After implementation, test these flows:

### User Management:
- [ ] User registration creates default Preference record
- [ ] User role assignment works
- [ ] Preferences can be updated

### Problem Flow:
- [ ] List problems with filters (difficulty, concept, tags)
- [ ] Get problem details with full sql_schema
- [ ] Submit solution creates Submission record
- [ ] Correct submission updates UserProgress.solved_problem_ids

### Progress Tracking:
- [ ] UserProgress updates when problem solved
- [ ] Stats calculation works (total solved, percentage)
- [ ] Learned concepts derived from solved problems

### Chat:
- [ ] Chat works with new Problem structure
- [ ] Context includes new Problem fields

---

## Priority Order

1. **High Priority (Core functionality)**
   - [ ] Serializers: Problem, Submission, UserProgress
   - [ ] Views: ProblemViewSet, SubmissionViewSet
   - [ ] URLs: Update routing
   - [ ] populate_data.py: Create test data

2. **Medium Priority (User features)**
   - [ ] Serializers: Preference, UserRole
   - [ ] Views: PreferenceViewSet, UserProgressViewSet
   - [ ] Admin: All new admin classes
   - [ ] chatbot.py: Update context building

3. **Low Priority (Polish)**
   - [ ] Admin customizations
   - [ ] Additional filtering/search
   - [ ] Performance optimizations
   - [ ] Testing and documentation

---

## Notes

- **UI Theme Storage**: User's chosen theme is stored in `Preference.ui_theme` (values: 'dark' or 'light')
- **Concepts**: Each problem has `primary_concept` (string) and `secondary_concepts` (JSON array)
- **No Hierarchies**: Problems are now flat - no Theme/Section/Concept nesting
- **JSON Fields**: Used for flexibility (interest_areas, learned_concepts, secondary_concepts, interest_tags, sql_schema, solved_problem_ids)
- **Frontend i18n**: All display text translations handled in frontend, backend sends keys/enums only
