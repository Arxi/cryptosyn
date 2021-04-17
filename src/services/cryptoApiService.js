import axios from 'axios';

const logTag = "cryptoApiService";
const coingeckoBaseApiUrl = "https://api.coingecko.com/api/v3";

export const getCoinData = async (coinIdArray, base) => {
    const coinIds = coinIdArray.join(",");
    console.log(`[${logTag}] getCoinData: ${coinIds}-${base}`);

    let response = await axios.get(`${coingeckoBaseApiUrl}/coins/markets?` +
        `vs_currency=${base}&` +
        `ids=${coinIds}&` +
        `price_change_percentage=1h,24h,7d,30d,200d,1y`
    );

    return response.data;
};


export default {
    getCoinData
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
symbol: "eth"
total_supply: null
total_volume: 36273433902
*/