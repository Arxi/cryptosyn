<template>
    <div id="market-caps">
        <h1>coin market cap "analysis" tool lol</h1>
        <h3>version 0.2.0 </h3>


        <button @click="reloadTable" :disabled="reloading">
            <span v-if="reloading">
                reloading...
            </span>
            <span v-else>
                reload table
            </span>
        </button>

        <br /> <br />


        <hot-table :data="tableData" :settings="settings" licenseKey="non-commercial-and-evaluation"
                   ref="table"
        >
<!--            <hot-column title="Symbol" data="coinSymbol" type="text"></hot-column>-->
<!--            <hot-column title="Price" data="price" type="numeric"></hot-column>-->
<!--            <hot-column title="From ATH" data="fromAth"></hot-column>-->
<!--            <hot-column title="24h" data="priceChange24h"></hot-column>-->
<!--            <hot-column title="7d" data="priceChange7d"></hot-column>-->
<!--            <hot-column title="30d" data="priceChange30d"></hot-column>-->
<!--            <hot-column title="200d" data="priceChange200d"></hot-column>-->

<!--            <hot-column title="Market cap" data="marketCap"></hot-column>-->
<!--            <hot-column title="MC rank" data="marketCapRank"></hot-column>-->
<!--            <hot-column title="Circulating supply" data="circulatingSupply"></hot-column>-->

<!--            <hot-column title="of BTC MC" data="btcMcFraction"></hot-column>-->
<!--            <hot-column title="0.50%" data="priceAt05"></hot-column>-->
<!--            <hot-column title="1%" data="priceAt1"></hot-column>-->
<!--            <hot-column title="2%" data="priceAt2"></hot-column>-->
<!--            <hot-column title="5%" data="priceAt5"></hot-column>-->
<!--            <hot-column title="10%" data="priceAt10"></hot-column>-->
<!--            <hot-column title="20%" data="priceAt20"></hot-column>-->
<!--            <hot-column title="30%" data="priceAt30"></hot-column>-->
        </hot-table>

        <br /> <br />

        <a href="https://api.coingecko.com/api/v3/coins/list">Search for new coin IDs here</a>

    </div>
</template>
<!---------------------------------------------------------------------------->
<script>
/* eslint-disable vue/no-unused-components,no-unused-vars */
import { HotTable, HotColumn } from '@handsontable/vue';
import { map, find } from "lodash";
import { getCoinData } from "../services/cryptoApiService";
const logTag = "MarketCaps";

const baseCurrency = "usd";
const priceFormat = { pattern: '$0,00.00', culture: 'en-US' };
const marketCapFormat = { pattern: '$0,00', culture: 'en-US' };
const percentFormat = { pattern: '0.0%' };
const percentFormat2dec = { pattern: '0.00%' };

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

export default {
    name: logTag,

    components: { HotTable, HotColumn },

    mounted() {
        console.log(`[${logTag}] mounted`);
        this.$nextTick(() => {
            this.reloadTable();
        });
    },

    data: function() {
        return {
            // disabling the button
            reloading : false,

            // this is what the table uses. Has to be set via HOT API
            tableData : [],

            // HOT settings
            settings: {
                // since we don't provide tableData from start, we have to provide the schema
                dataSchema: {
                    id                  : null,
                    coinSymbol          : null,
                    coingeckoId         : null,

                    price               : null,
                    fromAth             : null,
                    priceChange24h      : null,
                    priceChange7d       : null,
                    priceChange30d      : null,
                    priceChange200d     : null,

                    marketCap           : null,
                    marketCapRank       : null,
                    circulatingSupply   : null,

                    btcMcFraction       : null,
                    priceAt05           : null,
                    priceAt1            : null,
                    priceAt2            : null,
                    priceAt5            : null,
                    priceAt10           : null,
                    priceAt20           : null,
                    priceAt30           : null,
                },

                columns             : [
                    { title : "Symbol", data : "coinSymbol", type : "text", readOnly: true, className: "coinSymbol" },

                    { title : "Price", data : "price", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "From ATH", data : "fromAth", type : "numeric", numericFormat : percentFormat, readOnly: true },

                    { title : "24h", data : "priceChange24h", type : "numeric", numericFormat : percentFormat, readOnly: true },
                    { title : "7D", data : "priceChange7d", type : "numeric", numericFormat : percentFormat, readOnly: true },
                    { title : "30D", data : "priceChange30d", type : "numeric", numericFormat : percentFormat, readOnly: true },
                    { title : "200D", data : "priceChange200d", type : "numeric", numericFormat : percentFormat, readOnly: true },

                    { title : "Market cap", data : "marketCap", type : "numeric", numericFormat : marketCapFormat, readOnly: true },
                    { title : "MC rank", data : "marketCapRank", type : "numeric", readOnly: true },
                    { title : "Circ. supply", data : "circulatingSupply", type : "numeric", readOnly: true },

                    { title : "% of BTC MC", data : "btcMcFraction", type : "numeric", numericFormat : percentFormat2dec, readOnly: true },
                    { title : "at 0.5%", data : "priceAt05", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 1%", data : "priceAt1", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 2%", data : "priceAt2", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 5%", data : "priceAt5", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 10%", data : "priceAt10", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 20%", data : "priceAt20", type : "numeric", numericFormat : priceFormat, readOnly: true },
                    { title : "at 30%", data : "priceAt30", type : "numeric", numericFormat : priceFormat, readOnly: true },
                ],

                colHeaders          : true,
                // rowHeaders          : true,
                // rowHeaders          : coinIds,
                filters             : true,
                dropdownMenu        : true,
                currentRowClassName : 'currentRow',
                currentColClassName : 'currentCol',
                // autoRowSize     : false,
                autoColumnSize      : true,
                fixedRowsTop        : 1,
                fixedColumnsLeft    : 1,
                columnSorting       : true,


                afterChange         : (change, source) => {
                    console.log(`Data changed, source: ${source}`);
                    console.log(change);
                }
            }
        };
    },



    methods: {
        async reloadTable() {
            this.reloading = true;

            const coinData = await getCoinData(coinIds, baseCurrency);

            const bitcoin = find(coinData, { id : "bitcoin" });
            // console.log(bitcoin);

            let currentCoinId = 0;

            // just a helper to calculate price of coin at certain bitcoin market cap fraction
            const priceAtMCFraction = (fraction, circulatingSupply) => fraction * bitcoin.market_cap / circulatingSupply;

            const newTableData = map(coinData, (coin) => {
                currentCoinId++;
                return {
                    id                  : currentCoinId,
                    coinSymbol          : coin.symbol.toUpperCase(),
                    circulatingSupply   : Math.floor(coin.circulating_supply),

                    price               : coin.current_price,
                    fromAth             : coin.ath_change_percentage / 100,
                    priceChange24h      : coin.price_change_percentage_24h_in_currency / 100,
                    priceChange7d       : coin.price_change_percentage_7d_in_currency / 100,
                    priceChange30d      : coin.price_change_percentage_30d_in_currency / 100,
                    priceChange200d     : coin.price_change_percentage_200d_in_currency / 100,

                    marketCap           : coin.market_cap,
                    marketCapRank       : coin.market_cap_rank,

                    btcMcFraction       : coin.market_cap / bitcoin.market_cap,
                    priceAt05           : priceAtMCFraction(0.005, coin.circulating_supply),
                    priceAt1            : priceAtMCFraction(0.01, coin.circulating_supply),
                    priceAt2            : priceAtMCFraction(0.2, coin.circulating_supply),
                    priceAt5            : priceAtMCFraction(0.05, coin.circulating_supply),
                    priceAt10           : priceAtMCFraction(0.10, coin.circulating_supply),
                    priceAt20           : priceAtMCFraction(0.20, coin.circulating_supply),
                    priceAt30           : priceAtMCFraction(0.30, coin.circulating_supply),
                }
            });

            this.$refs.table.hotInstance.loadData(newTableData);
            this.reloading = false;
        }
    }
}
</script>
<!---------------------------------------------------------------------------->
<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style>
    td.currentRow, td.currentCol {
        background-color: rgba(44, 62, 80, 0.12);
    }

    .handsontable td.htDimmed {
        color: black;
    }

    .coinSymbol { font-weight: bold; }

</style>
