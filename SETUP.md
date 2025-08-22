# ParkSmart Setup Guide

## Quick Fix for Database Connection Error

The error you're seeing is because the application needs a PostgreSQL database to run. Here are your options:

### Option 1: Use Neon Database (Recommended for Development)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string from your project dashboard
4. Create a `.env` file in your project root with:

```bash
DATABASE_URL="your_neon_connection_string_here"
JWT_SECRET="your-secret-key-here"
```

### Option 2: Use Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database called `parksmart`
3. Create a `.env` file with:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/parksmart"
JWT_SECRET="your-secret-key-here"
```

### Option 3: Use Docker (Quick Setup)

1. Install Docker
2. Run this command:

```bash
docker run --name parksmart-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=parksmart -p 5432:5432 -d postgres:15
```

3. Create `.env` file:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/parksmart"
JWT_SECRET="your-secret-key-here"
```

## After Setting Up Database

1. Run the database migrations:
```bash
npm run db:push
```

2. Start the development server:
```bash
npm run dev
```

## Current Error Explained

The WebSocket error occurs because:
- Neon database tries to connect via WebSocket
- No database URL is provided
- Connection fails and crashes the server

## Need Help?

If you're still having issues, check:
1. Is your database running?
2. Is the DATABASE_URL correct?
3. Can you connect to the database manually?
4. Are there any firewall/network issues?
