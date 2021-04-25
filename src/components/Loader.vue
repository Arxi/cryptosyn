<template>
    <div class="loader-wrapper"
    >
        <div class="loader"></div>
        <div class="loader-text">
            Loading coins, connecting to Coinecko API, parsing the response etc etc
        </div>
    </div>
</template>
<!----------------------------------------------------------------------------->
<script>
const logTag = "Loader";
export default {
    name : logTag,
}
</script>
<!----------------------------------------------------------------------------->
<style scoped>
    .loader-wrapper {
        pointer-events: none;
        position: fixed;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 9999;
        overflow: hidden;
        background-color: #F5F5F5FF;
        opacity: 0.7;

        display: flex;
        flex-direction: column;
        justify-content: center;
        justify-items: center;
        align-items: center;
    }

    .loader {
        font-size: 10px;
        z-index: 10000;

        /*position: absolute;*/
        /*top: 50 %;*/
        /*left: 50 %;*/
        /*margin: - 20 px 0 0 - 20 px;*/

        text-indent: -9999em;
        border-top: 5px solid rgba(98, 125, 119, 0.84);
        border-right: 5px solid rgba(98, 125, 119, 0.84);
        border-bottom: 5px solid rgba(98, 125, 119, 0.84);
        border-left: 5px solid #627D77FF;
        -webkit-transform: translateZ(0);
        -ms-transform: translateZ(0);
        transform: translateZ(0);
        -webkit-animation: loaderSpinner 1.1s infinite linear;
        animation: loaderSpinner 1.1s infinite linear;

        border-radius: 50%;
        width: 40px;
        height: 40px
    }

    .loader:after {
        border-radius: 50%;
        width: 40px;
        height: 40px
    }

    .loader-text {
        margin-top: 20px;
        opacity: 1;
        font-weight: bold;

    }

    @-webkit-keyframes loaderSpinner {
        0% {
            -webkit-transform: rotate(0deg);
            transform: rotate(0deg);
        }
        100% {
            -webkit-transform: rotate(360deg);
            transform: rotate(360deg);
        }
    }

</style>