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

        <div v-if="isLoggedIn" class="add-coin-wrapper">
            <input type="text" placeholder="enter coin symbol"
                   v-model="coinToSearchFor"
                   @keyup.enter="onSearchNewCoin"
            >
            <button @click="onSearchNewCoin">add coin</button>
        </div>

        <status-message :text="statusText" :status="statusCode" :className="statusClass" />
        <div class="status-message-placeholder" v-show="!statusText"></div>


        <div id="table-wrapper">
            <hot-table :data="tableData" :settings="settings" licenseKey="non-commercial-and-evaluation"
                       ref="table" className="hot-table"
            ></hot-table>
        </div>

<!--        <a href="https://api.coingecko.com/api/v3/coins/list">Search for new coin IDs here</a>-->

        <loader v-show="reloading"/>
    </div>
</template>
<!---------------------------------------------------------------------------->
<script>
/* eslint-disable vue/no-unused-components,no-unused-vars */
import { HotTable, HotColumn } from '@handsontable/vue';
import { map, find, keys } from "lodash";
import { getCoinMarketData, findCoinBySymbol, findCoinByCoingeckoId } from "../services/cryptoApi";
import { auth, coinsCollection } from "../services/firebase";
import { sparklineRenderer, priceColorRenderer } from "../services/hotUtils";
import { relativeDays, everyNth } from "../services/utils";
import Loader from "../components/Loader";
import StatusMessage from "../components/StatusMessage";

import log from "../services/logger";
const logTag = "MarketCaps";

const baseCurrency = "usd";
// http://numbrojs.com/old-format.html
const priceFormat = { pattern: '$0,00.00', culture: 'en-US' };
const marketCapFormat = { pattern: '$0,00', culture: 'en-US' };
const percentFormat = { pattern: '0.0%' };
const percentFormat2dec = { pattern: '0.00%' };

export default {
    name: logTag,

    components: { HotTable, HotColumn, Loader, StatusMessage },

    async mounted() {
        log.log(logTag, `=================== mounted =================== `);
        this.isLoggedIn = !!auth.currentUser;
        this.$nextTick(() => {
            this.reloadTable();
        });
    },

    data: function() {
        return {
            // disabling the button
            reloading : false,

            isLoggedIn : false,

            myCoins             : {},
            coinToSearchFor     : "",

            statusText          : "",
            statusCode          : 0,
            statusClass         : "info",

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
                    sparkline7d         : null,
                    fromAth             : null,
                    fromAthDays         : null,
                    priceChange24h      : null,
                    priceChange7d       : null,
                    priceChange30d      : null,
                    priceChange200d     : null,

                    marketCapRank       : null,
                    marketCap           : null,
                    marketCapChange24h  : null,
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
                    { title : "Symbol", data : "coinSymbol", type : "text", readOnly: true,
                        className: "coinSymbol htMiddle", width : 60 },
                    { title : "ID", data : "coingeckoId", type : "text", readOnly: false,
                        className: "editable htMiddle text-smaller", width : 80 },
                    { title : "BR", data : "baserank", type : "numeric", readOnly: false,
                        className: "editable htMiddle htCenter", width : 40},

                    { title : "Price", data : "price", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width : 80 },
                    { title : "Price 7D", width: 170, renderer : sparklineRenderer, readOnly: true },

                    { title : "From ATH", data : "fromAth", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 55 },
                    { title : "Days from ATH", data : "fromAthDays", type: "text", readOnly: true,
                        width: 70 },

                    { title : "Price 24h", data : "priceChange24h", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 60, renderer : priceColorRenderer },
                    { title : "Price 7D", data : "priceChange7d", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 60, renderer : priceColorRenderer },
                    { title : "Price 30D", data : "priceChange30d", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 60, renderer : priceColorRenderer },
                    { title : "Price 200D", data : "priceChange200d", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 70, renderer : priceColorRenderer },

                    { title : "MC rank", data : "marketCapRank", type : "numeric", readOnly: true,
                        width: 40, className: "htMiddle htCenter" },
                    { title : "Market cap", data : "marketCap", type : "numeric", numericFormat : marketCapFormat,
                        readOnly: true, width: 90, className: "htMiddle htCenter text-smallest" },
                    { title : "MC 24h", data : "marketCapChange24h", type : "numeric", numericFormat : percentFormat,
                        readOnly: true, width: 60, renderer : priceColorRenderer },
                    { title : "Circ. supply", data : "circulatingSupply", type : "numeric", readOnly: true,
                        className: "htMiddle htCenter text-smallest", width : 70 },

                    { title : "% of BTC MC", data : "btcMcFraction", type : "numeric", numericFormat : percentFormat2dec,
                        readOnly: true, width: 65 },
                    { title : "at 0.5%", data : "priceAt05", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 1%", data : "priceAt1", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 2%", data : "priceAt2", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 5%", data : "priceAt5", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 10%", data : "priceAt10", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 20%", data : "priceAt20", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                    { title : "at 30%", data : "priceAt30", type : "numeric", numericFormat : priceFormat,
                        readOnly: true, width: 80 },
                ],

                // nestedHeaders: [
                //     [{ label: '', colspan: 14 }, { label: 'Price if coin reaches % of BTC market cap', colspan: 7}],
                //     ['Symbol', 'ID', 'BR', 'Price', '7D', 'From ATH', '24h', '7D', '30D', '200D',
                //         'Market cap', 'MC rank', 'Circ. supply', '% of BTC MC', 'at 0.5%', 'at 1%',
                //         'at 2%', 'at 5%', 'at 10%', 'at 20%', 'at 30%', ]
                // ],

                colHeaders          : true,
                // rowHeaders          : true,
                // rowHeaders          : coinIds,
                filters             : true,
                dropdownMenu        : true,
                currentRowClassName : 'currentRow',
                currentColClassName : 'currentCol',
                autoColumnSize      : true,
                fixedRowsTop        : 1,
                fixedColumnsLeft    : 1,
                columnSorting       : true,
                // width: '100%',
                className           : "htMiddle",

                afterGetColHeader: function(col, TH) {
                    TH.className = 'htMiddle';
                },

                afterChange         : async (change, source) => {
                    console.log(`Data changed, source: ${source}`);
                    console.log(change);

                    if (!auth.currentUser) {
                        log.log(logTag, `Not logged in!`);
                        this.setStatus(
                            "You are not signed in, or don't have necessary permissions!",
                            0,
                            "error"
                        );
                        return;
                    }

                    if (source !== "edit" ) {
                        return;
                    }

                    const [row, prop, oldValue, newValue] = change[0];
                    if (oldValue === newValue) {
                        return;
                    }

                    try {
                        if (prop === "coingeckoId") {
                            log.log(logTag, `Editing ${oldValue}.${prop}: ${oldValue} -> ${newValue}`);

                            // if we are adding a new coin, we need to check whether it exists and whether
                            // we don't have it in the table already
                            if (newValue) {
                                let newCoin;

                                try {
                                    newCoin = await findCoinByCoingeckoId(newValue);
                                } catch (error) {
                                    this.setStatus(error.statusText, error.status, "error");
                                    return;
                                }

                                if (this.myCoins[newCoin.id]) {
                                    this.setStatus(
                                        `Coin ${newCoin.name} (${newCoin.symbol.toUpperCase()}) is already in the table :)`,
                                        0, "info"
                                    );
                                    return;
                                }
                            }


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
                        this.setStatus(
                            `${coinId}.${prop} successfully changed from ${oldValue} to ${newValue}`,
                            0,
                            "success"
                        );


                    } catch (error) {
                        log.log(logTag, `Error while editing document!`);
                        log.log(logTag, error);
                        this.setStatus(
                            `Error while editing ${row}.${prop}: ${oldValue} -> ${newValue}!`,
                            0,
                            "error"
                        );
                    }
                }
            }
        };
    },



    methods: {
        setStatus(text, status, className) {
            if (text === null) {
                this.statusText = "";
                this.statusCode = 0;
                this.statusClass = "info";
            } else {
                this.statusText = text;
                this.statusCode = status;
                this.statusClass = className;
            }
        },

        async onSearchNewCoin() {
            if (!this.coinToSearchFor) {
                return;
            }

            this.setStatus(null);

            if (!auth.currentUser) {
                log.log(logTag, `Not logged in!`);
                this.setStatus(
                    "You are not signed in, or don't have necessary permissions!",
                    0,
                    "error"
                );
                return;
            }

            this.reloading = true;

            try {
                const searchResults = await findCoinBySymbol(this.coinToSearchFor);
                log.log(logTag, searchResults);

                if (this.myCoins[searchResults.id]) {
                    this.setStatus(
                        `Coin ${searchResults.name} (${searchResults.symbol.toUpperCase()}) is already in the table :)`,
                        0, "info"
                    );
                    this.reloading = false;
                    return;
                }

                await this.addNewCoin(searchResults.id);
                this.setStatus(
                    `Coin added: ${searchResults.name} (${searchResults.symbol.toUpperCase()})`,
                    0, "success"
                );
                this.coinToSearchFor = "";

            } catch (error) {
                log.log(logTag, "Error while searching for coin");
                log.log(logTag, error);
                this.setStatus(error.statusText, error.status, "error");
            }

            this.reloading = false;
        },

        async addNewCoin(coinId) {
            log.log(logTag, `Adding new coin: ${coinId}`);

            try {
                await coinsCollection.doc(coinId).set(
                    { baserank : null, description : "no description yet" }
                )
                log.log(logTag, `New coin added successfully`);
                this.reloadTable();

            } catch(error) {
                log.log(logTag, `Error adding coin "${coinId}!"`);
                log.log(logTag, error);
                this.setStatus("Error while adding code to DB!", 0, "error");
            }
        },

        async reloadTable() {
            const snapshot = await coinsCollection.get();
            let coins = {};
            snapshot.forEach((doc) => coins[doc.id] = doc.data());
            this.myCoins = coins;
            console.log(coins);


            this.reloading = true;

            const coinData = await getCoinMarketData(keys(coins), baseCurrency);

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
                    sparkline7d         : everyNth(coin.sparkline_in_7d?.price, 3),
                    fromAth             : coin.ath_change_percentage / 100,
                    fromAthDays         : relativeDays(coin.ath_date),
                    priceChange24h      : coin.price_change_percentage_24h_in_currency / 100,
                    priceChange7d       : coin.price_change_percentage_7d_in_currency / 100,
                    priceChange30d      : coin.price_change_percentage_30d_in_currency / 100,
                    priceChange200d     : coin.price_change_percentage_200d_in_currency / 100,

                    marketCapRank       : coin.market_cap_rank,
                    marketCap           : coin.market_cap,
                    marketCapChange24h  : coin.market_cap_change_percentage_24h / 100,

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

            // console.log(newTableData);

            this.$refs.table.hotInstance.loadData(newTableData);
            this.reloading = false;
        }
    }
}
</script>
<!---------------------------------------------------------------------------->
<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style>
    .handsontable td.currentRow,  .handsontable td.currentCol {
        background-color: rgba(44, 62, 80, 0.12);
    }
    .handsontable td, .handsontable th { font-size: 14px; }
    .handsontable td.text-smaller { font-size: 11px; }
    .handsontable td.text-smallest { font-size: 10px; }
    .handsontable td.htDimmed { color: black; }
    .handsontable th { white-space: normal !important; }

    .handsontable span.colHeader {
        height: 71px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .changeType {
        position: absolute;
        right: 0;
        top: 0;
    }

    .text-red { color : #B30F0FFF; }
    .text-green { color : #289f05; }


    .coinSymbol {
        font-weight: bold;
        background-color: #f0f0f0 !important;
    }

    #table-wrapper {
        margin: 10px 0;
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

    #market-caps .chart {
        position: relative;
        /*height: 94px !important;*/
        /*width: 192px !important;*/
        height: 70px !important;
        width: 165px !important;
        overflow: hidden;
    }

    #market-caps .chart canvas {
        max-height: 100% !important;
        max-width: 100% !important;
    }

    .description {
        font: 0.86em sans-serif;
    }
</style>
<style scoped>
    h1, h3 {
        margin-top: 10px;
        margin-bottom: 10px;
    }

    .add-coin-wrapper {
        margin-top: 10px;
    }

    .status-message-placeholder {
        height: 38px;
    }


</style>
