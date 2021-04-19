<script src="router.js"></script>
<template>
  <div id="app">

      <div v-if="loading" id="loading-info">
          Loading, signing you in, etc...wait pls
      </div>

      <div v-else id="login-info">
          <template v-if="this.loggedIn">
              You are logged in as {{ user.displayName }}. <a href="#" @click="signOut">Sign out</a>
          </template>
          <template v-else>
              You are not logged in! <a href="/#/auth">Log in here</a>
          </template>
      </div>

      <router-view></router-view>
  </div>
</template>
<!---------------------------------------------------------------------------->
<script>
import firebase from "firebase";
import log from "./services/logger";
const logTag = "App";

export default {
    name : logTag,

    mounted() {
        firebase.auth().onAuthStateChanged((user) => {
            this.loading = false;

            if (user) {
                // User is signed in.
                this.user = user;
                this.loggedIn = true;

            } else {
                // No user is signed in.
                this.user = {};
                this.loggedIn = false;
            }
        });
    },

    data() {
        return {
            loading     : true,
            loggedIn    : false,
            user        : {},
        }
    },

    methods: {
        signOut() {
            log.log(logTag, "Signing out");
            firebase.auth().signOut();
        }
    }
}
</script>
<!---------------------------------------------------------------------------->
<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 10px;

    position: relative;

    /*displa*/
}

#loading-info {
    text-align: center;
    font-weight: bold;
    font-size: 30px;
    padding-top: 50px;
}

#login-info {
    text-align: right;
}
</style>
