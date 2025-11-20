import express, { type Express } from "express";

function startServer(): Express {
  const app = express();

  return app;
}

export default startServer();
