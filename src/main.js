import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en'
import axios from 'axios'
import x2js from 'x2js' 

Vue.config.productionTip = false
Vue.use(ElementUI, {locale})

Vue.prototype.$x2js = new x2js()
Vue.prototype.$axios = axios

axios.defaults.timeout = 300000;
axios.defaults.baseURL = 'http://10.76.2.222:8787/';
axios.defaults.headers.post['Content-Type'] = 'application/json;charset=UTF-8';

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
