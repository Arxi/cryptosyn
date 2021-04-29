/* eslint-disable no-unused-vars */
import Handsontable from "handsontable";
import {
    Chart,
    LineElement,
    CategoryScale,
    LinearScale,
    LineController,
    PointElement,
} from "chart.js";
Chart.register(
    LineElement,
    CategoryScale,
    LinearScale,
    LineController,
    PointElement
);
// import Chart from 'chart.js/auto';
const baseCurrency = "usd";

const priceFormat = { pattern: '$0,00.00', culture: 'en-US' };
const roundedPriceFormat = { pattern: '$0,00.##', culture: 'en-US' };
const marketCapFormat = { pattern: '$0,00', culture: 'en-US' };
const percentFormat = { pattern: '0.0%' };
const percentFormat2dec = { pattern: '0.00%' };


// inspired by https://handsontable.com/blog/articles/2017/10/integrating-handsontable-with-chart-js
export const sparklineRenderer = (instance, td, row, column, prop, value, cellProperties) => {
    // const coingeckoId = instance.getDataAtRowProp(row, 'coingeckoId');
    // console.log(`=============== sparklineRenderer: ${coingeckoId}`);
    // some original code
    // if (!td.hasChildNodes()) {
    //     if (cellProperties.chart) {
    //         cellProperties.chart.destroy();
    //         cellProperties.chart = void 0;
    //     }
    // } else if (cellProperties.chart) {
    //     cellProperties.chart.update();
    //     return td;
    // }

    // this should prevent double charts and missing charts on sorting, table reload, table edit etc
    if (td.hasChildNodes()) {
        if (cellProperties.chart) {
            cellProperties.chart.destroy();
            cellProperties.chart = void 0;
        }
        td.innerHTML = "";
    }

    // create the canvas onto which the chart can be constructed
    const chartContainer = document.createElement('div');
    chartContainer.className = 'chart';
    const chartCanvas = document.createElement('canvas');
    chartContainer.appendChild(chartCanvas);
    td.appendChild(chartContainer);


    const sparkline = instance.getDataAtRowProp(row, 'sparkline7d');

    // generate the date labels
    const now = Date.now();
    const n = 3;    // depends on "everyNth" - how the decimation was done
    const labels = [];

    for (let i = 0; i < sparkline.length; i++) {
        const tickDate = new Date(now - (sparkline.length - i - 1) * n * 60 * 60 * 1000);
        const dateString = tickDate.toLocaleDateString([], { day : "numeric", month : "numeric" });
        const timeString = tickDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        labels.push(`${dateString} ${timeString}`);
    }

    // determine the sparkline chart color
    const chartColor = sparkline[0] > sparkline[sparkline.length - 1] ? "#B30F0FFF" : "#289f05";

    cellProperties.chart = new Chart(chartCanvas.getContext('2d'), {
        type: 'line',
        data: {
            labels : labels,
            datasets: [{
                label       : '',
                data        : sparkline,
                borderWidth : 1,
                pointRadius : 1,
                borderColor : chartColor,
                fill        : false,
                lineTension : 0
            }]
        },
        options: {
            animation: false,
            responsive: true,
            // showLine: false, // disable for all datasets
            tooltips: {
                mode: 'point',
                intersect: false,
                caretPadding : 10,
                displayColors : false
            },
            // hover: {
            //     mode: 'nearest',
            //     intersect: true
            // },
            plugins : {
                legend: {
                    display: false,
                },
            },

            scales: {
                x : {
                    display: false,
                    title: {
                        display: false,
                    },
                },
                y : {
                    display: true,
                    ticks : {
                        font : {
                            size : 8
                        },
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                            return '$' + value;
                        }
                    }
                }
            }
        }
    });

    return td;
}

export function priceColorRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);
    // if row contains negative number
    if (value < 0) {
        td.className = 'htMiddle htRight htNumeric text-red';
    } else {
        td.className = 'htMiddle htRight htNumeric text-green';
    }
}

export function smaColorRenderer(instance, td, row, col, prop, value, cellProperties) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);

    const currentPrice = instance.getDataAtRowProp(row, 'price');

    // if the current price is under this SMA - use red
    if (currentPrice < value) {
        td.className = 'htMiddle htCenter htNumeric text-small text-red';
    } else {
        td.className = 'htMiddle htCenter htNumeric text-small text-green';
    }
}

export const toolColumns = [
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

    { title : "SMA 20D", data : "sma20d", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },
    { title : "SMA 60D", data : "sma60d", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },
    { title : "SMA 100D", data : "sma100d", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },
    { title : "SMA 200D", data : "sma200d", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },
    { title : "SMA 2Y", data : "sma2y", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },
    { title : "SMA 5x2Y", data : "sma5x2y", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, width: 55, renderer : smaColorRenderer },

    { title : "MC rank", data : "marketCapRank", type : "numeric", readOnly: true,
        width: 40, className: "htMiddle htCenter" },
    { title : "Market cap", data : "marketCap", type : "numeric", numericFormat : marketCapFormat,
        readOnly: true, width: 90, className: "htMiddle htCenter text-smallest" },
    { title : "MC 24h", data : "marketCapChange24h", type : "numeric", numericFormat : percentFormat,
        readOnly: true, width: 60, renderer : priceColorRenderer },
    { title : "Circ. supply", data : "circulatingSupply", type : "numeric", readOnly: true,
        className: "htMiddle htCenter text-smallest", width : 70 },

    { title : "% of BTC MC", data : "btcMcFraction", type : "numeric", numericFormat : percentFormat2dec,
        readOnly: true, className: "htMiddle text-small", width: 65 },
    { title : "at 0.5%", data : "priceAt05", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
    { title : "at 1%", data : "priceAt1", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
    { title : "at 2%", data : "priceAt2", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true,className: "htMiddle text-small", width: 55 },
    { title : "at 5%", data : "priceAt5", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
    { title : "at 10%", data : "priceAt10", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
    { title : "at 20%", data : "priceAt20", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
    { title : "at 30%", data : "priceAt30", type : "numeric", numericFormat : roundedPriceFormat,
        readOnly: true, className: "htMiddle text-small", width: 55 },
]
