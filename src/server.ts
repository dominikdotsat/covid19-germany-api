import http from 'http';
import schedule from 'node-schedule';
import express from 'express';
import { applyRoutes } from './utils/index';
import { routes } from './routes/routes-default';
import { crawlData } from './handlers/crawl-data';
import { sendToSlack } from './handlers/sand-to-slack';

const app = express();
const { PORT = 8080 } = process.env;
const server = http.createServer(app);

app.disable('x-powered-by');

applyRoutes(routes, app);

server.listen(PORT, () => {
    console.log(`Server is running http://localhost:${PORT}...`);
});

const HOURLY_CRON = process.env.HOURLY_CRON || '0 * * * *';
const EVERY_MORNING_CRON =  process.env.EVERY_MORNING_CRON || '0 9 * * *';

crawlData();
schedule.scheduleJob(HOURLY_CRON, () => crawlData); // crawl hourly
// sendToSlack(); // no initial, during dev
schedule.scheduleJob(EVERY_MORNING_CRON, () => sendToSlack); // send msg to slack, everyday in the morning
