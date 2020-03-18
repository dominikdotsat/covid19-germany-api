const axios = require('axios').default;
const cheerio = require('cheerio');
const db = require('quick.db');

var dateTimeExtraction = /((\d+)[-.\/](\d+)[-.\/](\d+), (\d+):(\d+))/;

export const crawlData = async () => {
    console.log('start crawling');
    const response = await getWebData(
        'https://www.rki.de/DE/Content/InfAZ/N/Neuartiges_Coronavirus/Fallzahlen.html'
    );

    if (response === null) {
        // TODO: Implement retry
        console.log('Err retrive data');
        return;
    }

    const results = parseData(response.data);
    db.set('region-data', results);
    const lastUpdated = parseLastUpdated(response.data);
    db.set('last-updated', lastUpdated);
    console.log('Updated The cases: ', results);
};

async function getWebData(link: string): Promise<any> {
    try {
        const response = await axios.get(link);
        if (response.status !== 200) {
            console.log('Connection err, status: ', response.status);
            // TODO: Handle error
            return null;
        }
        return response;
    } catch (err) {
        // TODO: Handle error
        console.log(err);
        return null;
    }
}

function parseData(data: string): IRegion {
    let results: IRegion = {};
    const total: RegionData = {
        name: 'Total',
        infected: 0,
        infectedDifference: '0',
        death: 0
    };

    const html = cheerio.load(data);
    html('#main table tbody tr').filter((_: number, el: CheerioElement) => {
        const region = el.children[0].children[0].data;
        let confirmedCase = el.children[1]?.children[0]?.data || '0';
        let confirmedDiff = el.children[2]?.children[0]?.data || '0';
        let deathCase = el.children[4]?.children[0]?.data || '0';

        if (
            region === undefined ||
            confirmedCase === undefined ||
            regionCode[region] === undefined
        ) {
            return;
        }
        confirmedCase = confirmedCase.replace('.', '');
        results[regionCode[region]] = {
            name: region,
            infected: parseInt(confirmedCase, 10),
            infectedDifference: confirmedDiff,
            death: parseInt(
                deathCase,
                10
            )
        };
        total.infected += results[regionCode[region]].infected;
        total.death += results[regionCode[region]].death;
        total.infectedDifference = (
                parseInt(total.infectedDifference, 10) +
                parseInt(results[regionCode[region]].infectedDifference)
            ).toString();
    });

    total.infectedDifference = parseInt(total.infectedDifference, 10) > 0 ?
        `+${total.infectedDifference}` :
        total.infectedDifference;
    results['DE-ALL'] = total;

    return results;
}
function parseLastUpdated(data: string): UpdateData {
    let result: UpdateData = {
        raw: '',
        updateDate: ''
    };

    const html = cheerio.load(data);
    html('#main h2:contains("Fallzahlen in Deutschland")+p').filter(
        (_: number, el: CheerioElement) => {
            const updatedAt = el.children[0].data;
            if (updatedAt === undefined) {
                return;
            }
            result.raw = updatedAt;
            result.updateDate = dateTimeExtraction.exec(updatedAt)?.[0] || '';
        }
    );
    console.log('Last updated: ', result.updateDate);
    return result;
}

type IRegion = {
    [id: string]: RegionData;
};

interface RegionData {
    name: string;
    infected: number;
    death: number;
    infectedDifference: string;
    // recovered: string; // TODO: add when they communicate it
}

interface UpdateData {
    raw: string;
    updateDate: string;
}

const regionCode: any = {
    'Baden-Württemberg': 'DE-BW',
    Bayern: 'DE-BY',
    Berlin: 'DE-BE',
    Brandenburg: 'DE-BB',
    Bremen: 'DE-HB',
    Hamburg: 'DE-HH',
    Hessen: 'DE-HE',
    'Mecklenburg-Vorpommern': 'DE-MV',
    Niedersachsen: 'DE-NI',
    'Nordrhein-Westfalen': 'DE-NW',
    'Rheinland-Pfalz': 'DE-RP',
    Saarland: 'DE-SL',
    Sachsen: 'DE-SN',
    'Sachsen-Anhalt': 'DE-ST',
    'Schleswig-Holstein': 'DE-SH',
    Thüringen: 'DE-TH'
};
