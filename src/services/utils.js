export const relativeDays = (date) => {
    const msPerDay = 24 * 60 * 60 * 1000;
    const elapsedMs = Date.now() - new Date(date);
    return "-" + Math.round(elapsedMs/msPerDay) + "D";
}