import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
    { path: '/', name: 'Home', component: () => import('../views/HomeView.vue'), meta: { requiresAuth: true } },
    { path: '/login', name: 'Login', component: () => import('../views/LoginView.vue'), meta: { guestOnly: true } },
    { path: '/signup', name: 'Signup', component: () => import('../views/SignupView.vue'), meta: { guestOnly: true } },
    { path: '/friends', name: 'Friends', component: () => import('../views/FriendsView.vue'), meta: { requiresAuth: true } },
    { path: '/groups', name: 'Groups', component: () => import('../views/GroupsView.vue'), meta: { requiresAuth: true } },
    { path: '/debts', name: 'Debts', component: () => import('../views/DebtsView.vue'), meta: { requiresAuth: true } },
    { path: '/admin', name: 'Admin', component: () => import('../views/AdminView.vue') },
    { path: '/add-meal', name: 'AddMeal', component: () => import('../views/AddMealView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'Profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore()
    
    // Wait for auth to initialize before checking routes
    if (!authStore.isInitialized) {
        await new Promise(resolve => {
            const unwatch = authStore.$subscribe((mutation, state) => {
                if (state.isInitialized) {
                    unwatch()
                    resolve()
                }
            })
            // If already initialized by the time we subscribe
            if (authStore.isInitialized) {
                unwatch()
                resolve()
            }
        })
    }

    const isLoggedIn = !!authStore.user

    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/login')
    } else if (to.meta.guestOnly && isLoggedIn) {
        next('/')
    } else {
        next()
    }
})

export default router