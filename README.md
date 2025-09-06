# GameNightBalancer

A full-stack application for balancing game nights, built with Express, TypeScript, and Vite.

## Features
- REST API with Express
- React frontend (Vite)
- TypeScript throughout
- Session management
- Modular structure

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Install dependencies

```bash
npm install
```

### Development mode

```bash
npm run dev
```

This will start the server (API + client) in development mode.

### Build for production

```bash
npm run build
```

### Start in production mode

```bash
npm start
```

### CLI Usage

The main server entry point is:

```
server/index.ts
```

You can run the server directly with:

```bash
npm run dev
```

Or build and run the bundled output:

```bash
npm run build
npm start
```

## Project Structure

- `server/` - Express API and backend logic
- `client/` - React frontend
- `shared/` - Shared code (e.g., schema)

## Contributing
Pull requests welcome!

## License
MIT
