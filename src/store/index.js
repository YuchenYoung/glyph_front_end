import Vue from 'vue'
import Vuex from 'vuex'

// import axios from 'axios'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //data view
    data: [],
    data_type: {},
    data_range: {},
    data_ready: false,
    props: [],
    group_props: [],
    theme: "",

    //img view
    d_list: [],
    paths_size: [],
    img_type: [],
    svg_width: 0,
    svg_height: 0,
    svg_list: [],
    img_preview: [],
    img_ready: false,
    mapper: {},
    selected_img: {}
  },
  mutations: {

  },
  actions: {
    dataProcess() {
      const isDegreeData = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] > 1 || arr[i] < 0) {
            return false;
          }
        }
        return true;
      };
      const isInteger = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] % 1 !== 0) {
            return false;
          }
        }
        return true;
      };

      const isDataInSmallRange = (arr) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] > 5 || arr[i] < 0) {
            return false;
          }
        }
        return true;
      };
      const isCategorical = (arr) => {
        const key_set = new Set();
        arr.forEach((it) => {
          if (key_set.size > 7) {
            return false;
          }
          if (!key_set.has(it)) {
            key_set.add(it);
          }
        });
        return key_set.size <= 7;
      };
      const getDataRange = (arr) => {
        if (typeof arr[0] != typeof 0) {
          return { min: "", max: "" };
        }
        return {
          min: Math.min.apply(null, arr),
          max: Math.max.apply(null, arr),
        };
      };
      const judgeDataType = (arr) => {
        const value_type = typeof arr[0];
        if (value_type == typeof 0) {
          if (isInteger(arr)) {
            if (isDataInSmallRange(arr)) {
              return "small_range";
            }
          } else {
            if (isDegreeData(arr)) {
              return "degree";
            }
          }
          return "number";
        } else if (value_type == typeof "") {
          if (isCategorical(arr)) {
            return "category";
          } else {
            return "string";
          }
        }
      };

      // data process
      const data = this.state.data;
      this.state.props.forEach((it) => {
        this.state.data_type[it] = judgeDataType(
          data.map((d) => d[it])
        );
        this.state.data_range[it] = getDataRange(
          data.map((d) => d[it])
        );
      });
    },

    generate(state, view) {
      this.dispatch("dataProcess");
      // console.log(state);
      // console.log(view);
      view.$router.push({path: '/index/image'});
    },
    resetData() {
      this.state.data_ready = false;
      this.state.data = [];
      this.state.props = [];
      this.state.selected_props = [];
      this.state.data_type = {};
      this.state.data_range = {};
    },
  },
  modules: {
  },

})
