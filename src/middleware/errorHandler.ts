/*
 * Lunachat - sattelite chat based on NuCypher
 * Copyright (c) 2020. Mikhail Lazarev
 */

import { NextFunction, Request, Response } from "express";
import * as Sentry from "@sentry/node";

export default (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "UnauthorizedError") {
    res.status(403).send("invalid token...");
  } else {
    next();
  }
};

export class ErrorHandler {
  static captureException(error: Error | undefined) {
    console.log(error);
    if (process.env.NODE_ENV !== "development") {
      Sentry.captureException(error);
    }
  }

  static captureMessage(message: string) {
    console.log(message);
    if (process.env.NODE_ENV !== "development") {
      Sentry.captureMessage(message);
    }
  }
}
