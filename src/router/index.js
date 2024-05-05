// Composables
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/:id?',
        name: 'FeatureModel',
        props: true,
        component: () => import('@/views/FeatureModel.vue'),
        meta: {
            title: 'Feature Model Viewer',
        },
    },
    {
        path: '/collaboration/:collaborationKey',
        name: 'Collaboration',
        props: true,
        component: () => import('@/views/FeatureModel.vue'),
        meta: {
            title: 'Collaboration Mode',
        },
    },
    {
        path: '/configurator/:id?',
        name: 'Configurator',
        props: true,
        component: () => import('@/views/FeatureModelSoloConfigurator.vue'),
        meta: {
            title: 'Configurator',
        },
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
