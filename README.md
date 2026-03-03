# Online House Rental Management System

Full-stack accommodation finder for students and university members of B.E.S.T Innovation University.

## Focus of this MVP

- Supports listings in nearby service areas around B.E.S.T Innovation University.
- Targets students, university staff, and related families.
- Service coverage includes:
  - Gorantla and Gownivaripalli (Sri Sathya Sai district, Andhra Pradesh)
  - Bagepalli / Chikkaballapur belt (Karnataka)

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MySQL (or in-memory mode for quick start)
- Package management: npm workspaces

## Project Structure

- `client/` React application
- `server/` Express API

## Run Locally

1. Install dependencies from root:

	```bash
	npm install
	```

2. Start frontend + backend together:

	```bash
	npm run dev
	```

3. Open frontend at `http://localhost:5173`

Backend API runs at `http://localhost:4000`

## MySQL Setup

By default, server runs in in-memory mode. To use MySQL:

1. Copy environment file:

	```bash
	cp server/.env.example server/.env
	```

2. Edit `server/.env` and set:

	```env
	DB_MODE=mysql
	DB_HOST=127.0.0.1
	DB_PORT=3306
	DB_USER=root
	DB_PASSWORD=your_password
	DB_NAME=bestiu_rentals
	```

3. Create schema and seed data:

	```bash
	mysql -u root -p < server/sql/schema.sql
	mysql -u root -p < server/sql/seed.sql
	```

4. Start app:

	```bash
	npm run dev
	```

`GET /api/health` now reports DB mode and connectivity status.

## API Endpoints

- `GET /api/health` Health check
- `GET /api/meta` University + service area metadata
- `GET /api/listings` Filtered listing data

### `/api/listings` query params

- `q` text search
- `area` one of `gorantla`, `gownivaripalli`, `bagepalli`
- `audience` one of `students`, `university staff`, `families`
- `maxRent` number (INR)
- `maxDistanceKm` number
