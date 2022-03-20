<template>
  <div class="block-area">
    <p class="title">Metaphoric Image Gallery</p>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <div id="svgMeasure" ref="svgSize"></div>
    <div v-if="false" style="margin-left: 20px">
      <el-upload
        class="upload-demo"
        drag
        :limit="1"
        action=""
        accept=".jpg, .png"
        :before-upload="readImgFile"
        style="margin-top: 20px"
      >
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">Click or drag the file here to upload</div>
      </el-upload>
      <el-button @click="searchSvg">search svg</el-button>
    </div>
    <div style="height: 520px; padding-left: 3%">
      <el-scrollbar class="vertical-scroll">
        <div v-for="(obj, index) in previewElements" :key="index">
          <div style="display: inline-flex">
            <p>Image {{ index }}</p>
            <el-button
              size="mini"
              style="height: 50%; margin-top: 12px; margin-left: 16px"
              @click="setObjVis($event, index)"
              >Vis</el-button
            >
          </div>
          <ul>
            <li
              v-for="it in obj.eles"
              :key="it"
              v-html="it"
              style="width: 100px; height: 100px; box-sizing: content-box"
            ></li>
          </ul>
          <graph
            v-if="obj.vis"
            :best="false"
            :obj="obj"
            style="width: 800px"
          ></graph>
          <p>{{ obj.info }}</p>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import Graph from "./vis/Graph.vue";
import * as path_convert from '../assets/js/convert-to-path.js';
// import * as path_area from '../assets/js/path-area.js';
export default {
  components: { Graph },
  name: "UpImage",
  props: {},
  data() {
    return {
      upload_display: true,
      svg_display: false,
      svg_list: [],
      svg_style: {
        width: "0",
        height: "0",
      },
      all_svgs: [],
      dis: {},
      search_num: 0,
      deal_num: 0,
      img_content: "",
      last_time: 0,
      deal_time: [],
    };
  },
  computed: {
    dataReady() {
      return this.$store.state.data_ready;
    },
    imgReady() {
      return this.$store.state.img_ready;
    },
    previewElements() {
      return this.$store.state.img_preview;
    },
    propLength() {
      return this.$store.state.props.length;
    },
  },
  watch: {
    deal_num(val) {
      // console.log(`${val} ${this.search_num}`);
      if (val > 0) {
        const cur_time = new Date().getTime();
        this.deal_time.push((cur_time - this.last_time) / 1000);
        this.last_time = cur_time;
      }
      if (val > 0 && val == Math.max(1, parseInt(this.search_num * 0.1))) {
        this.getDataMap();
      }
    },
  },
  created() {
    if (!this.$store.state.data_ready) {
      return;
    }
    //console.log("now image created");
    //console.log(this.$store);
    if (this.$store.state.img_ready == false) {
      this.$store.state.img_preview = [];
      // this.searchImg();
      // this.simpleImg();
      this.searchSvg();
    }
  },
  methods: {
    testData() {
      //console.log(this.$refs.svgSize.clientHeight);
    },
    setObjVis(e, index) {
      const curv = this.$store.state.img_preview[index].vis;
      this.$store.state.img_preview[index].vis = !curv;
    },
    searchImg() {
      this.$axios({
        method: "get",
        url: "/search/",
        params: {
          keyWords: this.$store.state.theme,
          imgNum: 100,
        },
      }).then((res) => {
        // this.$store.state.theme = this.img_content;
        //console.log(res.data);
        let img_urls = [];
        res.data.forEach((it) => {
          img_urls.push(it);
        });
        this.search_num = img_urls.length;
        //console.log(img_urls);
        this.loadImgs(img_urls);
      });
    },
    searchSvg() {
      this.$axios({
        method: "get",
        url: "/search/svg/",
        params: {
          keyWords: this.$store.state.theme,
          imgNum: 8,
        },
      }).then((res) => {
        // this.$store.state.theme = this.img_content;
        res.data.svgs.forEach(it => {
          let obj = this.formatSvg(it);
          // console.log('yyyyyyyyyyyyyyyyyyyyy');
          // console.log(obj);
          //console.log(obj.has_color);
          if (obj.has_color && obj.svgs.length >= 4 && obj.svgs.length <= 9) {
            this.uploadSegmentation(obj);
            this.$store.state.all_svgs.push(obj.svgs);
          }
        });
        //console.log(this.previewElements);
        // console.log("tttttttttt");
        this.getDataMap();
      });
    },
    filterContent(obj, tag, svg_obj) {
      // console.log(obj);
      // console.log(tag);
      const invalid_tags = ['title'];
      if (invalid_tags.includes(tag)) {
        return;
      }
      if (Object.prototype.toString.call(obj) === "[object Array]") {
        for (let i = 0; i < obj.length; i++) {
          this.filterContent(obj[i], tag, svg_obj);
        }
        return;
      }
      const keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        if (keys[i][0] != '_') {
          this.filterContent(obj[keys[i]], keys[i], svg_obj);
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
      if (!this.checkDAvailable(path_obj.d)) {
        return;
      }
      if (keys.includes('_style')) {
        // console.log(tag);
        // console.log(obj._style);
        const items = obj._style.split(';');
        items.forEach(it => {
          const v = it.split(':');
          // console.log(v);
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
    },
    checkDAvailable(d) {
      const invalidChars = ['A', 'a', 'U', 'u']
      for (let i = 0; i < d.length; i++) {
        if (invalidChars.includes(d.charAt(i))) {
          return false;
        }
      }
      return true;
    },
    simpleImg() {
      let img_urls = [
        "https://img0.baidu.com/it/u=92751486,4059642266&fm=253&fmt=auto&app=138&f=PNG?w=500&h=490",
        "https://img1.baidu.com/it/u=3988299520,1364854370&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=468",
      ];
      this.loadImgs(img_urls);
    },
    readImgFile(file) {
      let cur_src = URL.createObjectURL(file);
      this.viewImg(cur_src);
      this.$store.state.theme = file.name.split(".")[0];
      return false;
    },
    loadImgs(img_urls) {
      this.last_time = new Date().getTime();
      img_urls.forEach((it) => {
        const _this = this;
        const potrace = require("potrace");
        // let trace = new potrace.Potrace();
        // trace.loadImage(it, (err) => {
        try {
          potrace.trace(it, function (err, svg) {
            if (err) {
              console.log(`ptrace error`);
              throw err;
            }
            // let res_svg = trace.getSVG();
            // let obj = _this.segmentSvg(res_svg.toString());
            let obj = _this.segmentSvg(svg.toString());
            //console.log(obj);
            if (obj.svgs.length >= 4 && obj.svgs.length <= 9) {
              _this.uploadSegmentation(obj);
              _this.$store.state.all_svgs.push(obj.svgs);
              // _this.getImgPixelColor(it, _this.deal_num);
              _this.deal_num++;
              //console.log(`B == ${_this.deal_num}`);
            }
          });
        } catch (err) {
          console.log("potrace err");
        }
      });
    },
    getImgPixelColor(url, index) {
      const d_size = this.$store.state.img_preview[index].path_size;
      this.$store.state.img_preview[index].colors = [];
      const Jimp = require("jimp");
      Jimp.read(url, (err, image) => {
        if (err) {
          console.log(err);
          for (let i = 0; i < d_size.length; i++) {
            this.$store.state.img_preview[index].colors.push("#00000000");
          }
          return;
        }
        // console.log(image);
        for (let i = 0; i < d_size.length; i++) {
          const cur_x = Math.max(0, parseInt((d_size[i].right - d_size[i].left) / 2));
          const cur_y = Math.max(0, parseInt((d_size[i].bottom - d_size[i].top) / 2));
          let color = image.getPixelColor(cur_x, cur_y).toString(16);
          color = ('00000000' + color).slice(-8);
          // console.log(color);
          this.$store.state.img_preview[index].colors.push("#" + color);
        }
      });
    },
    updateDisElements(idx) {
      //console.log('~~~~~~~~~~~-----------~~~~~~~~~~~~~');
      //console.log(this.$store.state.img_preview[idx]);
      const obj = this.$store.state.img_preview[idx];
      for (let i = 1; i < obj.eles.length; i++) {
        this.$store.state.img_preview[idx].eles[i] = 
        `<svg width="${obj.width}" height="${obj.height}" viewBox="0 0 ${obj.ori_size.width} ${obj.ori_size.height}"><path d="${obj.d_list[i]}" fill="${obj.colors[i]}"></path></svg>`
      }
    },
    viewImg(src) {
      const _this = this;
      const potrace = require("potrace");
      let trace = new potrace.Potrace();
      trace.loadImage(src, (err) => {
        if (err) throw err;
        let res_svg = trace.getSVG();
        // _this.separateSvgComponents(res_svg.toString());
        _this.uploadSegmentation(_this.segmentSvg(res_svg.toString()));
      });
    },
    mapPartData(pos, num, best_img, best_score, best_map) {
      console.log(`map part ${pos} ${num} ${best_img}`);
      if (pos >= num) {
        this.$store.state.mapper = best_map;
        this.$store.state.selected_index = best_img;
        const obj = this.$store.state.img_preview[best_img];
        this.$store.state.selected_img = obj;
        this.$store.state.img_ready = true;
        this.$store.state.first_imgs = JSON.parse(JSON.stringify(this.$store.state.img_preview));
        this.$message({ message: "Image Ready", type: "success" });
        this.$router.push({ path: "/index/vis" });
        // this.$store.state.best_img = {
        //   path_size: obj.path_size,
        //   img_type: obj.img_type,
        //   d_list: obj.d_list,
        //   ori_size: obj.ori_size
        // };
        return;
      }
      let up_data = {
        content: this.$store.state.theme,
        dataProps: this.$store.state.props,
        similarity: this.$store.state.similarity,
        dataTypes: this.$store.state.data_type,
        groups : this.$store.state.group_props,
        svgsList: this.$store.state.all_svgs.slice(pos, pos + 3),
        mapped: []
      };
      this.$axios({
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
          this.$store.state.img_preview[pos + i].index = pos + i;
          this.$store.state.img_preview[pos + i].mapper = res.data.mappers[i];
          this.$store.state.img_preview[pos + i].score = res.data.scores[i];
          this.$store.state.img_preview[pos + i].times = res.data.times[i].concat([this.deal_time[pos + i]]);
          this.$store.state.img_preview[pos + i].info =
            this.$store.state.img_preview[pos + i].times.join("--");
          // display image' color
          // this.updateDisElements(pos + i);
        }
        if (res.data.score > best_score) {
          best_score = res.data.score;
          best_img = pos + res.data.best_img;
          best_map = res.data.mapper;
        }
        this.mapPartData(
          pos + cur_len,
          this.$store.state.all_svgs.length,
          best_img,
          best_score,
          best_map
        );
      });
    },
    getDataMap() {
      console.log("===================");
      this.mapPartData(0, this.$store.state.all_svgs.length, -1, -1, []);
    },
    getPathSize(d) {
      // console.log(d);
      this.$refs.svgSize.innerHTML = `<svg><path d="${d}"></path></svg>`;
      const svg_size = this.$refs.svgSize.childNodes[0].getBoundingClientRect();
      let d_size = this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
      this.$refs.svgSize.innerHTML = "";
      d_size["midX"] = (d_size.left + d_size.right) / 2 - svg_size.left;
      d_size["midY"] = (d_size.top + d_size.bottom) / 2 - svg_size.top;
      return d_size;
    },
    segmentSvg(src) {
      let retval = { svgs: [], ds: [], fill: [] };
      //console.log(src);
      let mid_st_str = `<path d="`;
      let mid_start = src.indexOf(mid_st_str) + mid_st_str.length;
      let head = src.substring(0, mid_start);
      retval.width = +head.split(`width="`)[1].split(`"`)[0];
      retval.height = +head.split(`height="`)[1].split(`"`)[0];
      src = src.substr(mid_start + 1);
      let mid_end = src.indexOf(`"`);
      let mid = src.substr(0, mid_end);
      let tail = src.substr(mid_end);
      let ori_paths = [];
      mid.split("M").forEach((it) => {
        ori_paths.push({"d": "M" + it});
      });
      let filter_paths = this.filterSepSvgs(ori_paths, retval.width, retval.height, true);
      const radial = this.judgeRadial(filter_paths, retval.width, retval.height);
      if (!radial) {
        filter_paths = this.filterSepSvgs(ori_paths, retval.width, retval.height, false);
      }
      //console.log(radial ? "radial" : "non-radial");
      // console.log(filter_ds.length);
      const filter_ds = filter_paths.map(d => d.d);
      retval.svgs.push(head + filter_ds.join(" ") + tail);
      retval.ds.push(filter_ds.join(" "));
      filter_ds.forEach((it) => {
        retval.ds.push(it);
        retval.svgs.push(head + it + tail);
        retval.fill.push('#000000');
      });
      return retval;
    },
    formatSvg(src) {
      const xml_obj = this.$x2js.xml2js(src);
      console.log(xml_obj);
      let svg_obj = {paths: [], has_color: false};
      this.filterContent(xml_obj.svg, 'svg', svg_obj);
      // console.log(svg_obj);
      let retval = { svgs: [], ds: [] };
      retval.width = svg_obj.width;
      retval.height = svg_obj.height;
      let ori_paths = svg_obj.paths;
      let filter_paths = this.filterSepSvgs(ori_paths, retval.width, retval.height, true);
      const radial = this.judgeRadial(filter_paths, retval.width, retval.height);
      if (!radial) {
        filter_paths = this.filterSepSvgs(ori_paths, retval.width, retval.height, false);
      }
      // console.log(radial ? "radial" : "non-radial");
      retval.fill = [''].concat(filter_paths.map(d => d.fill));
      retval.ds = [''].concat(filter_paths.map(d => d.d));
      let ori_svg = `<svg width="${retval.width}" height="${retval.height}">`;
      filter_paths.forEach(it => {
        // ori_svg += `<path d="${it.d}" fill="${it.fill}"></path>`;
        ori_svg += `<path d="${it.d}"></path>`;
      });
      ori_svg += '</svg>';
      retval.svgs = [ori_svg];
      retval.has_color = svg_obj.has_color;
      filter_paths.forEach(it => {
        retval.svgs.push(`<svg width="${retval.width}" height="${retval.height}"><path d="${it.d}"></path></svg>`) ;
      });
      return retval;
    },
    uploadSegmentation(obj) {
      let dis = {
        eles: [],
        style: {},
        ori_size: {},
        d_list: [],
        img_type: [],
        path_size: [],
        info: "",
        vis: false,
      };
      // this.$store.state.svg_width = obj.width;
      // this.$store.state.svg_height = obj.height;
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
      //const tranx = obj.width * 0.5 * (scale - 1);
      //const trany = obj.height * 0.5 * (scale - 1);
      this.svg_list = obj.svgs;
      this.$store.state.svg_list = obj.svgs;
      dis.d_list = obj.ds;
      dis.fill = obj.fill;
      let svg_header = `<svg width="${dis.width}" height="${dis.height}" viewBox="0 0 ${obj.width} ${obj.height}">`;
      let ori_svg = svg_header;
      let eles = [];
      dis.path_size = [{"width": obj.width, "height": obj.height}];
      dis.img_type = ['none'];
      for (let i = 1; i <obj.ds.length; i++) {
        let cur_path = `<path d="${obj.ds[i]}" fill="${obj.fill[i]}"></path>`
        eles.push(svg_header + cur_path + '</svg>');
        ori_svg += cur_path;
        const cur_size = this.getPathSize(obj.ds[i]);
        dis.path_size.push(cur_size);
        dis.img_type.push(this.judgeImgType(obj.ds[i], cur_size));
      }
      ori_svg += '</svg>';
      dis.eles = [ori_svg].concat(eles);
      // console.log(dis);
      this.$store.state.img_preview.push(dis);
    },
    filterSepSvgs(path_list, img_width, img_height, consider_radial) {
      // console.log(`${img_width} ${img_height}`);
      let i = path_list.length - 1;
      //let back = d_list.length - 1;
      while (i >= 0) {
        const cur_size = this.getPathSize(path_list[i].d);
        /*
        let cur_area = path_area.getPathArea(path_list[i].d, 100);
        console.log(cur_area);
        if (isNaN(cur_area) || (cur_area / img_width / img_height <= 0.005)) {
          path_list.splice(i, 1);
          i--; //back--;
          continue;
        }
        */
        let mid_x = (cur_size.left + cur_size.right) / 2;
        let mid_y = (cur_size.top + cur_size.bottom) / 2;
        if (
          cur_size.width / img_width <= 0.02 ||
          cur_size.height / img_height <= 0.02 ||
          (cur_size.width / img_width < 0.05 &&
            cur_size.height / img_height < 0.05)
        ) {
          path_list.splice(i, 1);
          i--; //back--;
          continue;
        }
        for (let j = i - 1; j >= 0; j--) {
          // if (i == j) continue;
          let it = path_list[i].d;
          let out = path_list[j].d;
          const out_size = this.getPathSize(out);
          const tog_size = this.getPathSize(out + it);
          // console.log(`${out_size.height - tog_size.height} ${out_size.width - tog_size.width}`)
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
              path_list.splice(i, 1); //back--;
              break;
            }
          }
        }
        i--;
      }
      return path_list;
    },
    judgeRadial(path_list, img_w, img_h) {
      let centers = [];
      let max_center = 1;
      for (let i = 0; i < path_list.length; i++) {
        const i_size = this.getPathSize(path_list[i].d);
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
    },
    judgeImgType(d, size) {
      if (size.width / size.height >= 3.5) {
        return "linear_horizon";
      } else if (size.height / size.width >= 3.5) {
        return "linear_vertical";
      } else if (size.height / size.width <= 1.5 && size.width / size.height <= 1.5) {
        return "square";
      } else {
        return "rect";
      }
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">
ul {
  list-style: none;
  padding: 0;
}

ul > li {
  overflow: hidden;
  // background-color: #f4f5dc;
  background-color: #fff;
  border: 2px solid #e4ae40;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
  display: inline-block;
}
</style>
