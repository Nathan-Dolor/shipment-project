# Freight Forwarding Shipment Management

This is a full-stack web application that allows users to upload, process, and visualize freight shipment data from CSV files.

The dashboard displays key operational metrics, visual insights, and provides a table to explore shipments.

---

## Tech Stack

- **Frontend**: React + Vite + Tailwind CSS  
- **Backend**: Laravel (PHP)  
- **Database**: MySQL (via XAMPP)  

---

## Setup & Installation

### 1. Clone the repository

```bash
git clone https://github.com/Nathan-Dolor/shipment-project.git
cd shipment-project
```
### 2. Backend Setup

```bash
cd shipment-management

# Install dependencies
composer install

# Copy the environment file
cp .env.example .env

# Set up your database credentials in .env

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Start the backend server
php artisan serve
```
> The API will run at http://localhost:8000.

### 3. Frontend Setup

```bash
cd shipment-frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```
> The frontend will run at http://localhost:5173 by default and expects the backend to be at http://localhost:8000.
Make sure the frontend API fetches point to the correct backend URL.

---

## Features

- CSV Upload:
  - File selection interface for uploading shipment CSV files.
  - Files are processed and stored in the database.

- Dashboard:
  - Summary Stats: Total Shipments, Warehouse Utilization, Total Volume.
  - Pie Chart: Shipment Volume by Mode (Air, Sea).
  - Bar Chart: Daily Received Shipments grouped by Carrier.
  - Shipment Table: Sortable, searchable, filterable, and paginated shipment data.
  - Shipment Details: Click a shipment in the table to view details

- Responsive UI:
  - Clean and user-friendly layout for both desktop and mobile.

---

## Design Decisions
1. Frameworks: React with Tailwind CSS for rapid UI development and Laravel for backend flexibility and simplicity.
2. Component Layout: Modular structure with components for summaries, charts, tables, and modals for easier maintenance.
3. Responsiveness: Mobile-friendly using Tailwind's utility-first approach.
4. Data Visualization: Recharts was used for easily customizable and responsive charts.

---

## Trade-offs & Assumptions
1. Assumed that uploaded CSV files are properly formatted and contain expected fields.
3. Live aggregation is used for insights. For large data sets, optimizations may be needed.
4. A constant maximum warehouse volume of 60,000,000,000 cm³ is used for utilization.
5. The app is public and unauthenticated to focus on core functionality for the coding challenge.
6. Daily carrier shipment bar chart may be cluttered for long time periods, so added a dropdown to filter by time range.
