<template>
    <div id="public-tool">
        <h1>coin "analysis" tool v0.4.1 lol (public)</h1>
        <table-tool :coins-collection="coinsCollection" />
    </div>
</template>
<!---------------------------------------------------------------------------->
<script>
/* eslint-disable no-unused-vars */
import { publicToolCoinsCollection } from "../services/firebase";
import TableTool from "../components/TableTool";
import log from "../services/logger";
const logTag = "PublicTool";

export default {
    name: logTag,

    components : { TableTool },

    data: function() {
        return {
            coinsCollection : publicToolCoinsCollection
        }
    },

    mounted() {
        log.log(logTag, "mounted");
    },

}
</script>
<!---------------------------------------------------------------------------->
