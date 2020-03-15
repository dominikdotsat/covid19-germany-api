import { Router, NextFunction, Request, Response } from 'express';

type Handler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<void> | void;

interface Route {
    path: string;
    method: string;
    handler: Handler | Handler[];
}

export const applyRoutes = (routes: Route[], router: Router) => {
    for (const route of routes) {
        const { method, path, handler } = route;
        (router as any)[method](path, handler);
    }
};
