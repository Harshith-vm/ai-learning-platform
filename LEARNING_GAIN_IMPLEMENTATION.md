# Learning Gain Pipeline - Implementation Guide

## Overview
The learning gain pipeline has been fully implemented with pre-test and post-test flows that measure learning improvement.

## Architecture

### 1. State Management (`frontend/contexts/DocumentContext.tsx`)
```typescript
learningGainState: {
  preTestCompleted: boolean;
  preTestScore: number | null;
  postTestCompleted: boolean;
  postTestScore: number | null;
  learningGain: number | null;
}
```

### 2. Pages Created

#### Main Hub: `/learning-gain`
- **File**: `frontend/app/(dashboard)/learning-gain/page.tsx`
- **Purpose**: Orchestrates the 3-stage learning journey
- **Features**:
  - Visual progress indicators
  - Stage locking (post-test locked until pre-test complete)
  - Score display for completed tests
  - Learning gain results display

#### Pre-Test: `/learning-gain/pre-test/[documentId]`
- **File**: `frontend/app/(dashboard)/learning-gain/pre-test/[documentId]/page.tsx`
- **Backend Endpoint**: `POST /learning/pre-test/{document_id}`
- **Submit Endpoint**: `POST /learning/pre-test/submit/{document_id}`
- **Flow**:
  1. Fetches pre-test MCQs from backend
  2. User answers questions
  3. Submits answers with format:
     ```json
     {
       "answers": [
         { "question_index": 0, "selected_option_index": 2 },
         { "question_index": 1, "selected_option_index": 1 }
       ]
     }
     ```
  4. Stores score in context
  5. Redirects to learning gain hub

#### Post-Test: `/learning-gain/post-test/[documentId]`
- **File**: `frontend/app/(dashboard)/learning-gain/post-test/[documentId]/page.tsx`
- **Backend Endpoint**: `POST /learning/post-test/{document_id}`
- **Submit Endpoint**: `POST /learning/post-test/submit/{document_id}`
- **Flow**:
  1. Checks pre-test completion (redirects if not done)
  2. Fetches post-test MCQs from backend
  3. User answers questions
  4. Submits answers (same format as pre-test)
  5. Receives learning gain calculation from backend
  6. Stores results in context and sessionStorage
  7. Redirects to learning gain hub

### 3. MCQPlayer Updates
- **File**: `frontend/components/mcq/MCQPlayer.tsx`
- **New Props**:
  - `onComplete?: (answers: number[], score: number, totalQuestions: number) => void`
  - `mode?: "normal" | "pre-test" | "post-test"`
- **Behavior**:
  - Tracks user answers throughout the quiz
  - Calls `onComplete` callback when quiz finishes
  - Passes answers array to parent component for submission

## User Journey

### Step 1: Upload Document
```
User uploads document → Document ID generated → Summary created
```

### Step 2: Start Learning Gain
```
User clicks "Measure Learning Gain" → Navigate to /learning-gain
```

### Step 3: Pre-Test
```
Click "Start Pre-Test" → /learning-gain/pre-test/{documentId}
↓
Backend generates fresh MCQs
↓
User answers questions
↓
Submit to backend
↓
Pre-test score stored (e.g., 30%)
↓
Return to learning gain hub
```

### Step 4: Study Phase
```
"Study Materials" button unlocked
↓
User reviews summary, flashcards, key points
↓
User decides when ready for post-test
```

### Step 5: Post-Test
```
Click "Start Post-Test" → /learning-gain/post-test/{documentId}
↓
Backend generates NEW MCQs (different from pre-test)
↓
User answers questions
↓
Submit to backend
↓
Backend calculates learning gain
↓
Results stored (e.g., post-score: 80%, gain: +50%)
↓
Return to learning gain hub
```

### Step 6: View Results
```
Learning gain hub shows:
- Pre-Test: ✓ Completed (30%)
- Study: ✓ Completed
- Post-Test: ✓ Completed (80%)
- Learning Gain: +50% 🎉
↓
Click "View Detailed Analysis" → /learning-gain/{documentId}
```

## Backend Integration

### Pre-Test Generation
```typescript
const response = await fetch(
  `http://127.0.0.1:8000/learning/pre-test/${documentId}`,
  { method: "POST" }
);
const data = await response.json();
// data.mcqs contains MCQ array
```

### Pre-Test Submission
```typescript
const response = await fetch(
  `http://127.0.0.1:8000/learning/pre-test/submit/${documentId}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: [
        { question_index: 0, selected_option_index: 2 },
        { question_index: 1, selected_option_index: 1 }
      ]
    })
  }
);
const result = await response.json();
// result.score_percentage contains the score
```

### Post-Test Generation
```typescript
const response = await fetch(
  `http://127.0.0.1:8000/learning/post-test/${documentId}`,
  { method: "POST" }
);
const data = await response.json();
// data.mcqs contains NEW MCQ array
```

### Post-Test Submission
```typescript
const response = await fetch(
  `http://127.0.0.1:8000/learning/post-test/submit/${documentId}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      answers: [
        { question_index: 0, selected_option_index: 1 },
        { question_index: 1, selected_option_index: 3 }
      ]
    })
  }
);
const result = await response.json();
// result contains:
// - pre_score: number
// - post_score: number
// - learning_gain_percentage: number
// - concept_performance: object (optional)
// - learning_insight: string (optional)
```

## UI Components

### Learning Gain Hub
- **3 Stage Cards**: Pre-Test, Study, Post-Test
- **Status Indicators**:
  - ✓ Green checkmark = Completed
  - 🔵 Blue circle = Active/Available
  - 🔒 Gray lock = Locked
- **Score Display**: Shows percentage for completed tests
- **Learning Gain Banner**: Appears when both tests complete

### Pre-Test/Post-Test Pages
- **Header Badge**: Distinguishes pre-test vs post-test
- **MCQ Player**: Full quiz interface with progress bar
- **Keyboard Controls**: 1-4 for options, Enter to submit
- **Explanations**: Shown after each answer

## Navigation

### Added to Sidebar
```
Learning Gain → /learning-gain
```

### Added to Dashboard
```
Learning Gain feature card with amber/orange gradient
```

### Added to Summary Page
```
"Measure Learning Gain" button in Next Steps section
```

## Data Persistence

### SessionStorage Keys
- `learningGainState`: Current progress state
- `learning_gain_{documentId}`: Detailed results for results page

### Context State
All learning gain state persists across navigation within the same session.

## Testing the Flow

1. **Upload a document** at `/upload`
2. **View summary** at `/summarize`
3. **Click "Measure Learning Gain"** → Navigate to `/learning-gain`
4. **Start Pre-Test** → Answer questions → See score
5. **Study materials** → Review summary/flashcards
6. **Start Post-Test** → Answer questions → See improvement
7. **View results** → See learning gain percentage

## Key Features

✅ Separate pre-test and post-test MCQ generation
✅ Progress tracking with visual indicators
✅ Stage locking (can't skip pre-test)
✅ Score persistence across navigation
✅ Learning gain calculation from backend
✅ Seamless integration with existing MCQ system
✅ No backend modifications required
✅ Responsive design with premium dark theme

## Files Modified/Created

### Created:
- `frontend/app/(dashboard)/learning-gain/page.tsx`
- `frontend/app/(dashboard)/learning-gain/pre-test/[documentId]/page.tsx`
- `frontend/app/(dashboard)/learning-gain/post-test/[documentId]/page.tsx`

### Modified:
- `frontend/contexts/DocumentContext.tsx` - Added learning gain state
- `frontend/components/mcq/MCQPlayer.tsx` - Added onComplete callback and mode prop
- `frontend/components/layout/Sidebar.tsx` - Updated Learning Gain link
- `frontend/app/(dashboard)/dashboard/page.tsx` - Added Learning Gain feature card
- `frontend/components/summary/SummaryCard.tsx` - Added Learning Gain button

## Success Criteria

✅ Pre-test generates unique MCQs
✅ Post-test generates different MCQs
✅ Scores are tracked separately
✅ Learning gain is calculated correctly
✅ UI shows clear progress through stages
✅ Users cannot skip pre-test
✅ All data persists across navigation
✅ Backend integration works correctly

The learning gain pipeline is now fully operational! 🎉
