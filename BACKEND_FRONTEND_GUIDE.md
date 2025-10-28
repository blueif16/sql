# Django ORM & Frontend-Backend Interaction Guide

## 📊 Database Structure Overview

```
users ──┬─→ user_roles
        ├─→ preferences (1-to-1)
        ├─→ submissions
        ├─→ user_progress (1-to-1)
        └─→ chat_threads

concepts ──→ problems.primary_concept (reference)
interest_areas ──→ preferences.interest_areas (JSON field)

problems ──┬─→ submissions
           └─→ chat_threads

chat_threads ──→ chat_messages
```

## 🗂️ Django ORM Models

### Core Models

#### **User** - User table
```python
Fields: email, username, language, created_at, is_active
Relations: roles(many), preference(1-to-1), submissions(many), progress(1-to-1), chat_threads(many)
```

#### **Preference** - User preferences (1-to-1)
```python
Fields: difficulty_preference, learning_style, interest_areas[JSON], learned_concepts[JSON], ui_theme
Relations: user(1-to-1)
Purpose: Store user's learning preferences and settings
```

#### **Concept** - SQL concepts library (predefined)
```python
Fields: name, name_zh, name_en, description, description_zh, description_en, difficulty_level, prerequisites[JSON]
Purpose: Topic selection for problem generation
Examples: INNER_JOIN, GROUP_BY, SUBQUERIES
```

#### **InterestArea** - Interest areas
```python
Fields: name, display_name_zh, display_name_en, description, icon, category
Purpose: Personalize problem scenarios (movies, football, ecommerce, etc.)
```

#### **Problem** - Problems table
```python
Fields: title, description, difficulty, primary_concept, secondary_concepts[JSON], interest_tags[JSON], sql_schema(TEXT)
Relations: submissions(many), chat_threads(many)
```

#### **Submission** - Submission records
```python
Fields: user(FK), problem(FK), sql_code, is_correct, submitted_at
Indexes: (user,problem), (user,submitted_at)
```

#### **UserProgress** - User progress (1-to-1)
```python
Fields: user(1-to-1), solved_problem_ids[JSON]
Purpose: Track list of solved problem IDs
```

#### **ChatThread + ChatMessage** - Chat system
```python
ChatThread: thread_id, user(FK), problem(FK), language
ChatMessage: thread(FK), message_type, content, metadata[JSON]
```

---

## 🔄 Frontend-Backend Interaction Flows

### 1️⃣ Initialization Flow

```
[Frontend Startup] 
  ↓
api.js: userAPI.autoLogin() → POST /auth/auto-login/
  ↓
[Backend] views.py: auto_login()
  ├─ Query: User.objects.get_or_create(email='guest@example.com')
  ├─ Django session login
  └─ Return user data
  ↓
[Response] { user: {id, username, email, language}, message }
  ↓
[Frontend] Store in localStorage + CSRF token
```

**Code References**:
- Frontend: `api.js:64` userAPI.autoLogin
- Backend: `views.py:34-70` auto_login function

---

### 2️⃣ API Request Authentication Flow

```
[Frontend Request]
  ↓
api.js interceptor (line 22-51):
  ├─ Read csrftoken from cookie → headers['X-CSRFToken']
  ├─ Read user.token from localStorage → headers['Authorization']
  └─ Read language from localStorage → headers['Accept-Language']
  ↓
[Backend Receives]
  ↓
Django middleware validates CSRF + Session
  ↓
[Backend View] request.user gets current user
```

**Code References**:
- Frontend interceptor: `api.js:22-51` request interceptor
- Response interceptor: `api.js:53-61` (401 auto-logout)

---

### 3️⃣ Get Concepts List (with Progress)

```
[Frontend] conceptAPI.getConceptsWithProgress() → GET /concepts/with_progress/
  ↓
[Backend] ConceptViewSet.with_progress (views.py:105-186)
  ├─ Query 1: Concept.objects.filter(is_active=True).order_by('name')
  ├─ Query 2: UserProgress.objects.get(user=request.user)
  ├─ Query 3: Problem.objects.filter(id__in=progress.solved_problem_ids)
  ├─ Query 4: Problem.objects.filter(is_active=True) [count per concept]
  └─ Group by difficulty_level → {beginner:[], intermediate:[], advanced:[]}
  ↓
[Response] { beginner: [{name, localized_name, solved, total, progress_percentage},...], ... }
```

**Code References**:
- Frontend: `api.js:98-101` conceptAPI
- Backend: `views.py:105-186` ConceptViewSet.with_progress
- Serializer: `serializers.py:19-65` ConceptSerializer

---

### 4️⃣ Generate New Problem - DETAILED FLOW

```
[Frontend] problemAPI.generateProblem({topic: 'INNER_JOIN'}) → POST /problems/generate/
  ↓
[Backend] ProblemViewSet.generate (views.py:367-441)
  │
  ├─ STEP 1: Validate Topic
  │   └─ Query 1: Concept.objects.get(name='INNER_JOIN', is_active=True)
  │       → SELECT * FROM concepts WHERE name='INNER_JOIN' AND is_active=1
  │       → Returns: {id, name, description_zh, description_en, difficulty_level, prerequisites}
  │
  ├─ STEP 2: Fetch User Preferences
  │   └─ Query 2: Preference.objects.get_or_create(user=request.user)
  │       → SELECT * FROM preferences WHERE user_id=<user_id>
  │       → If not exists: INSERT INTO preferences (user_id, difficulty_preference, interest_areas, ...)
  │       → Returns: {difficulty_preference: 'medium', interest_areas: ['movie', 'sports'], learning_style: 'guided'}
  │
  ├─ STEP 3: Select Localized Concept Description
  │   └─ Get user.language from request.user.language
  │       If language=='zh' → use concept.description_zh
  │       If language=='en' → use concept.description_en
  │       → topic_info = concept.description_zh (example)
  │
  ├─ STEP 4: Call ProblemGenerator (problem_generator.py:21-122)
  │   └─ ProblemGenerator.generate_problem(
  │         topic='INNER_JOIN',
  │         topic_info='内连接用于...',
  │         interest_tags=['movie', 'sports'],
  │         difficulty_preference='medium',
  │         language='zh'
  │       )
  │       │
  │       ├─ Build OpenAI Prompt:
  │       │   System: "You are an expert SQL problem generator..."
  │       │   User: "Generate a SQL problem about INNER_JOIN with difficulty medium,
  │       │          based on movie/sports themes, in Chinese language..."
  │       │
  │       ├─ Call OpenAI API (gpt-4o-mini):
  │       │   → Request: ChatCompletion with structured output (Pydantic model)
  │       │   → Response Time: ~5-15 seconds
  │       │
  │       └─ Parse Structured Output:
  │           Returns: GeneratedProblem(
  │             title="查询电影演员信息",
  │             description="给定两个表：movies和actors，使用INNER JOIN查询...",
  │             sql_schema="```sql\nCREATE TABLE movies...",
  │             difficulty="medium",
  │             primary_concept="INNER_JOIN",
  │             secondary_concepts=["SELECT", "WHERE"],
  │             interest_tags=["movie"],
  │             is_active=True
  │           )
  │
  ├─ STEP 5: Save to Database
  │   └─ Query 3: Problem.objects.create(**problem_dict)
  │       → INSERT INTO problems (
  │           title, description, sql_schema, difficulty,
  │           primary_concept, secondary_concepts, interest_tags, is_active
  │         ) VALUES (...)
  │       → Returns: Problem instance with auto-generated id=42
  │
  ├─ STEP 6: Serialize Response
  │   └─ ProblemSerializer(problem)
  │       ├─ Query 4 (implicit): Concept.objects.get(name='INNER_JOIN')
  │       │   → Fetch concept_info for response
  │       └─ Returns serialized data with localized fields
  │
  └─ [Response] {
      success: true,
      message: "问题生成成功",
      problem: {
        id: 42,
        title: "查询电影演员信息",
        description: "...",
        sql_schema: "CREATE TABLE movies...",
        difficulty: "medium",
        primary_concept: "INNER_JOIN",
        secondary_concepts: ["SELECT", "WHERE"],
        interest_tags: ["movie"],
        concept_info: {
          name: "INNER_JOIN",
          localized_name: "内连接",
          localized_description: "...",
          difficulty_level: "intermediate",
          prerequisites: ["SELECT", "FROM"]
        }
      }
    }
```

**Database Queries Summary**:
1. `SELECT * FROM concepts WHERE name=? AND is_active=1` - Validate topic
2. `SELECT * FROM preferences WHERE user_id=?` - Get user preferences (or INSERT if not exists)
3. `INSERT INTO problems (...)` - Save generated problem
4. `SELECT * FROM concepts WHERE name=?` - Fetch concept info for serializer

**External API Calls**:
- OpenAI ChatCompletion API (5-15 seconds, depends on response length)

**Code References**:
- Frontend: `api.js:83` problemAPI.generateProblem
- Backend View: `views.py:367-441` ProblemViewSet.generate
- Generator: `problem_generator.py:21-122` ProblemGenerator.generate_problem
- Serializer: `serializers.py:150-193` ProblemSerializer.get_concept_info

---

### 5️⃣ Submit SQL Answer

```
[Frontend] problemAPI.submitQuery(problemId, {sql_code: '...'}) → POST /problems/{id}/submit/
  ↓
[Backend] ProblemViewSet.submit (views.py:307-342)
  ├─ Query 1: Problem.objects.get(id=problemId, is_active=True)
  ├─ Validate SQL: is_correct = 'select' in sql_code.lower()  # Simplified
  ├─ Query 2: Submission.objects.create(user, problem, sql_code, is_correct)
  │   → INSERT INTO submissions (user_id, problem_id, sql_code, is_correct, submitted_at)
  ├─ If correct:
  │   └─ Query 3: UserProgress.objects.get_or_create(user=request.user)
  │       Query 4: progress.solved_problem_ids.append(problem.id) + progress.save()
  │       → UPDATE user_progress SET solved_problem_ids='[1,5,12,42]' WHERE user_id=?
  └─ Return result
  ↓
[Response] { submission_id, is_correct, message }
```

**Code References**:
- Frontend: `api.js:81` problemAPI.submitQuery
- Backend: `views.py:307-342` ProblemViewSet.submit

---

### 6️⃣ AI Chat Interaction (Streaming)

```
[Frontend] chatAPI.streamMessage({message, thread_id, problem_id}, onChunk, onDone)
  ↓
Use fetch() API → POST /chat/stream/ (not axios, streaming needed)
  ↓
[Backend] ChatViewSet.stream (views.py:639-687)
  ├─ Initialize: SQLChatbot()
  ├─ Call: chatbot.chat_stream(message, thread_id, user, problem_id, language)
  │   ├─ Query 1: ChatThread.objects.get_or_create(thread_id=?, user=?)
  │   │   → SELECT * FROM chat_threads WHERE thread_id=? / INSERT if not exists
  │   ├─ Query 2: ChatMessage.objects.create(thread=thread, message_type='human', content=message)
  │   │   → INSERT INTO chat_messages (thread_id, message_type, content, created_at)
  │   ├─ LangChain calls OpenAI streaming API
  │   └─ Query 3: ChatMessage.objects.create(thread=thread, message_type='ai', content=full_response)
  │       → INSERT INTO chat_messages (thread_id, message_type, content, created_at)
  └─ StreamingHttpResponse: yield "data: {chunk}\n\n" 
  ↓
[Frontend] fetch reads stream → onChunk displays char-by-char → onDone complete
```

**Code References**:
- Frontend: `api.js:117-187` chatAPI.streamMessage (fetch implementation)
- Backend: `views.py:639-687` ChatViewSet.stream
- Chatbot: `chatbot.py:34-249` SQLChatbot

---

### 7️⃣ Update User Preferences

```
[Frontend] preferenceAPI.updatePreferences({difficulty_preference: 'hard'}) → PATCH /preferences/me/
  ↓
[Backend] PreferenceViewSet.me (views.py:229-244)
  ├─ Query 1: Preference.objects.get_or_create(user=request.user)
  │   → SELECT * FROM preferences WHERE user_id=? / INSERT if not exists
  ├─ Validate: PreferenceSerializer(partial=True)
  └─ Query 2: serializer.save()
      → UPDATE preferences SET difficulty_preference='hard', updated_at=NOW() WHERE user_id=?
  ↓
[Response] Updated preference object
```

**Code References**:
- Frontend: `api.js:73-76` preferenceAPI
- Backend: `views.py:229-244` PreferenceViewSet.me
- Serializer: `serializers.py:124-136` PreferenceSerializer

---

## 🔍 Key ORM Query Patterns

### 1. Fetch User Data with Relations
```python
# Common pattern in views.py
user = request.user  # Django auto-retrieves from session
preference = Preference.objects.get_or_create(user=user)  # 1-to-1
progress = UserProgress.objects.get(user=user)  # 1-to-1
submissions = Submission.objects.filter(user=user)  # 1-to-many (reverse: user.submissions.all())
```

### 2. Filtering Queries
```python
# views.py:264-278 ProblemViewSet.get_queryset
Problem.objects.filter(
    is_active=True,
    difficulty='medium',
    primary_concept='INNER_JOIN',
    interest_tags__contains=['movie']  # JSON field contains query
)
```

### 3. Aggregation & Stats
```python
# views.py:524-553 UserProgressViewSet.stats
total_problems = Problem.objects.filter(is_active=True).count()
difficulty_stats = solved_problems.filter(difficulty='easy').count()
```

### 4. Optimizing Relational Queries
```python
# serializers.py:195-209 SubmissionSerializer
# Use 'source' to access FK fields, avoiding N+1 queries
username = serializers.CharField(source='user.username', read_only=True)
problem_title = serializers.CharField(source='problem.title', read_only=True)
```

---

## 🌐 Internationalization (i18n)

### Language Switching Flow
```
1. User selects language → localStorage.setItem('language', 'zh')
2. api.js interceptor → headers['Accept-Language'] = 'zh'
3. Backend serializer reads → request.META.get('HTTP_ACCEPT_LANGUAGE')
4. Return localized_name/localized_description (zh/en fields)
```

**Code References**:
- Frontend: `api.js:44-46` language header
- Backend: `serializers.py:28-64` get_localized_name/description
- Models: `models.py:88-105` Concept bilingual fields

---

## 📦 Configuration Management

### Frontend Config (`frontend/src/config/constants.js`)
```javascript
APP_CONFIG: { API_BASE_URL: 'http://localhost:8000/api' }
USER_CONFIG: { SESSION_KEY: 'leetcode_sql_user' }
LANGUAGE_CONFIG: { STORAGE_KEY: 'language', DEFAULT_LANGUAGE: 'en' }
```

### Backend Config (`backend/myproject/settings.py`)
```python
DATABASES = { 'default': { 'ENGINE': 'django.db.backends.sqlite3' } }
REST_FRAMEWORK = { 'DEFAULT_PERMISSION_CLASSES': [...] }
CORS_ALLOWED_ORIGINS = ['http://localhost:3000']
```

---

## 🚀 Core API Endpoints Reference

| API Endpoint | Method | Purpose | Frontend Call | Backend View |
|--------------|--------|---------|---------------|--------------|
| `/auth/auto-login/` | POST | Auto login | `userAPI.autoLogin()` | `auto_login` |
| `/concepts/with_progress/` | GET | Get concepts+progress | `conceptAPI.getConceptsWithProgress()` | `ConceptViewSet.with_progress` |
| `/problems/` | GET | List problems | `problemAPI.getProblems(params)` | `ProblemViewSet.list` |
| `/problems/generate/` | POST | Generate problem | `problemAPI.generateProblem(data)` | `ProblemViewSet.generate` |
| `/problems/{id}/submit/` | POST | Submit answer | `problemAPI.submitQuery(id,data)` | `ProblemViewSet.submit` |
| `/preferences/me/` | GET/PATCH | User preferences | `preferenceAPI.updatePreferences()` | `PreferenceViewSet.me` |
| `/chat/stream/` | POST | Streaming chat | `chatAPI.streamMessage()` | `ChatViewSet.stream` |
| `/progress/stats/` | GET | User stats | `statsAPI.getUserStats()` | `UserProgressViewSet.stats` |

---

## 💡 Best Practices

### 1. Frontend API Calls
```javascript
// Use unified api instance, auto-handles auth and errors
import { problemAPI } from '@/services/api';
const data = await problemAPI.getProblems({ difficulty: 'medium' });
```

### 2. Backend Permission Control
```python
# Use decorators in views.py
@permission_classes([IsAuthenticated])  # Requires login
@permission_classes([AllowAny])  # Public endpoint
```

### 3. ORM Performance Optimization
```python
# Use select_related/prefetch_related to reduce queries
Submission.objects.select_related('user', 'problem').filter(...)
```

### 4. Error Handling
```python
# Backend unified error format
return Response({'error': 'message'}, status=status.HTTP_400_BAD_REQUEST)
# Frontend interceptor auto-handles 401 redirect
```

---

## 📝 Summary

**Data Flow**: User Action → React Component → api.js(axios) → Django REST ViewSet → ORM → SQLite → Serializer → JSON Response → Frontend Render

**Core Advantages**:
- Django ORM auto-handles SQL queries and relations
- REST framework auto-generates RESTful APIs
- Serializers handle validation and transformation
- Frontend api.js centrally manages all HTTP requests
- Interceptors auto-handle auth/language/errors

**Extension Points**:
- Add new model in models.py → makemigrations/migrate
- Add new endpoint in views.py → register route in urls.py
- Add new API method in api.js → call from frontend components

