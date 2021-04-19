<template>
    <div id="market-caps">
        <h1>coin market cap "analysis" tool lol</h1>
        <h3>version 0.3.0 </h3>


        <button @click="reloadTable" :disabled="reloading">
            <span v-if="reloading">
                reloading...
            </span>
            <span v-else>
                reload table
            </span>
        </button>

        <br />
        <input type="text" placeholder="enter coingecko id" v-model="newCoin">
        <button @click="onAddNewCoin">add coin</button>

        <div id="table-wrapper">
            <hot-table :data="tableData" :settings="settings" licenseKey="non-commercial-and-evaluation"
                       ref="table" className="hot-table"
            ></hot-table>
        </div>

        <a href="https://api.coingecko.com/api/v3/coins/list">Search for new coin IDs here</a>

    </div>
</template>
<!---------------------------------------------------------------------------->
<script>
/* eslint-disable vue/no-unused-components,no-unused-vars */
import { HotTable, HotColumn } from '@handsontable/vue';
import { map, find, keys } from "lodash";
import { getCoinData } from "../services/cryptoApiService";
import { auth, coinsCollection } from "../services/firebase";
import log from "../services/logger";
const logTag = "MarketCaps";

const baseCurrency = "usd";
// http://numbrojs.com/old-format.html
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

    async mounted() {
        console.log(`[${logTag}] mounted`);

        this.$nextTick(() => {
            this.reloadTable();
        });
    },

    data: function() {
        return {
            // disabling the button
            reloading : false,

            newCoin : "",

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
                    { title : "ID", data : "coingeckoId", type : "text", readOnly: false, className: "editable" },
                    { title : "BR", data : "baserank", type : "numeric", readOnly: false, className: "editable"},

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
                // width: '100%',



                afterChange         : async (change, source) => {
                    console.log(`Data changed, source: ${source}`);
                    console.log(change);

                    if (!auth.currentUser) {
                        log.log(logTag, `Not logged in!`);
                        return;
                    }

                    if (source === "edit" ) {
                        const [row, prop, oldValue, newValue] = change[0];
                        if (oldValue === newValue) {
                            return;
                        }

                        try {
                            if (prop === "coingeckoId") {
                                log.log(logTag, `Editing ${oldValue}.${prop}: ${oldValue} -> ${newValue}`);

                                console.log("dopice");
                                // delete the old coin
                                await coinsCollection.doc(oldValue).delete();
                                log.log(logTag, `Deleted coin: ${oldValue}`);
                                if (!newValue) {
                                    this.reloadTable();
                                    return;
                                }

                                // add the new coin
                                await this.addNewCoin(newValue);
                                return;
                            }

                            const coinId = this.$refs.table.hotInstance.getDataAtRowProp(row, "coingeckoId");
                            log.log(logTag, `Editing ${coinId}.${prop}: ${oldValue} -> ${newValue}`);

                            // @todo only if valid!

                            await coinsCollection.doc(coinId).set({[prop]: newValue});
                            console.log(`${coinId}.${prop} successfully changed to ${newValue}`);

                        } catch (error) {
                            log.log(logTag, `Error while editing document!`);
                            log.log(logTag, error);
                        }
                    }
                }
            }
        };
    },



    methods: {
        async onAddNewCoin() {
            if (!this.newCoin) {
                return;
            }

            if (!auth.currentUser) {
                log.log(logTag, `Not logged in!`);
                return;
            }

            await this.addNewCoin(this.newCoin);
            this.newCoin = "";
        },

        async addNewCoin(coinId) {
            log.log(logTag, `Adding new coin: ${coinId}`);
            // @todo: check if it exists

            try {
                await coinsCollection.doc(coinId).set(
                    { baserank : null, description : "no description yet" }
                )
                log.log(logTag, `New coin added successfully`);
                this.reloadTable();

            } catch(error) {
                log.log(logTag, `Error adding coin "${coinId}!"`);
                log.log(logTag, error);
            }
        },

        async reloadTable() {
            const snapshot = await coinsCollection.get();
            let coins = {};
            snapshot.forEach((doc) => coins[doc.id] = doc.data());
            console.log(coins);


            this.reloading = true;

            const coinData = await getCoinData(keys(coins), baseCurrency);

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
                    coingeckoId         : coin.id,
                    baserank            : coins[coin.id].baserank,
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

    #table-wrapper {
        margin: 30px 0;
        /*width: 100%;*/
        /*overflow-x: scroll;*/
        /*overflow-y: visible;*/
    }

    /*.hot-table {*/
    /*    width: 500px;*/
    /*    overflow: hidden;*/
    /*}*/

    td.editable {
        color: #3535ed;
    }
</style>
<style scoped>
    h1 {
        margin-top: 10px;
        margin-bottom: 10px;
    }
</style>
