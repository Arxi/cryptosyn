import VueRouter from "vue-router";
import firebase from "firebase/app";

import Auth from "./pages/Auth";
import MarketCaps from "./pages/MarketCaps";

import log from "./services/logger";
const logTag = "router";


const routes = [
    {
        // @note: route param on root route would cause problems with navigation
        path : '/',
        redirect: "/table"
    },
    {
        path : "/auth",
        name : 'AUTH',
        component : Auth,
        meta : { requiresAuth : false },
    },
    {
        path : "/table",
        name : 'TABLE',
        component : MarketCaps,
        meta : { requiresAuth : true }
    },
];

const router = new VueRouter({
    routes,
    // mode : "history",
    // base : __dirname,
    // linkActiveClass : "active"
});

router.beforeEach((to, from, next) => {
    // scroll to top
    window.scrollTo(0, 0);

    // redirect if the route needs authentication and the user is not logged in
    if (to.matched.some(record => record.meta.requiresAuth)) {

        firebase.auth().onAuthStateChanged(function(user) {

            log.log(logTag, `changing route to ${to.path} (${to.name})`);
            console.log(user);

            if (user) {
                // User is signed in.
                next();

            } else {
                // No user is signed in.
                next({ path : "/auth" });
            }
        });

    } else {
        next();
    }
});

export default router;
