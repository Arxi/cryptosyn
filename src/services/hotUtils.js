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

export const sparklineRenderer = (instance, td, row, column, prop, value, cellProperties) => {
    if (!td.hasChildNodes()) {
        if (cellProperties.chart) {
            cellProperties.chart.destroy();
            cellProperties.chart = void 0;
        }
    } else if (cellProperties.chart) {
        cellProperties.chart.update();
        return td;
    }

    var sparkline = instance.getDataAtRowProp(row, 'sparkline7d');

    var chartContainer = document.createElement('div');
    chartContainer.className = 'chart';
    var chartCanvas = document.createElement('canvas');
    chartContainer.appendChild(chartCanvas);
    td.appendChild(chartContainer);

    // sparkline = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    //

    // generate the labels
    const now = Date.now();
    const n = 3;    // depends on "everyNth" - how the decimation was done
    const labels = [];

    for (let i = 0; i < sparkline.length; i++) {
        const tickDate = new Date(now - (sparkline.length - i - 1) * n * 60 * 60 * 1000);
        const dateString = tickDate.toLocaleDateString([], { day : "numeric", month : "numeric" });
        const timeString = tickDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        labels.push(`${dateString} ${timeString}`);
    }
    // console.log(labels);


    // determine the chart color
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