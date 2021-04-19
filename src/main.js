import Vue from 'vue';
import App from './App.vue';
import VueRouter from "vue-router";
import router from "./router";
import { auth } from './services/firebase';

Vue.use(VueRouter);
Vue.config.productionTip = false;

let app;
// This ensures Firebase initializes before loading the app when a user refreshes a page.
auth.onAuthStateChanged(() => {
  if (!app) {
      app = new Vue({
        router,
        created() {
          console.log(`==== Main instance created ====`);
        },
        render: h => h(App)
      }).$mount('#app')
    }
});
