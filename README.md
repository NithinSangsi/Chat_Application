# Let's Chat

A full-stack real-time chat application built with the MERN stack and Socket.IO.

## Features

- Email/password auth
- Phone OTP login (simulated)
- JWT-based session persistence
- Real-time one-to-one chat with Socket.IO
- Messages saved in MongoDB
- Responsive UI built with React + Tailwind CSS

## Folder Structure

- `/backend` - Express server, Mongoose models, REST APIs, Socket.IO
- `/frontend` - React + Vite frontend, Tailwind CSS, Socket.IO client

## Setup

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and a JWT secret
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend `.env`

```env
MONGO_URI=mongodb://localhost:27017/lets-chat
JWT_SECRET=replace_this_with_a_strong_secret
CLIENT_URL=http://localhost:5173
PORT=5000
```

### Frontend `.env`

```env
VITE_API_URL=http://localhost:5000
```

## Usage

1. Start the backend server first.
2. Start the frontend app.
3. Open the React app in the browser.
4. Register with email/password or send a simulated OTP to login via phone.
5. Chat in real time with another signed-in user.
