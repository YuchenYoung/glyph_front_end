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
    selected_props: [],
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

    /*
    imgProcess(state, view) {
      let search_num = 0;
      let deal_num = 0;
      let all_svgs = [];
      let sep_objs = [];
      let dis = {};

      const judgeImgType = (d, size) => {
        if (size.width / size.height >= 3.5) {
          return "linear_horizon";
        } else if (size.height / size.width >= 3.5) {
          return "linear_vertical";
        } else {
          return "square";
        }
      };

      const filterSepSvgs = (d_list, img_width, img_height) => {
        let fil_ds = [];
        d_list.forEach((it) => {
          view.$refs.svgSize.innerHTML = `<svg><path d="${it}"></path></svg>`;
          const cur_size =
            view.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          view.$refs.svgSize.innerHTML = "";
          if (
            cur_size.width / img_width < 0.05 &&
            cur_size.height / img_height < 0.05
          ) {
            return;
          }
          let judge = true;
          d_list.forEach((out) => {
            if (!judge || it == out) return;
            view.$refs.svgSize.innerHTML = `<svg><path d="${out}"></path></svg>`;
            const out_size =
              view.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
            view.$refs.svgSize.innerHTML = `<svg><path d="${out + it
              }"></path></svg>`;
            const tog_size =
              view.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
            view.$refs.svgSize.innerHTML = "";
            if (
              Math.abs(out_size.height - tog_size.height) <= 1e-6 &&
              Math.abs(out_size.width - tog_size.width) <= 1e-6
            ) {
              judge = false;
            }
          });
          if (judge) fil_ds.push(it);
        });
        return fil_ds;

      };

      const uploadSegmentation = (obj) => {
        // this.svg_style.width = obj.width + "px";
        // this.svg_style.height = obj.height + "px";
        state.svg_width = obj.width;
        state.svg_height = obj.height;
        let dis = { eles: [] };
        dis.width = 100;
        const scale = dis.width / obj.width;
        dis.height = scale * obj.height;
        dis.style = {
          width: dis.width + "px",
          height: dis.height + "px",
        };
        const tranx = obj.width * 0.5 * (scale - 1);
        const trany = obj.height * 0.5 * (scale - 1);
        // this.svg_list = obj.svgs;
        state.svg_list = obj.svgs;
        state.d_list = obj.ds;
        obj.ds.forEach((it) => {
          dis.eles.push(
            `<svg width="${obj.width}" height="${obj.height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="${it}"></path></svg>`
          );
          view.$refs.svgSize.innerHTML = `<svg><path d="${it}"></path></svg>`;
          const cur_size =
            view.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          view.$refs.svgSize.innerHTML = "";
          state.paths_size.push({
            width: cur_size.width,
            height: cur_size.height,
          });
          state.img_type.push(judgeImgType(it, cur_size));
        });
        // this.dis = dis;
        state.img_preview = dis;
        state.img_ready = true;
      };

      const segmentSvg = (src) => {
        let retval = { svgs: [], ds: [] };
        let mid_st_str = `<path d="`;
        let mid_start = src.indexOf(mid_st_str) + mid_st_str.length;
        let head = src.substring(0, mid_start);
        retval.width = +head.split(`width="`)[1].split(`"`)[0];
        retval.height = +head.split(`height="`)[1].split(`"`)[0];
        src = src.substr(mid_start + 1);
        let mid_end = src.indexOf(`"`);
        let mid = src.substr(0, mid_end);
        let tail = src.substr(mid_end);
        let ori_ds = [];
        mid.split("M").forEach((it) => {
          ori_ds.push("M" + it);
        });
        const filter_ds = filterSepSvgs(ori_ds, retval.width, retval.height);
        retval.svgs.push(head + filter_ds.join(" ") + tail);
        retval.ds.push(filter_ds.join(" "));
        filter_ds.forEach((it) => {
          retval.ds.push(it);
          retval.svgs.push(head + it + tail);
        });
        return retval;
      };

      const mapPartData = (pos, num, best_img, best_score, best_map) => {
        console.log(`map part ${pos} ${num} ${best_img}`)
        if (pos >= num) {
          uploadSegmentation(sep_objs[best_img]);
          state.mapper = best_map;
          return;
        }
        let up_data = {
          content: state.theme,
          dataProps: state.props,
          svgsList: all_svgs.slice(pos, pos + 4),
        };
        axios({
          method: "post",
          url: "/mapping/mul/",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: up_data,
        }).then((res) => {
          console.log("~~~~~~~~~~~~~~~~~~~");
          console.log(res.data);
          if (res.data.score > best_score) {
            best_score = res.data.score;
            best_img = pos + res.data.best_img;
            best_map = res.data.mapper;
          }
          mapPartData(pos + 4, this.all_svgs.length, best_img, best_score, best_map);
        });
      };

      const loadImgs = (img_urls) => {
        img_urls.forEach((it) => {
          const potrace = require("potrace");
          try {
            potrace.trace(it, function (err, svg) {
              if (err) {
                // deal_num++;
                console.log(`A== ${deal_num}`);
                throw err;
              }
              let obj = segmentSvg(svg.toString());
              console.log(obj);
              if (obj.svgs.length >= 4 &&
                obj.svgs.length <= 1.5 * state.prop.length) {
                sep_objs.push(obj);
                all_svgs.push(obj.svgs);
                deal_num++;
                console.log(`B== ${deal_num}`);
              }
            });
          } catch (err) {
            console.log("A=err");
          }
        });
      };

      axios({
        method: "get",
        url: "/search/",
        params: {
          keyWords: state.theme,
          imgNum: 400,
        },
      }).then((res) => {
        let img_urls = [];
        res.data.forEach((it) => {
          img_urls.push(it);
        });
        search_num = img_urls.length;
        console.log(img_urls);
        this.loadImgs(img_urls);
        // this.viewImg(img_urls[4]);
      });
    },
    */

    generate(state, view) {
      this.dispatch("dataProcess");
      console.log(view);
      view.$router.push({path: '/index/image'});
      // this.dispatch("imgProcess", view);
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
