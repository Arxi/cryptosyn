<template>
    <div id="market-caps">
        <button @click="reloadTable" :disabled="reloading">
            <span v-if="reloading">
                reloading...
            </span>
            <span v-else>
                reload table
            </span>
        </button>

        <button @click="recalculateSMAs" :disabled="reloading" v-if="isLoggedIn">
            recalculate SMAs
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
            <hot-table :data="tableData" :settings="toolSettings" licenseKey="non-commercial-and-evaluation"
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
import { HotTable } from '@handsontable/vue';
import { map, find, keys, assign, forEach } from "lodash";
import { getCoinMarketData, findCoinBySymbol, findCoinByCoingeckoId, calculateSMA } from "../services/cryptoApi";
import { auth } from "../services/firebase";
import { toolColumns } from "../services/hotUtils";
import { relativeDays, everyNth, priceAtMCFraction } from "../services/utils";
import Loader from "../components/Loader";
import StatusMessage from "../components/StatusMessage";

import log from "../services/logger";
const logTag = "TableTool";

const baseCurrency = "usd";

export default {
    name: logTag,

    components: { HotTable, Loader, StatusMessage },

    props : {
        coinsCollection : Object
    },

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
            // @todo: actually this doesn't seem to get ever populated
            tableData : [],

            latestTableData     : {},

            // HOT settings
            toolSettings: {
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

                    sma20d              : null,
                    sma60d              : null,
                    sma100d             : null,
                    sma200d             : null,
                    sma2y               : null,
                    sma5x2y             : null,

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

                columns             : toolColumns,

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

                // this prevents lazyloading:
                viewportColumnRenderingOffsetnumber : 30,
                viewportRowRenderingOffsetnumber    : 100,

                // fixedRowsTop        : 1,
                fixedColumnsLeft    : 1,
                columnSorting       : true,
                // width: '100%',
                className           : "htMiddle",

                afterGetColHeader: function(col, TH) {
                    TH.className = 'htMiddle';
                },

                afterChange         : async (change, source) => {
                    if (source !== "edit" ) {
                        return;
                    }

                    log.log(logTag, `Data changed, source: ${source}`);
                    log.log(logTag, change);

                    if (!auth.currentUser) {
                        log.log(logTag, `Not logged in!`);
                        this.setStatus(
                            "You are not signed in, or don't have necessary permissions!",
                            0,
                            "error"
                        );
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
                            await this.coinsCollection.doc(oldValue).delete();
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

                        await this.coinsCollection.doc(coinId).update({[prop]: newValue});
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
                await this.coinsCollection.doc(coinId).set(
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
            const snapshot = await this.coinsCollection.get();
            let coinsFromDb = {};
            snapshot.forEach((doc) => coinsFromDb[doc.id] = doc.data());
            this.myCoins = coinsFromDb;
            console.log(coinsFromDb);


            this.reloading = true;

            const coinData = await getCoinMarketData(keys(coinsFromDb), baseCurrency);

            const bitcoin = find(coinData, { id : "bitcoin" });

            let currentCoinId = 0;

            const newTableData = map(coinData, (coin) => {
                currentCoinId++;
                return {
                    id                  : currentCoinId,
                    coinSymbol          : coin.symbol.toUpperCase(),
                    coingeckoId         : coin.id,
                    baserank            : coinsFromDb[coin.id].baserank,
                    circulatingSupply   : Math.floor(coin.circulating_supply),

                    price               : coin.current_price,
                    sparkline7d         : everyNth(coin.sparkline_in_7d?.price, 3),
                    fromAth             : coin.ath_change_percentage / 100,
                    fromAthDays         : relativeDays(coin.ath_date),
                    priceChange24h      : coin.price_change_percentage_24h_in_currency / 100,
                    priceChange7d       : coin.price_change_percentage_7d_in_currency / 100,
                    priceChange30d      : coin.price_change_percentage_30d_in_currency / 100,
                    priceChange200d     : coin.price_change_percentage_200d_in_currency / 100,

                    sma20d              : coinsFromDb[coin.id].sma20d,
                    sma60d              : coinsFromDb[coin.id].sma60d,
                    sma100d             : coinsFromDb[coin.id].sma100d,
                    sma200d             : coinsFromDb[coin.id].sma200d,
                    sma2y               : coinsFromDb[coin.id].sma2y,
                    sma5x2y             : coinsFromDb[coin.id].sma5x2y,

                    marketCapRank       : coin.market_cap_rank,
                    marketCap           : coin.market_cap,
                    marketCapChange24h  : coin.market_cap_change_percentage_24h / 100,

                    btcMcFraction       : coin.market_cap / bitcoin.market_cap,
                    priceAt05           : priceAtMCFraction(0.005, coin.circulating_supply, bitcoin.market_cap),
                    priceAt1            : priceAtMCFraction(0.01, coin.circulating_supply, bitcoin.market_cap),
                    priceAt2            : priceAtMCFraction(0.2, coin.circulating_supply, bitcoin.market_cap),
                    priceAt5            : priceAtMCFraction(0.05, coin.circulating_supply, bitcoin.market_cap),
                    priceAt10           : priceAtMCFraction(0.10, coin.circulating_supply, bitcoin.market_cap),
                    priceAt20           : priceAtMCFraction(0.20, coin.circulating_supply, bitcoin.market_cap),
                    priceAt30           : priceAtMCFraction(0.30, coin.circulating_supply, bitcoin.market_cap),
                }
            });

            // console.log(newTableData);

            this.$refs.table.hotInstance.loadData(newTableData);
            this.reloading = false;

            this.latestTableData = newTableData;
        },

        async recalculateSMAs() {
            if (!auth.currentUser) {
                log.log(logTag, `Not logged in!`);
                this.setStatus(
                    "You are not signed in, or don't have necessary permissions!",
                    0,
                    "error"
                );
                return;
            }

            if (!this.myCoins) {
                this.setStatus("Add some coins first", 0, "error");
                return;
            }

            this.reloading = true;
            const smas = await calculateSMA(keys(this.myCoins), baseCurrency);
            // console.log(smas);

            for (let i = 0; i < this.latestTableData.length; i++) {
                assign(this.latestTableData[i], smas[this.latestTableData[i].coingeckoId]);
            }

            // console.log(this.latestTableData);
            this.$refs.table.hotInstance.loadData(this.latestTableData);
            this.reloading = false;

            // update the remote DB
            forEach(smas, (smaData, coingeckoId) => {
                // no reason to await it
                this.coinsCollection.doc(coingeckoId).update(smaData);
            });
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
    .handsontable td.text-small { font-size: 12px; }
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
