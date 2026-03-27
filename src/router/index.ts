import { createRouter, createWebHistory } from "vue-router";
import { useTrackerStore } from "../stores/tracker";
import Home from "../views/Home.vue";
import AddRecord from "../views/AddRecord.vue";
import Books from "../views/Books.vue";
import Profile from "../views/Profile.vue";
import Login from "../views/Login.vue";
import Statistics from "../views/Statistics.vue";
import PrivacyPolicy from "../views/PrivacyPolicy.vue";
import TermsOfService from "../views/TermsOfService.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/login", name: "login", component: Login },
    { path: "/privacy", name: "privacy", component: PrivacyPolicy },
    { path: "/terms", name: "terms", component: TermsOfService },
    { path: "/", name: "home", component: Home },
    { path: "/profile", name: "profile", component: Profile },
    { path: "/add", name: "add", component: AddRecord },
    { path: "/books", name: "books", component: Books },
    { path: "/statistics", name: "statistics", component: Statistics },
  ],
});

router.beforeEach((to) => {
  const store = useTrackerStore();
  
  // If user has NO name set, they MUST go to login, unless going to privacy or terms
  if (!store.isProfileSet && to.name !== "login" && to.name !== "privacy" && to.name !== "terms") {
    return { name: "login" };
  }

  // If already FORMALLY logged in (Google), don't let them go back to login
  if (store.userProfile.isLoggedIn && to.name === "login") {
    return { name: "home" };
  }

  // Otherwise (Anonymous or Normal navigation), proceed
});

export default router;
