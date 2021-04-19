<template>
    <div id="auth">
        <div id="firebaseui-auth-container"></div>
        <div id="loader">Loading...</div>
    </div>
</template>
<!---------------------------------------------------------------------------->
<script>
/* eslint-disable no-unused-vars */
import log from "../services/logger";
import * as firebaseui from "firebaseui";
import firebase from "firebase/app";
import { auth } from "../services/firebase";
const logTag = "Auth";

export default {
    name: logTag,

    mounted() {
        // console.log(`[${logTag}] mounted`);
        log.log(logTag, "mounted");
        this.$nextTick(() => {
            const ui = firebaseui.auth.AuthUI.getInstance()
                || new firebaseui.auth.AuthUI(auth);

            ui.start('#firebaseui-auth-container', {
                callbacks: {
                    signInSuccessWithAuthResult: function(authResult, redirectUrl) {
                        console.log("signInSuccessWithAuthResult");
                        // User successfully signed in.
                        // Return type determines whether we continue the redirect automatically
                        // or whether we leave that to developer to handle.
                        return true;
                    },
                    uiShown: function() {
                        // The widget is rendered.
                        // Hide the loader.
                        document.getElementById('loader').style.display = 'none';
                    }
                },
                // signInFlow: 'popup',
                signInSuccessUrl: "/#/table",
                signInOptions: [
                    firebase.auth.EmailAuthProvider.PROVIDER_ID
                ],
                // Other config options...
            });
        });
    },


}


</script>
<!---------------------------------------------------------------------------->
