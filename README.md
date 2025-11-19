# CometCommuter Operations Hub

CometCommuter is a market-ready rideshare operations workspace built with a Next.js + Tailwind frontend (`frontend/`) and a Flask API backend (`backend/`). It packages profile management, compatibility modeling, fare recommendations, rider feedback, policy intake, and manual dark/light controls into one cohesive tool.

## Requirements

- Node.js 18+ (Next.js 16 requires Node 18+)
- Python 3.11+

## Backend (Flask)

```bash
cd backend
python3 -m venv .venv && source .venv/bin/activate  # optional but recommended
pip install -r requirements.txt
python app.py
```

Key endpoints live under `/api/*`:

- `POST /users`, `PUT /users/:id`, `DELETE /users/:id` – profile CRUD
- `GET /recommendations` – compatibility scoring across profiles
- `POST /payments/suggestions` – fuel cost heuristic
- `POST /ratings`, `GET /users/:id/reviews` – rider feedback
- `GET /terms`, `POST /issues` – policy + feedback helpers

Run backend unit tests at any time with:

```bash
pytest backend
```

## Frontend (Next.js 16 + Tailwind)

```bash
cd frontend
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:5000/api`) if the backend runs elsewhere.

### Feature routes

- `/` – Overview hero + Bento navigation
- `/profiles` – Create/edit roster entries
- `/recommendations` – Compatibility insights + reviews
- `/payments` – Contribution estimator
- `/ratings` – Submit and browse ride feedback
- `/terms` – Terms & feedback form

Frontend unit tests (Vitest) cover shared calculation helpers:

```bash
npm test
```

## Notes

- Do not commit secrets—use `.env.local` in the `frontend/` app and conventional environment variables for the Flask API.
- The UI expects the Flask server to be available; status banners will appear if it is offline.
