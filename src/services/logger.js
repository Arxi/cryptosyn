class Logger {
    log(logTag, thingToLog) {
        // if (!config.logsEnabled) {
        //     return;
        // }

        // only one parameter was provided. Treat it as the message, not only as a tag
        if (typeof thingToLog === "undefined") {
            console.log(logTag);
        } else {
            console.log(`[${logTag}]`, thingToLog);
        }
    }
}

const log = new Logger();

export default log;
