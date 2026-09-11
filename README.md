# Bloomy

## Smart India Hackathon 2026

Bloomy is an adaptive and neurodivergent-friendly learning environment that helps children learn through personalized, accessible, and engaging activities.

> Bloomy does not only ask "Did the child get it right?"
> It also asks "How did the child learn?"

## What Bloomy Does

- Adapts activity difficulty based on how the child performs.
- Uses accuracy, reaction time, hesitation, retries, and activity performance as learning signals.
- Uses Random Forest for adaptive difficulty prediction.
- Uses Gemini to generate structured learning questions.
- Uses Peco as an interactive learning companion for guidance, encouragement, hints, and voice feedback.
- Provides accessibility support such as dyslexia-friendly fonts, low sensory mode, and text-to-speech.
- Gives parents a clear view of learning progress, trends, strengths, and areas that may need more practice.
- Unlocks contextual real-world missions that connect learning with everyday situations.

## Learning Activities

### Attention and Self-Management

- Focus Quest
- Rocket Focus
- Stop-Think-Go
- Memory Mission

### Social and Communication

- Greeting Master
- What Would You Do?
- Feelings & Empathy

### Literacy

- Phonics Quest
- Word Builder
- Story Adventure

### Real-World

- Contextual real-world missions unlocked through learning progress.

## How Bloomy Works

Bloomy observes how a child interacts with an activity and uses that information to adapt future challenges.

Child interacts with activity  
↓  
Bloomy observes performance  
↓  
Learning data is collected  
↓  
Machine Learning adjusts difficulty  
↓  
Next challenge is adapted

Bloomy also uses AI to create learning questions.

Activity requirements  
↓  
Gemini  
↓  
Question is generated  
↓  
Question is checked  
↓  
Child receives the question

## Machine Learning

Bloomy uses a Random Forest model to help decide the difficulty of the next challenge.

The model uses learning signals such as:

- Accuracy
- Reaction time
- Hesitation
- Retries
- Previous difficulty

The goal is to keep activities challenging enough to support learning without making them unnecessarily difficult.

## AI

Gemini is used to generate structured learning questions based on the activity, difficulty, skill level, age, and child context.

The backend checks the generated response before sending it to the frontend.

## Peco

Peco is Bloomy's interactive learning companion.

Peco can:

- Introduce activities
- Give hints
- Encourage the child
- React to correct and incorrect answers
- Read content aloud
- Talk with the child
- React with different expressions

## Parent Dashboard

Parents can see:

- Learning time
- Completed activities
- Learning streak
- Skill progress
- Learning trends
- Observed strengths
- Areas that may need more practice
- Accessibility settings
- Recent learning activity

The goal is to give parents a simple picture of the child's learning journey instead of overwhelming them with technical data.

## Backend

The backend is handled by `ml_service.py`.

It connects the frontend with the Machine Learning model and Gemini.

### What the Backend Does

- Receives learning data from the frontend.
- Sends the data to the ML model.
- Predicts the appropriate difficulty.
- Generates AI-based learning questions.
- Checks generated questions before returning them.
- Sends structured responses back to the frontend.

## API

### Health Check

`GET /health`

Checks whether the backend is running.

### Prediction

`POST /predict`

Receives learning data and returns the recommended difficulty level.

### Generate Question

`POST /generate-question`

Generates an adaptive learning question using Gemini.

## Accessibility

Bloomy supports:

- Dyslexia-friendly font
- Low sensory mode
- Text-to-speech
- Quick accessibility profiles

These settings change the learning experience and are not diagnostic labels.

## Real-World Missions

Bloomy can unlock contextual real-world missions after the child completes the required learning activities.

These missions connect skills practised inside Bloomy with simple everyday situations.

## Design Principles

### Adaptive, Not Diagnostic

Bloomy uses observed interaction patterns to adapt learning. It does not diagnose ADHD, autism, dyslexia, cognitive fatigue, or other medical conditions.

### Child-Centered

Incorrect answers are treated as opportunities for guidance rather than punishment.

### Immediate Interaction

The child should receive immediate feedback while telemetry and Machine Learning operations run in the background whenever possible.

### Centralized Peco Speech

Each interaction should have one automatic Peco speech source to avoid duplicate or overlapping audio.

### Parent-Friendly

Parents should see understandable learning progress and observations instead of raw Machine Learning outputs.

## Technology

### Frontend

React, TypeScript, Vite, Tailwind CSS, Framer Motion, Recharts

### Backend

Python, FastAPI, Uvicorn, Scikit-learn

### Machine Learning

Random Forest

### AI

Gemini

### Voice

Peco + Inworld

## Running the Project

### Frontend

npm install

npm run dev

### Backend

python -m venv .venv

Windows:

.venv\Scripts\Activate.ps1

pip install -r requirements.txt

uvicorn ml_service:app --reload

## Environment Variables

### Frontend

VITE_ML_API_URL=http://127.0.0.1:8000

### Backend

GEMINI_API_KEY=your_key_here

## Smart India Hackathon 2026

Bloomy brings together:

- Adaptive learning
- Machine Learning
- Generative AI
- Accessibility
- Interactive learning
- Parent insights
- Real-world learning

The goal is to move beyond one-size-fits-all digital learning and create a system that responds to how each child learns.

## Repository

https://github.com/ShivuXD/Bloomy
