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
