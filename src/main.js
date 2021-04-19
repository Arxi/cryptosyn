import Vue from 'vue';
import App from './App.vue';
import VueRouter from "vue-router";
import router from "./router";


import firebase from "firebase/app";
import "firebase/analytics";
import "firebase/auth";
import "firebase/firestore";
// import firebaseui from "firebaseui";

const firebaseConfig = {
  apiKey: "AIzaSyCSX3mNG7rKEOghK5DKbydZ1uRioNAMvFw",
  authDomain: "cryptosyn.firebaseapp.com",
  projectId: "cryptosyn",
  storageBucket: "cryptosyn.appspot.com",
  messagingSenderId: "879058630357",
  appId: "1:879058630357:web:9f44d091bf3b6950d8145c",
  measurementId: "G-MHQJMKRMS3"
};
firebase.initializeApp(firebaseConfig);

// const ui = new firebaseui.auth.AuthUI(firebase.auth());



Vue.use(VueRouter);

Vue.config.productionTip = false;

new Vue({
  router,
  created() {
    console.log(`==== Main instance created ====`);
  },
  render: h => h(App),
}).$mount('#app')
