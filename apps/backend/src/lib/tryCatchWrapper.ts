import { NextFunction, Request, Response } from "express";

export function tryCatch(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<any>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    handler(req, res, next).catch((err) => {
      console.error(err);
      res
        .status(500)
        .json({ ok: false, error: err.message || "Internal Server Error" });
    });
  };
}
