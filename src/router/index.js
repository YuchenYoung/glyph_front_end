import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/index'
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Test.vue')
  },
  {
    path: '/whole',
    name: 'whole',
    component: () => import('../views/Whole.vue')
  },
  {
    path: '/index',
    name: 'index',
    component: () => import('../views/Index.vue'),
    children: [
      {
        path: '',
        redirect: 'data'
      },
      {
        path: 'data',
        name: 'data',
        component: () => import('../components/UpFile.vue')
      },
      {
        path: 'preprocess',
        name: 'preprocess',
        component: () => import('../components/Preprocess.vue')
      },
      {
        path: 'image',
        name: 'image',
        component: () => import('../components/UpImage.vue')
      },
      {
        path: 'vis',
        name: 'vis',
        component: () => import('../components/Visualization.vue')
      }
    ]
  },
]

const router = new VueRouter({
  routes
})

export default router
