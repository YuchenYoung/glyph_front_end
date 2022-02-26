import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    data: [],
    img_content: "",
    d_list: [],
    paths_size: [],
    data_type: [],
    img_type: [],
    svg_width: 0,
    svg_height: 0,
    svg_list: [],
    props: [],
    img_preview: {
      eles: [],
      style: {}
    },
    data_ready: false,
    img_ready: false,
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  }
})
