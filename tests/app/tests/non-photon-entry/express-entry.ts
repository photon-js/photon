import express, { type Express } from "express";

function startServer(): Express {
  return express();
}

export default startServer();
