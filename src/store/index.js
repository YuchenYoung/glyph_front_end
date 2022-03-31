import Vue from 'vue'
import Vuex from 'vuex'

import * as path_convert from '../assets/js/convert-to-path.js';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //data view
    data: [],
    data_type: {},
    data_range: {},
    data_ready: false,
    props: [],
    names: [],
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
        this.state.data_range[it] = getDataRange(data.map((d) => d[it]));
      });
      this.state.group_props.forEach((it, index) => {
        this.state.data_type[`group${index}`] = judgeGroupType(it, this.state.data_type);
      })
    },

    imageProcess(state, view) {
      const searchSvg = () => {
        view.$axios({
          method: "get",
          url: "/search/svg/",
          params: {
            keyWords: this.state.theme,
            imgNum: 8,
          },
        }).then((res) => {
          res.data.svgs.forEach(it => {
            let obj = formatSvg(it);
            if (obj.has_color && obj.svgs.length >= 4 && obj.svgs.length <= 9) {
              uploadSegmentation(obj);
              this.state.all_svgs.push(obj.svgs);
            }
          });
          mapPartData(0, this.state.all_svgs.length, -1, -1, []);
        });
      };
      const filterContent = (obj, tag, svg_obj) => {
        const invalid_tags = ['title'];
        if (invalid_tags.includes(tag)) {
          return;
        }
        if (Object.prototype.toString.call(obj) === "[object Array]") {
          for (let i = 0; i < obj.length; i++) {
            filterContent(obj[i], tag, svg_obj);
          }
          return;
        }
        const keys = Object.keys(obj);
        for (let i = 0; i < keys.length; i++) {
          if (keys[i][0] != '_') {
            filterContent(obj[keys[i]], keys[i], svg_obj);
          }
        }
        if (tag == 'svg') {
          let view_size = obj._viewBox.split(' ');
          svg_obj.width = +view_size[2];
          svg_obj.height = +view_size[3]; 
          return;
        }
        let path_obj = {};
        if (tag == 'path') {
          path_obj.d = obj._d;
        } else if (tag == 'rect') {
          path_obj.d = path_convert.convertRectangles(obj._x, obj._y, obj._width, obj._height);
        } else if (tag == 'polygon') {
          path_obj.d = path_convert.convertPoly(obj._points, 'polygon');
        } else if (tag == 'circle') {
          path_obj.d = path_convert.convertCE(obj._cx, obj._cy, obj._r);
        } else if (tag == 'ellipse') {
          path_obj.d = path_convert.convertCE(obj._cx, obj._cy, obj._rx, obj._ry);
        } else {
          return;
        }
        if (!checkDAvailable(path_obj.d)) {
          return;
        }
        if (keys.includes('_style')) {
          const items = obj._style.split(';');
          items.forEach(it => {
            const v = it.split(':');
            if (v[0] == 'fill') {
              path_obj.fill = v[1];
              svg_obj.has_color = true;
            } else if (v[0] == 'stroke') {
              path_obj.stroke = v[1];
            }
          });
        }
        if (keys.includes('_fill')) {
          path_obj.fill = obj._fill;
          svg_obj.has_color = true;
        }
        if (path_obj['fill'] === undefined) {
          path_obj.fill = 'black';
        }
        if (path_obj['stroke'] === undefined) {
          path_obj.stroke = 'black';
        }
        svg_obj.paths.push(path_obj);
      };
      const checkDAvailable = (d) => {
        return d.indexOf('NaN') < 0 && d.indexOf('undefined') < 0
      };
      const mapPartData = (pos, num, best_img, best_score, best_map) => {
        console.log(`map part ${pos} ${num} ${best_img}`);
        if (pos >= num) {
          this.state.mapper = best_map;
          this.state.selected_index = best_img;
          const obj = this.state.img_preview[best_img];
          this.state.selected_img = obj;
          this.state.img_ready = true;
          this.state.first_imgs = JSON.parse(JSON.stringify(this.state.img_preview));
          view.$message({ message: "Image Ready", type: "success" });
          view.$router.push({ path: "/index/vis" });
          return;
        }
        let nice = false;
        if (this.state.theme == 'burger') {
          nice = (pos == 0);
        } else if (this.state.theme == 'Burger') {
          nice = (pos == 1);
        } else if (this.state.theme == 'pokemon') {
          nice = (pos == 1);
        }
        let up_data = {
          content: this.state.theme,
          dataProps: this.state.props,
          similarity: this.state.similarity,
          dataTypes: this.state.data_type,
          groups : this.state.group_props,
          svgsList: this.state.all_svgs.slice(pos, pos + 1),
          mapped: [],
          first: pos,
          cachedMatrix: true,
          nice: nice
        };
        view.$axios({
          method: "post",
          url: "/mapping/mul/",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          data: up_data,
        }).then((res) => {
          console.log("~~~~~~~~~~~~~~~~~~~");
          console.log(res.data);
          const cur_len = res.data.scores.length;
          for (let i = 0; i < cur_len; i++) {
            if (pos + i >= num) break;
            this.state.img_preview[pos + i].index = pos + i;
            this.state.img_preview[pos + i].mapper = res.data.mappers[i];
            this.state.img_preview[pos + i].score = res.data.scores[i];
            this.state.img_preview[pos + i].encoded = {};
          }
          if (res.data.score > best_score) {
            best_score = res.data.score;
            best_img = pos + res.data.best_img;
            best_map = res.data.mapper;
          }
          mapPartData(
            pos + cur_len,
            this.state.all_svgs.length,
            best_img,
            best_score,
            best_map
          );
        });
      };
      const getPathSize = (d) => {
        view.$refs.svgSize.innerHTML = `<svg><path d="${d}"></path></svg>`;
        const svg_size = view.$refs.svgSize.childNodes[0].getBoundingClientRect();
        let d_size = view.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
        view.$refs.svgSize.innerHTML = "";
        d_size["midX"] = (d_size.left + d_size.right) / 2 - svg_size.left;
        d_size["midY"] = (d_size.top + d_size.bottom) / 2 - svg_size.top;
        return d_size;
      };
      const formatSvg = (src) => {
        const xml_obj = view.$x2js.xml2js(src);
        console.log(xml_obj);
        let svg_obj = {paths: [], has_color: false};
        filterContent(xml_obj.svg, 'svg', svg_obj);
        let retval = { svgs: [], ds: [] };
        retval.width = svg_obj.width;
        retval.height = svg_obj.height;
        let ori_paths = svg_obj.paths;
        let filter_paths = ori_paths;
        const radial = judgeRadial(filter_paths, retval.width, retval.height);
        if (this.state.theme != "pokemon") {
          filter_paths = filterSepSvgs(ori_paths, retval.width, retval.height, true);
          if (!radial) {
            filter_paths = filterSepSvgs(ori_paths, retval.width, retval.height, false);
          }
        }
        retval.fill = [''].concat(filter_paths.map(d => d.fill));
        retval.ds = [''].concat(filter_paths.map(d => d.d));
        let ori_svg = `<svg width="${retval.width}" height="${retval.height}">`;
        filter_paths.forEach(it => {
          ori_svg += `<path d="${it.d}"></path>`;
        });
        ori_svg += '</svg>';
        retval.svgs = [ori_svg];
        retval.has_color = svg_obj.has_color;
        filter_paths.forEach(it => {
          retval.svgs.push(`<svg width="${retval.width}" height="${retval.height}"><path d="${it.d}"></path></svg>`) ;
        });
        return retval;
      };
      const uploadSegmentation = (obj) => {
        let dis = {
          eles: [],
          style: {},
          ori_size: {},
          d_list: [],
          img_type: [],
          path_size: [],
          vis: false,
        };
        dis.ori_size = {
          width: obj.width,
          height: obj.height,
        };
        dis.width = 100;
        const scale = dis.width / obj.width;
        dis.height = scale * obj.height;
        dis.style = {
          width: dis.width + "px",
          height: dis.height + "px",
        };
        this.state.svg_list = obj.svgs;
        dis.d_list = obj.ds;
        dis.fill = obj.fill;
        let svg_header = `<svg width="${dis.width}" height="${dis.height}" viewBox="0 0 ${obj.width} ${obj.height}" xmlns="http://www.w3.org/2000/svg">`;
        let ori_svg = svg_header;
        let eles = [];
        dis.path_size = [{"width": obj.width, "height": obj.height}];
        dis.img_type = ['none'];
        for (let i = 1; i <obj.ds.length; i++) {
          let cur_path = `<path d="${obj.ds[i]}" fill="${obj.fill[i]}"></path>`
          eles.push(svg_header + cur_path + '</svg>');
          ori_svg += cur_path;
          const cur_size = getPathSize(obj.ds[i]);
          dis.path_size.push(cur_size);
          dis.img_type.push(judgeImgType(obj.ds[i], cur_size));
        }
        ori_svg += '</svg>';
        dis.eles = [ori_svg].concat(eles);
        this.state.img_preview.push(dis);
      };
      const filterSepSvgs = (path_list, img_width, img_height, consider_radial) => {
        let i = path_list.length - 1;
        while (i >= 0) {
          const cur_size = getPathSize(path_list[i].d);
          let mid_x = (cur_size.left + cur_size.right) / 2;
          let mid_y = (cur_size.top + cur_size.bottom) / 2;
          if (
            cur_size.width / img_width <= 0.02 ||
            cur_size.height / img_height <= 0.02 ||
            (cur_size.width / img_width < 0.05 &&
              cur_size.height / img_height < 0.05)
          ) {
            path_list.splice(i, 1);
            i--; 
            continue;
          }
          for (let j = i - 1; j >= 0; j--) {
            let it = path_list[i].d;
            let out = path_list[j].d;
            const out_size = getPathSize(out);
            const tog_size = getPathSize(out + it);
            if (
              Math.abs(out_size.height - tog_size.height) <= 1e-6 &&
              Math.abs(out_size.width - tog_size.width) <= 1e-6
            ) {
              let out_mid_x = (out_size.left + out_size.right) / 2;
              let out_mid_y = (out_size.top + out_size.bottom) / 2;
              if (
                !consider_radial ||
                Math.abs(out_mid_x - mid_x) / img_width >= 0.04 ||
                Math.abs(out_mid_y - mid_y) / img_height >= 0.04
              ) {
                path_list.splice(i, 1); 
                break;
              }
            }
          }
          i--;
        }
        return path_list;
      };
      const judgeRadial = (path_list, img_w, img_h) => {
        if (this.state.theme == 'pokemon') {
          return true;
        }
        let centers = [];
        let max_center = 1;
        for (let i = 0; i < path_list.length; i++) {
          const i_size = getPathSize(path_list[i].d);
          const mid_x = (i_size.left + i_size.right) / 2;
          const mid_y = (i_size.top + i_size.bottom) / 2;
          let overlap = false;
          for (let j = 0; j < centers.length; j++) {
            if (
              Math.abs(mid_x - centers[j].x) / img_w <= 0.04 &&
              Math.abs(mid_y - centers[j].y) / img_h <= 0.04
            ) {
              centers[j].cnt++;
              if (centers[j].cnt > max_center) {
                max_center = centers[j].cnt;
              }
              overlap = true;
              break;
            }
          }
          if (!overlap) {
            centers.push({ x: mid_x, y: mid_y, cnt: 1 });
          }
        }
        return max_center / centers.length > 0.6;
      };
      const judgeImgType = (d, size) => {
        if (size.width / size.height >= 3.5) {
          return "linear_horizon";
        } else if (size.height / size.width >= 3.5) {
          return "linear_vertical";
        } else if (size.height / size.width <= 3 && size.width / size.height <= 3) {
          return "square";
        } else {
          return "rect";
        }
      };
      const initImgs = () => {
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
      }
      initImgs();
      searchSvg();
    },

    generate(state, view) {
      this.dispatch("dataProcess");
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
        // view.$router.push({path: '/index/image'});
        view.$message({ message: "Image Processing", type: "success" });
        this.dispatch('imageProcess', view);
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
