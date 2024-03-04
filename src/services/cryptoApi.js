/* eslint-disable no-unused-vars */
import axios from 'axios';
import { find } from "lodash";
import { waitFor, roundPrice } from "./utils";
import log from "./logger";
const logTag = "cryptoApiService";

// @note coingecko API is limited to ~30 requests per minute - let's use 25
const coingeckoBaseApiUrl = "https://api.coingecko.com/api/v3";
// const flipsideBaseApiUrl = "https://api.flipsidecrypto.com/api/v2";
// const flipsideApiKey = "9011f9cb-0d08-4e73-a367-ada5d26ad9e0";

let allCoinsList = null;

export const getCoinMarketData = async (coinIdArray, base) => {
    const coinIds = coinIdArray.join(",");
    log.log(logTag, `getCoinData: ${coinIds} vs_currency=${base}`);

    const response = await axios.get(`${coingeckoBaseApiUrl}/coins/markets?` +
        `vs_currency=${base}&` +
        `ids=${coinIds}&` +
        `per_page=250&` +
        `sparkline=true&` +
        `price_change_percentage=1h,24h,7d,30d,200d,1y`
    );

    log.log(logTag, response.data);

    return response.data;
};

export const getCoinMarketChart = async (coinId, base) => {
    log.log(logTag, `getCoinMarketChart: ${coinId} vs_currency=${base}`);

    const response = await axios.get(`${coingeckoBaseApiUrl}/coins/${coinId}/market_chart?` +
        `vs_currency=${base}&` +
        `days=730&` +
        `interval=daily`
    );

    log.log(logTag, response.data);
    return response.data;
};

export const calculateSMA = async (coinIds, base) => {
    log.log(logTag, `calculateSMA`);

    let smas = {};

    for (let i = 0; i < coinIds.length; i++) {
        const coinId = coinIds[i];
        const chartData = await getCoinMarketChart(coinId, base);
        // console.log(chartData);

        if (!chartData || !chartData.prices) {
            log.log(logTag, `No chart data for ${coinId}!`);
            log.log(logTag, chartData);
            continue;
        }

        const slice20d = chartData.prices.slice(Math.max(chartData.prices.length - 20, 0));
        const slice60d = chartData.prices.slice(Math.max(chartData.prices.length - 60, 0));
        const slice100d = chartData.prices.slice(Math.max(chartData.prices.length - 100, 0));
        const slice200d = chartData.prices.slice(Math.max(chartData.prices.length - 200, 0));
        const slice2y = chartData.prices.slice(Math.max(chartData.prices.length - 730, 0));

        // console.log(slice20d);
        const sma20d = slice20d.length === 20
            ? roundPrice(slice20d.reduce((accumulator, current) => accumulator + current[1], 0) / 20)
            : null;
        const sma60d = slice60d.length === 60
            ? roundPrice(slice60d.reduce((accumulator, current) => accumulator + current[1], 0) / 60)
            : null;
        const sma100d = slice100d.length === 100
            ? roundPrice(slice100d.reduce((accumulator, current) => accumulator + current[1], 0) / 100)
            : null;
        const sma200d = slice200d.length === 200
            ? roundPrice(slice200d.reduce((accumulator, current) => accumulator + current[1], 0) / 200)
            : null;
        const sma2y = slice2y.length === 730
            ? roundPrice(slice2y.reduce((accumulator, current) => accumulator + current[1], 0) / 730)
            : null;
        const sma5x2y = sma2y !== null ? 5 * sma2y : null;

        smas[coinId] = { sma20d, sma60d, sma100d, sma200d, sma2y, sma5x2y };

        // coingecko API is limited to 30 requests per minute, we'll use 25
        await waitFor(2400);
    }

    // console.log(smas);
    return smas;
};

const fetchAllCoinsList = async () => {
    if (allCoinsList !== null ) {
        return allCoinsList;
    }

    const response = await axios.get(`${coingeckoBaseApiUrl}/coins/list`);
    log.log(logTag, response);

    if (!response || response.status !== 200 || !response.data) {
        throw response;
    }

    // caching the result
    allCoinsList = response.data;
    return allCoinsList;
}

export const findCoinBySymbol = async (coinSymbol) => {
    const theSymbol = coinSymbol.toLowerCase();
    log.log(logTag, `Searching for coin by symbol: ${theSymbol}`);

    const allCoins = await fetchAllCoinsList();
    const result = find(allCoins, { "symbol" : theSymbol });

    if (!result) {
        throw {
            status      : 0,
            statusText  : `No coin with symbol ${coinSymbol.toUpperCase()} found.`
        };
    }

    return result;
};

export const findCoinByCoingeckoId = async (coingeckoId) => {
    log.log(logTag, `Searching for coin by ID: ${coingeckoId}`);
    const allCoins = await fetchAllCoinsList();
    const result = find(allCoins, { "id" : coingeckoId });

    if (!result) {
        throw {
            status      : 0,
            statusText  : `No coin with ID "${coingeckoId}" found.`
        };
    }

    return result;
};


export default {
    getCoinMarketData,
    getCoinMarketChart,
    findCoinBySymbol,
    findCoinByCoingeckoId,
}

/*
ath: 2544.3
ath_change_percentage: -7.37034
ath_date: "2021-04-16T01:00:14.650Z"
atl: 0.432979
atl_change_percentage: 544217.84348
atl_date: "2015-10-20T00:00:00.000Z"
circulating_supply: 115508043.374
current_price: 2362.06
fully_diluted_valuation: null
high_24h: 2496.15
id: "ethereum"
image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880"
last_updated: "2021-04-17T16:46:11.891Z"
low_24h: 2341.6
market_cap: 273359677656
market_cap_change_24h: -6681696451.744354
market_cap_change_percentage_24h: -2.38597
market_cap_rank: 2
max_supply: null
name: "Ethereum"
price_change_24h: -62.65136692
price_change_percentage_1h_in_currency: 0.5428692071442403
price_change_percentage_1y_in_currency: 1275.0836528216573
price_change_percentage_7d_in_currency: 14.127666901680454
price_change_percentage_24h: -2.58387
price_change_percentage_24h_in_currency: -2.5838652622422904
price_change_percentage_30d_in_currency: 29.162396476645313
price_change_percentage_200d_in_currency: 566.4408610342741
roi: {times: 51.27623808080509, currency: "btc", percentage: 5127.623808080509}
sparkline_in_7d: { price: [] }
symbol: "eth"
total_supply: null
total_volume: 36273433902
*/

/*
synthetix snx
yearn finance YFI
maker
compound COMP
chainlink LINK
zrx     0x
celer network
elrond gold
balancer
binance coin
stacks
hegic
kyber network
bancor
aergo

chiliz

hoge
rocket pool

1inch
band
graphlinq

alchemix

https://cryptosyn.web.app/

 */


/*
const coinIds = [
    "bitcoin",
    "ethereum",
    "ripple",
    "audius",
    "decentraland",
    "cardano",
    "ontology",
    "neo",
    "monero",
    "dogecoin",
    "eos",
    "verge",
    "basic-attention-token",
    "district0x",
    "vechain",
    "theta-token",
    // "theta-fuel",
    "ardor",
    "ignis",
    "siacoin",
    "tezos",
    "digibyte",
    "tron",
    "cosmos",
    "stellar",
    "polkadot",
    "litecoin",
    "nem",
    "waves",
    "einsteinium",
    "syscoin",
    "api3",
    "kin",
    "qtum",
    "phantasma",
    "uniswap",
    "augur",
    "golem",
    "metal",
    "zcash",
    "bitcoin-cash",
    "dash",
    "ocean-protocol",
    "aave",
    "kardiachain",
    "bondly",
    "harmony",
    "darwinia-network-native-token"
];

 */