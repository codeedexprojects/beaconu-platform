# GET /api/v1/student/assessments/attempts/:id/sections/:sectionId/questions

One example response per canonical question type (see [assessment-question-types.md](./assessment-question-types.md) for the full type registry).

## Endpoint shape

Returns **one question at a time**, not the whole section's list — matches a "one question per screen, Next/Previous button" take-test UI.

```
GET /api/v1/student/assessments/attempts/{{assessmentAttemptId}}/sections/{{assessmentSectionId}}/questions?question_order=1
```

- `question_order` (query param, 1-based, defaults to `1`) selects which question in the section to return.
- To move to the next question: re-call with `question_order + 1` — use the response's own `hasNext` to know whether to show a "Next" button.
- 404 `"Question not found"` if `question_order` is out of range for the section.

## Response envelope

```json
{
  "success": true,
  "message": "Question fetched",
  "data": {
    "question": { "...": "AttemptQuestionItem, see below" },
    "questionOrder": 1,
    "totalQuestions": 4,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

`question` never includes `answerKey` — content only. `question.responseFormat` tells the client which answer widget to render; `question.myAnswer` reflects any prior save for that question (`null` if never touched).

---

## Verbal Communication section

### audioSpeakingResponse

```json
{
  "success": true,
  "message": "Question fetched",
  "data": {
    "question": {
      "id": "PQS-40",
      "questionId": "QST-40",
      "questionOrder": 1,
      "questionTypeId": "QTP-audioSpeakingResponse",
      "questionTypeName": "Audio Speaking Response",
      "responseFormat": "audio_response",
      "content": {
        "text": "Listen to the question and respond appropriately.",
        "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3"
      },
      "marks": 5,
      "timeLimitSecs": 60,
      "myAnswer": null
    },
    "questionOrder": 1,
    "totalQuestions": 4,
    "hasNext": true,
    "hasPrevious": false
  },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

### repeatSentence

```json
{
  "success": true,
  "message": "Question fetched",
  "data": {
    "question": {
      "id": "PQS-41",
      "questionId": "QST-41",
      "questionOrder": 2,
      "questionTypeId": "QTP-repeatSentence",
      "questionTypeName": "Repeat Sentence",
      "responseFormat": "audio_response",
      "content": {
        "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3"
      },
      "marks": 5,
      "timeLimitSecs": 60,
      "myAnswer": null
    },
    "questionOrder": 2,
    "totalQuestions": 4,
    "hasNext": true,
    "hasPrevious": true
  },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

### readAloud

```json
{
  "success": true,
  "message": "Question fetched",
  "data": {
    "question": {
      "id": "PQS-42",
      "questionId": "QST-42",
      "questionOrder": 3,
      "questionTypeId": "QTP-readAloud",
      "questionTypeName": "Read Aloud",
      "responseFormat": "audio_response",
      "content": {
        "text": "Read the following passage aloud: The quick brown fox jumps over the lazy dog."
      },
      "marks": 5,
      "timeLimitSecs": 60,
      "myAnswer": null
    },
    "questionOrder": 3,
    "totalQuestions": 4,
    "hasNext": true,
    "hasPrevious": true
  },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

### describeImage

```json
{
  "success": true,
  "message": "Question fetched",
  "data": {
    "question": {
      "id": "PQS-44",
      "questionId": "QST-44",
      "questionOrder": 4,
      "questionTypeId": "QTP-describeImage",
      "questionTypeName": "Describe Image",
      "responseFormat": "audio_response",
      "content": {
        "text": "Describe what is happening in the image, focusing on the setting and mood.",
        "imageUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.png"
      },
      "marks": 5,
      "timeLimitSecs": 60,
      "myAnswer": {
        "response": {
          "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/student/STU-12/assessments/answer-recording.mp3"
        },
        "isFlagged": false,
        "answeredAt": "2026-07-31T12:05:00.000Z"
      }
    },
    "questionOrder": 4,
    "totalQuestions": 4,
    "hasNext": false,
    "hasPrevious": true
  },
  "timestamp": "2026-07-31T12:00:00.000Z"
}
```

_(This example shows the shape once `myAnswer` is populated — for an `audio_response`/`audioRecording` type the student's submitted recording URL is carried in `response.audioUrl`, a dedicated field, distinct from `content.audioUrl` which is the question's own prompt audio. See [assessment-answer-submissions.md](./assessment-answer-submissions.md) for the full request-body reference across every response type.)_

---

## Aptitude & Logical Reasoning section

### mcqSingle

```json
{
  "question": {
    "id": "PQS-23",
    "questionId": "QST-23",
    "questionOrder": 1,
    "questionTypeId": "QTP-mcqSingle",
    "questionTypeName": "MCQ (Single Answer)",
    "responseFormat": "single_choice",
    "content": {
      "text": "Which of these numbers is prime?",
      "options": [
        { "id": "o1", "text": "4" },
        { "id": "o2", "text": "7" },
        { "id": "o3", "text": "9" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 1,
  "totalQuestions": 5,
  "hasNext": true,
  "hasPrevious": false
}
```

### mcqMultiple

```json
{
  "question": {
    "id": "PQS-24",
    "questionId": "QST-24",
    "questionOrder": 2,
    "questionTypeId": "QTP-mcqMultiple",
    "questionTypeName": "MCQ (Multiple Answers)",
    "responseFormat": "multi_choice",
    "content": {
      "text": "Select all the prime numbers.",
      "options": [
        { "id": "o1", "text": "4" },
        { "id": "o2", "text": "7" },
        { "id": "o3", "text": "11" },
        { "id": "o4", "text": "9" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": {
      "response": { "selectedOptionIds": ["o2", "o3"] },
      "isFlagged": false,
      "answeredAt": "2026-07-31T12:03:00.000Z"
    }
  },
  "questionOrder": 2,
  "totalQuestions": 5,
  "hasNext": true,
  "hasPrevious": true
}
```

### dragAndDropFill

```json
{
  "question": {
    "id": "PQS-25",
    "questionId": "QST-25",
    "questionOrder": 3,
    "questionTypeId": "QTP-dragAndDropFill",
    "questionTypeName": "Fill in the Blanks — Drag & Drop",
    "responseFormat": "fill_blank_drag_drop",
    "content": {
      "text": "The cat sat on the ___ and looked at the ___.",
      "options": [
        { "id": "w1", "text": "mat" },
        { "id": "w2", "text": "moon" },
        { "id": "w3", "text": "tree" }
      ],
      "blanks": [{ "id": "b1" }, { "id": "b2" }]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 3,
  "totalQuestions": 5,
  "hasNext": true,
  "hasPrevious": true
}
```

### dropdownFill

```json
{
  "question": {
    "id": "PQS-26",
    "questionId": "QST-26",
    "questionOrder": 4,
    "questionTypeId": "QTP-dropdownFill",
    "questionTypeName": "Fill in the Blanks — Drop Down",
    "responseFormat": "fill_blank_dropdown",
    "content": {
      "text": "Water boils at ___ degrees Celsius at sea level and freezes at ___.",
      "options": [
        { "id": "d1", "text": "100" },
        { "id": "d2", "text": "0" },
        { "id": "d3", "text": "50" }
      ],
      "blanks": [{ "id": "b1" }, { "id": "b2" }]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 4,
  "totalQuestions": 5,
  "hasNext": true,
  "hasPrevious": true
}
```

### dataInterpretation

```json
{
  "question": {
    "id": "PQS-43",
    "questionId": "QST-43",
    "questionOrder": 5,
    "questionTypeId": "QTP-dataInterpretation",
    "questionTypeName": "Data Interpretation",
    "responseFormat": "text_response",
    "content": {
      "text": "Based on the chart, analyze which quarter had the highest growth and explain why.",
      "imageUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.png"
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 5,
  "totalQuestions": 5,
  "hasNext": false,
  "hasPrevious": true
}
```

---

## Written Communication section

### essay

```json
{
  "question": {
    "id": "PQS-27",
    "questionId": "QST-27",
    "questionOrder": 1,
    "questionTypeId": "QTP-essay",
    "questionTypeName": "Writing Essay",
    "responseFormat": "text_response",
    "content": {
      "text": "Write a 250-word essay on the importance of time management."
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 1,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": false
}
```

### textSummary

```json
{
  "question": {
    "id": "PQS-28",
    "questionId": "QST-28",
    "questionOrder": 2,
    "questionTypeId": "QTP-textSummary",
    "questionTypeName": "Summary",
    "responseFormat": "text_response",
    "content": {
      "text": "Read the following passage and summarize it in 100 words: Renewable energy sources like solar and wind power are becoming increasingly cost-competitive with fossil fuels..."
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 2,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### email

```json
{
  "question": {
    "id": "PQS-29",
    "questionId": "QST-29",
    "questionOrder": 3,
    "questionTypeId": "QTP-email",
    "questionTypeName": "Email",
    "responseFormat": "text_response",
    "content": {
      "text": "Write a formal email to your professor requesting an extension for your assignment submission."
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 3,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### letter

```json
{
  "question": {
    "id": "PQS-30",
    "questionId": "QST-30",
    "questionOrder": 4,
    "questionTypeId": "QTP-letter",
    "questionTypeName": "Letter Writing",
    "responseFormat": "text_response",
    "content": {
      "text": "Write a letter to the editor of a newspaper about increasing traffic congestion in your city."
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 4,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### notice

```json
{
  "question": {
    "id": "PQS-31",
    "questionId": "QST-31",
    "questionOrder": 5,
    "questionTypeId": "QTP-notice",
    "questionTypeName": "Notice Writing",
    "responseFormat": "text_response",
    "content": {
      "text": "Draft a notice for your college notice board announcing the annual sports day."
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 5,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### dialogueCompletion

```json
{
  "question": {
    "id": "PQS-32",
    "questionId": "QST-32",
    "questionOrder": 6,
    "questionTypeId": "QTP-dialogueCompletion",
    "questionTypeName": "Dialogue Completion",
    "responseFormat": "text_response",
    "content": {
      "text": "Complete the dialogue: A: Excuse me, could you tell me how to get to the library? B: ___"
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 6,
  "totalQuestions": 6,
  "hasNext": false,
  "hasPrevious": true
}
```

---

## Listening & Reading section

### summarizeSpokenText

```json
{
  "question": {
    "id": "PQS-33",
    "questionId": "QST-33",
    "questionOrder": 1,
    "questionTypeId": "QTP-summarizeSpokenText",
    "questionTypeName": "Summarize Spoken Text",
    "responseFormat": "text_response",
    "content": {
      "text": "Listen to the audio and summarize the key points in your own words.",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3"
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 1,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": false
}
```

### audioMcqMultiple

```json
{
  "question": {
    "id": "PQS-34",
    "questionId": "QST-34",
    "questionOrder": 2,
    "questionTypeId": "QTP-audioMcqMultiple",
    "questionTypeName": "Audio MCQ (Multiple Answers)",
    "responseFormat": "multi_choice",
    "content": {
      "text": "Listen to the audio and select all correct statements.",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3",
      "options": [
        { "id": "a1", "text": "The meeting was postponed" },
        { "id": "a2", "text": "The venue changed" },
        { "id": "a3", "text": "No changes were made" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 2,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### audioDropdownFill

```json
{
  "question": {
    "id": "PQS-35",
    "questionId": "QST-35",
    "questionOrder": 3,
    "questionTypeId": "QTP-audioDropdownFill",
    "questionTypeName": "Audio Fill in the Blanks — Drop Down",
    "responseFormat": "fill_blank_dropdown",
    "content": {
      "text": "Listen to the audio and fill in the blanks: The train departs at ___ and arrives at ___.",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3",
      "options": [
        { "id": "t1", "text": "9:00 AM" },
        { "id": "t2", "text": "11:30 AM" }
      ],
      "blanks": [{ "id": "b1" }, { "id": "b2" }]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 3,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### audioDragAndDropFill

```json
{
  "question": {
    "id": "PQS-36",
    "questionId": "QST-36",
    "questionOrder": 4,
    "questionTypeId": "QTP-audioDragAndDropFill",
    "questionTypeName": "Audio Fill in the Blanks — Drag & Drop",
    "responseFormat": "fill_blank_drag_drop",
    "content": {
      "text": "Listen to the audio, then fill in: The speaker recommends ___ before ___.",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3",
      "options": [
        { "id": "w1", "text": "reviewing notes" },
        { "id": "w2", "text": "the exam" }
      ],
      "blanks": [{ "id": "b1" }, { "id": "b2" }]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 4,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### audioBestOption

```json
{
  "question": {
    "id": "PQS-37",
    "questionId": "QST-37",
    "questionOrder": 5,
    "questionTypeId": "QTP-audioBestOption",
    "questionTypeName": "Audio Best-Matching Option",
    "responseFormat": "single_choice",
    "content": {
      "text": "Listen to the audio and choose the option that best matches the speaker's opinion.",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3",
      "options": [
        { "id": "o1", "text": "Strongly agrees" },
        { "id": "o2", "text": "Strongly disagrees" },
        { "id": "o3", "text": "Neutral" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 5,
  "totalQuestions": 6,
  "hasNext": true,
  "hasPrevious": true
}
```

### audioMcqSingle

```json
{
  "question": {
    "id": "PQS-38",
    "questionId": "QST-38",
    "questionOrder": 6,
    "questionTypeId": "QTP-audioMcqSingle",
    "questionTypeName": "Audio MCQ (Single Answer)",
    "responseFormat": "single_choice",
    "content": {
      "text": "Listen to the audio. The passage states the meeting was rescheduled. True or False?",
      "audioUrl": "https://beaconu-bucket.s3.ap-south-1.amazonaws.com/college/CLG-10/assessments/seed-placeholder.mp3",
      "options": [
        { "id": "trueopt", "text": "True" },
        { "id": "falseopt", "text": "False" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": null
  },
  "questionOrder": 6,
  "totalQuestions": 6,
  "hasNext": false,
  "hasPrevious": true
}
```

---

## Leadership Qualities section

### highlightWords

```json
{
  "question": {
    "id": "PQS-39",
    "questionId": "QST-39",
    "questionOrder": 1,
    "questionTypeId": "QTP-highlightWords",
    "questionTypeName": "Highlight Incorrect Words",
    "responseFormat": "word_highlight",
    "content": {
      "text": "Tap the word that is grammatically incorrect: She don't like coffee.",
      "options": [
        { "id": "w1", "text": "She" },
        { "id": "w2", "text": "don't" },
        { "id": "w3", "text": "like" },
        { "id": "w4", "text": "coffee" }
      ]
    },
    "marks": 5,
    "timeLimitSecs": 60,
    "myAnswer": {
      "response": { "selectedOptionIds": ["w2"] },
      "isFlagged": false,
      "answeredAt": "2026-07-31T12:07:00.000Z"
    }
  },
  "questionOrder": 1,
  "totalQuestions": 1,
  "hasNext": false,
  "hasPrevious": false
}
```

---

## Notes

- `myAnswer` is `null` until the student has saved at least one response for that question (`PATCH /attempts/:id/answers/:questionId`); it's shown populated for a few examples above to illustrate the shape once answered.
- `answer_key` is never included in this endpoint's response, for any type — content only.
- `content.options`/`content.blanks` are only present for selection/fill-blank formats; `content.audioUrl`/`content.imageUrl` are only present when the question type has `hasAudio`/`hasImage`.
- IDs (`PQS-*`, `QST-*`, `QTP-*`) above are illustrative — the real ones from your seeded data will differ (see the CLG-10 seed script's console output for actual question IDs).
