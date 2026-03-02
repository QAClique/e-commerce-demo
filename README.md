# E-Commerce MVP - Test Automation Project

A complete e-commerce application built with a modern separated frontend and backend architecture, designed for test automation practice.

## Project Overview

This project provides a fully functional e-commerce site with shopping cart and checkout functionality, specifically designed to practice test automation skills. It includes:

- ✅ Product catalog
- ✅ Shopping cart management (add/remove/update)
- ✅ Checkout with validation
- ✅ Order confirmation
- ✅ Comprehensive Test Design Document with risk assessment

## Architecture

### Backend

- **Technology**: Node.js + Express + TypeScript
- **Port**: 3001
- **API Style**: RESTful JSON API
- **Storage**: In-memory (resets on restart)

### Frontend

- **Technology**: React + TypeScript + Vite
- **Port**: 3000
- **Styling**: CSS (no framework dependencies)
- **State**: React hooks (useState, useEffect)

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm

### Installation & Running

#### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

#### 2. Start Backend Server

```bash
npm run dev
```

Backend will run on <http://localhost:3001>

#### 3. Install Frontend Dependencies (in a new terminal)

```bash
cd frontend
npm install
```

#### 4. Start Frontend Application

```bash
npm run dev
```

Frontend will run on <http://localhost:3000>

### Access the Application

Open your browser to <http://localhost:3000>

## License

This project is created for educational and testing purposes.
