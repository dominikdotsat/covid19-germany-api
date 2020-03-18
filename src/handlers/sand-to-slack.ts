const axios = require('axios').default;
const db = require('quick.db');
import { AxiosResponse } from 'axios';

const link =
    process.env.SLACK_HOOK || undefined;
export const sendToSlack = async () => {
    const region = process.env.DEFAULT_REGION || 'DE-BE'; // TODO: should be config
    const regionData = await db.fetch('region-data');
    const lastUpdated = await db.fetch('last-updated');
    const currentRegion = regionData[region];
    const allRegion = regionData['DE-ALL']; // TODO: add const
    if (currentRegion === undefined) {
        return null;
    }
    const data = {
        infected: currentRegion.infected.toString(),
        infectedDifference: currentRegion.infectedDifference.toString(),
        death: currentRegion.death.toString(),
        region: currentRegion.name,
        updatedAt: lastUpdated.updateDate,
        infectedAll: allRegion.infected.toString(),
        infectedAllDifference: allRegion.infectedDifference.toString(),
        deathAll: allRegion.death.toString()
    };
    try {
        const response = await axios.post(link, data);
        if (response.status !== 200) {
            console.log('Connection err, status: ', response.status);
            // TODO: Handle error
            return null;
        }
        response.then((response: AxiosResponse) => {
            console.log('Response:', response);
        });
    } catch (err) {
        console.log(err.response?.data);
        return null;
    }
};
