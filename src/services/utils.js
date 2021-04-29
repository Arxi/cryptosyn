export const relativeDays = (date) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(date);
    return "-" + Math.round(elapsedMs/msPerDay) + "D";
}

// @note: starting from the end, i.e. always including the last (latest) data point
export const everyNth = (array, n) => {
    let newArray = [];
    for (let i = array.length - 1; i >= 0; i -= n) {
        newArray.push(array[i]);
    }
    return newArray.reverse();
}

export const waitFor = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const roundPrice = (price) => price > 100
    ? Math.round(price)
    : (price > 10
        ? Math.round(price * 10) / 10
        : Math.round(price * 100) / 100);

// just a helper to calculate price of coin at certain target market cap fraction (e.g. BTC market cap)
export const priceAtMCFraction = (fraction, circulatingSupply, targetMarketCap) =>
    roundPrice(fraction * targetMarketCap / circulatingSupply);