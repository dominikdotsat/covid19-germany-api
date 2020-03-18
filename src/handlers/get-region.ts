const db = require('quick.db');
import { Request, Response } from 'express';

export const getRegion = async (req: Request, res: Response) => {
    const region = req.params.region;
    let regionData = await db.fetch('region-data');
    let lastUpdated = await db.fetch('last-updated');
    console.log('Query for region: ', region);
    if (regionData[region] === undefined) {
        res.status(404).send({ err: 'Region not found' });
    }
    res.status(200).send({
        data: regionData[region],
        lastUpdated: lastUpdated
    });
    return;
};
