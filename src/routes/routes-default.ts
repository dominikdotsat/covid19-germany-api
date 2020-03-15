import { Request, Response } from 'express';
import { getRegion } from '../handlers/get-region';

export const routes = [
    {
        path: '/get-region/:region',
        method: 'get',
        handler: async (req: Request, res: Response) => getRegion(req, res)
    }
];
