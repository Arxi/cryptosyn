import VueRouter from "vue-router";
import { auth } from './services/firebase';

import Auth from "./pages/Auth";
import PublicTool from "./pages/PublicTool";
import PrivateTool from "./pages/PrivateTool";


import log from "./services/logger";
const logTag = "router";


const routes = [
    {
        // @note: route param on root route would cause problems with navigation
        path : '/',
        redirect: "/tool"
    },
    {
        path : "/auth",
        name : 'AUTH',
        component : Auth,
        meta : { requiresAuth : false },
    },

    {
        path : "/tool",
        name : 'PUBLIC-TOOL',
        component : PublicTool,
        meta : { requiresAuth : false }
    },

    {
        path : "/my-tool",
        name : 'PRIVATE-TOOL',
        component : PrivateTool,
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
    log.log(logTag, `changing route to ${to.path} (${to.name})`);

    // redirect if the route needs authentication and the user is not logged in
    if (to.matched.some(record => record.meta.requiresAuth) && !auth.currentUser) {
        next({ path : "/auth" });
    } else {
        next();
    }
});

export default router;
