# SmartSenseAI - Complete Project Structure

A comprehensive student stress detection and wellness recommendation system using FastAPI backend, React frontend, and machine learning models.

## 🏗️ Project Structure

```
├── backend/                    # FastAPI backend
│   ├── schemas/               # Pydantic models
│   │   ├── user_schema.py
│   │   ├── stress_schema.py
│   │   └── history_schema.py
│   ├── auth.py               # Authentication & JWT
│   ├── database.py           # SQLite database functions
│   ├── predict.py            # Model prediction logic
│   ├── chatbot.py            # Chatbot responses
│   ├── recommendation.py      # Wellness recommendations
│   ├── history.py            # History management
│   ├── app.py                # FastAPI main app
│
├── frontend/                  # React UI
│   ├── src/
│   │   ├── SmartSensAI.jsx
│   │   └── index.jsx
│   ├── public/
│   │   └── index.html
│   ├── vite.config.js
│   ├── package.json
│
├── ml/                        # Machine Learning
│   ├── preprocess.py         # Data preprocessing
│   └── train_model.py        # Model training (RF + SVC)
│
├── models/                    # Trained models
│   ├── stress_model.pkl      # SVC final model
│   ├── stress_model_rf.pkl   # RandomForest comparison
│   ├── scaler.pkl            # Feature scaler
│   ├── label_encoder.pkl     # Target encoder
│   └── feature.json          # Feature metadata
│
├── notebooks/                 # Jupyter notebooks
│   ├── eda.ipynb             # Exploratory Data Analysis
│   ├── feature_engineering.ipynb
│   └── stress_analysis.ipynb
│
├── data/                      # Datasets
│   ├── StressLevelDataset.csv
│   └── sample_stress_data.csv
│
├── assets/
│   └── charts/               # EDA visualizations
│
├── README.md                  # This file
└── requirements.txt           # All dependencies
```

## 📊 Features Used

10 selected stress indicators:
- `anxiety_level` - GAD-7 scale
- `self_esteem` - Rosenberg scale
- `mental_health_history` - Binary indicator
- `depression` - PHQ-9 scale
- `sleep_quality` - 0-5 rating
- `study_load` - 0-5 rating
- `future_career_concerns` - 0-5 rating
- `social_support` - 0-3 scale
- `peer_pressure` - 0-5 rating
- `bullying` - 0-5 rating

## 🚀 Quick Start

### 1. Get the Dataset
Download **StressLevelDataset.csv** from Kaggle and place it in `data/` folder:
```bash
cd "c:\Users\HOME\OneDrive\Documents\TekWorks\Batch 22 project"
# Place StressLevelDataset.csv in data/ folder
```

### 2. Install Dependencies
```bash
python -m pip install -r requirements.txt
```

### 3. Train Models
```bash
python ml/train_model.py
```
This will:
- Load and preprocess data
- Remove outliers using IQR method
- Scale features with StandardScaler
- Train RandomForestClassifier (n_estimators=200)
- Train SVC with RBF kernel (final model)
- Save models to `models/` folder

### 4. Run Backend
```bash
uvicorn backend.app:app --reload --host 0.0.0.0 --port 8000
```
API docs: http://localhost:8000/docs

### 5. Run Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Backend API Endpoints

### Authentication
- `POST /register` - Register new user
- `POST /login` - Login user

### Prediction
- `POST /predict` - Get stress level prediction

### History & Statistics
- `GET /history/{user_email}` - Get user prediction history
- `POST /save-prediction` - Save prediction to history

### Wellness
- `GET /recommendations/{stress_level}` - Get wellness recommendations
- `POST /chat` - Chat with wellness bot

## 🧠 ML Pipeline

### Data Preprocessing (ml/preprocess.py)
1. **Load data** - Read StressLevelDataset.csv
2. **Handle missing values** - Dropna
3. **Remove outliers** - IQR method (1.5 × IQR)
4. **Feature scaling** - StandardScaler
5. **Encoding** - LabelEncoder for target variable

### Model Training (ml/train_model.py)
- **RandomForestClassifier**: 200 trees, max_depth=15
- **SVC**: RBF kernel, C=1.0 (final model for better accuracy)
- **Evaluation**: Accuracy, Precision, Recall, F1-Score, Confusion Matrix
- **Test split**: 80/20 with stratification

### Model Comparison
Both models saved and used for predictions. SVC typically achieves better accuracy on stress classification.

## 🔍 Notebooks

### 1. eda.ipynb
- Data exploration and statistical summary
- Target variable distribution
- Feature distributions and correlations
- Saves charts to `assets/charts/`

### 2. feature_engineering.ipynb
- Missing value handling
- Outlier detection & removal
- Feature scaling
- Feature importance analysis
- Feature interactions

### 3. stress_analysis.ipynb
- Complete preprocessing pipeline
- Model training & comparison
- Confusion matrices & classification reports
- Feature importance visualization
- Model saving

## 📦 Database Schema

**Users table**
- id (INTEGER PRIMARY KEY)
- email (TEXT UNIQUE)
- name (TEXT)
- password_hash (TEXT)
- created_at (TIMESTAMP)

**History table**
- id (INTEGER PRIMARY KEY)
- user_email (TEXT FOREIGN KEY)
- stress_level (TEXT)
- confidence (REAL)
- score (REAL)
- features_used (TEXT - JSON)
- created_at (TIMESTAMP)

## 🔐 Authentication

- Password hashing with bcrypt
- JWT tokens for API access
- Token expiration: 30 minutes (configurable)

## 💡 Recommendations Engine

Personalized wellness recommendations based on stress level:
- **Low Stress**: Maintenance tips (mindfulness, exercise, learning)
- **Moderate Stress**: Intervention techniques (journaling, pomodoro, music therapy)
- **High Stress**: Crisis resources and immediate action steps

## 🤖 Wellness Chatbot

Context-aware chatbot responses on:
- Stress management
- Sleep and anxiety
- Exercise and meditation
- Study techniques
- Mental health resources

## 📝 Environment Setup

Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```
SECRET_KEY=your-secure-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## 🛠️ Development Commands

```bash
# Backend
uvicorn backend.app:app --reload

# Frontend
npm run dev

# Train models
python ml/train_model.py

# Run notebooks
jupyter notebook
```

## 📊 Model Performance

Expected metrics (varies with data):
- **Accuracy**: ~87%
- **Precision**: ~85%
- **Recall**: ~87%
- **F1-Score**: ~86%

## 📞 Support & Resources

Crisis resources for high stress:
- iCall (India): 9152987821
- Vandrevala Foundation: 1860-2662-345 (24/7)

---

**Project Created**: May 2026

**Tech Stack**: FastAPI, React, Scikit-Learn, SQLite, Vite
