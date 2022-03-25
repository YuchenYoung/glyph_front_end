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
    similarity: [],
    prop_similarity: {},

    //img view
    all_svgs: [],
    d_list: [],
    paths_size: [],
    img_type: [],
    svg_width: 0,
    svg_height: 0,
    svg_list: [],
    img_preview: [],
    first_imgs: [],
    img_ready: false,
    mapper: {},
    selected_index: 0,
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
          if (key_set.size > 10) {
            return false;
          }
          if (!key_set.has(it)) {
            key_set.add(it);
          }
        });
        return key_set.size <= 10;
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
      const isTimeProp = (prop) => {
        const time_props = ['time', 'year', 'date', 'day']
        return time_props.includes(prop);
      }; 
      const isGeogData = (prop => {
        if (prop.length >= 0) {
          return false;
        }
        return false;
      })
      const judgeDataType = (prop, arr) => {
        if (isTimeProp(prop)) {
          return "time";
        }
        if (isGeogData(prop)) {
          return "geography";
        }
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
      const judgeGroupType = (props, types) => {
        for (let i = 0; i < props.length; i++) {
          if (types[props[i]] != "degree") {
            return "value";
          }
        }
        return 'degree';
      };

      // data process
      const data = this.state.data;
      this.state.props.forEach((it) => {
        this.state.data_type[it] = judgeDataType(it, data.map((d) => d[it]));
        this.state.data_range[it] = getDataRange(
          data.map((d) => d[it])
        );
      });
      this.state.group_props.forEach((it, index) => {
        this.state.data_type[`group${index}`] = judgeGroupType(it, this.state.data_type);
      })
    },

    generate(state, view) {
      this.dispatch("dataProcess");
      // console.log(state);
      // console.log(view);
      view.$axios({
        method: "post",
        url: "/mapping/similarity/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: {
          theme: this.state.theme,
          dataProps: this.state.props,
          dataTypes: this.state.data_type,
          groups: this.state.group_props
        },
      }).then(res => {
        this.state.props = res.data.props;
        this.state.similarity = res.data.similarity;
        this.state.prop_similarity = res.data.dic;
        view.$router.push({path: '/index/image'});
      });
    },
    resetData(state, view) {
      // reset data variables
      this.state.data_ready = false;
      this.state.theme = "";
      this.state.data = [];
      this.state.props = [];
      this.state.data_type = {};
      this.state.data_range = {};
      this.state.group_props = [];
      // reset image variables
      this.state.all_svgs = [];
      this.state.d_list = [];
      this.state.paths_size = [];
      this.state.img_type = [];
      this.state.svg_width = 0;
      this.state.svg_height = 0;
      this.state.svg_list = [];
      this.state.img_preview = [];
      this.state.first_imgs = [];
      this.state.img_ready = false;
      this.state.mapper = {};
      this.state.selected_index = 0;
      this.state.selected_img = {};
      // go back to upfile page
      view.$router.push({path: '/index/data'});
    },
  },
  modules: {
  },

})
