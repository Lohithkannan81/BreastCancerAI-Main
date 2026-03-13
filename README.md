# AI-Powered Breast Cancer Detection

## Abstract
This project uses Deep Learning (CNN) to classify mammogram images as Benign or Malignant. It features a secure login system, patient history database, and a user-friendly web interface.

## Tech Stack
- **Frontend:** Tailwind CSS
- **Backend:** Python
- **AI Model:** TensorFlow/Keras
- **Database:** Supabase

## Architecture
1. **User** uploads image via  UI.
2. **Backend** preprocesses image (resize/normalize).
3. **CNN Model** predicts probability.
4. **Database** stores timestamp, result, and username.

## How to Run
1. Install dependencies: `pip install -r requirements.txt`
2. Train model: `python train.py`
3. Run App: `uvicorn main:app --host 0.0.0.0 --port $PORT`
