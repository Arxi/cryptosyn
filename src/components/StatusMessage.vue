<template>
    <div class="status-message" :class="className" v-show="text">
        <span class="status-text">
            {{ text }}
        </span>
        <span v-show="status">
            Status: {{ status }}
        </span>
    </div>
</template>
<!----------------------------------------------------------------------------->
<script>
const logTag = "StatusMessage";
export default {
    name : logTag,
    props : {
        text        : String,
        status      : Number,
        className   : String
    }
}
</script>
<!----------------------------------------------------------------------------->
<style scoped>
    .status-message {
        margin-top: 10px;
        padding: 7px 0;
    }
    .error {
        border: 1px solid #B30F0FFF;
        color: #B30F0FFF;
    }
    .info {
        border: 1px solid #0365c8;
        color: #0365c8;
    }
    .success {
        border: 1px solid #289f05;
        color: #289f05;
    }

</style>