<template>
  <div class="block-area">
    <p class="title">Metaphoric Image Gallery</p>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <div id="svgMeasure" ref="svgSize"></div>
    <div v-if="!dataReady" style="margin-left: 20px">
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
    </div>
    <div style="max-height: 450px; overflow-y: scroll; padding-left: 3%">
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
            :style="obj.style"
          ></li>
        </ul>
        <graph
          v-if="obj.vis"
          :best="false"
          :obj="obj"
          style="width: 400px"
        ></graph>
        <p>{{ obj.info }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import Graph from "./vis/Graph.vue";
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
      console.log(`${val} ${this.search_num}`);
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
    console.log("now image created");
    console.log(this.$store);
    if (this.$store.state.img_ready == false) {
      this.$store.state.img_preview = [];
      this.searchImg();
      // this.simpleImg();
    }
  },
  methods: {
    testData() {
      console.log(this.$refs.svgSize.clientHeight);
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
        this.$store.state.theme = this.img_content;
        console.log(res.data);
        let img_urls = [];
        res.data.forEach((it) => {
          img_urls.push(it);
        });
        this.search_num = img_urls.length;
        console.log(img_urls);
        this.loadImgs(img_urls);
      });
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
            console.log(obj);
            if (obj.svgs.length >= 4 && obj.svgs.length <= 9) {
              _this.uploadSegmentation(obj);
              _this.all_svgs.push(obj.svgs);
              _this.getImgPixelColor(it, _this.deal_num);
              _this.deal_num++;
              console.log(`B == ${_this.deal_num}`);
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
      console.log('~~~~~~~~~~~-----------~~~~~~~~~~~~~');
      console.log(this.$store.state.img_preview[idx]);
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
        const obj = this.$store.state.img_preview[best_img];
        this.$store.state.selected_img = obj;
        this.$store.state.img_ready = true;
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
        // content: this.$store.state.theme,
        content: "burger",
        dataProps: this.$store.state.props,
        // dataProps: ['Item', 'cheese', 'bacon', 'Calories'],
        svgsList: this.all_svgs.slice(pos, pos + 2),
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
          this.all_svgs.length,
          best_img,
          best_score,
          best_map
        );
      });
    },
    getDataMap() {
      console.log("===================");
      this.mapPartData(0, this.all_svgs.length, -1, -1, []);
    },
    getPathSize(d) {
      this.$refs.svgSize.innerHTML = `<svg><path d="${d}"></path></svg>`;
      const d_size =
        this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
      this.$refs.svgSize.innerHTML = "";
      return d_size;
    },
    segmentSvg(src) {
      let retval = { svgs: [], ds: [] };
      console.log(src);
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
      // const filter_ds = ori_ds;
      let filter_ds = this.filterSepSvgs(ori_ds, retval.width, retval.height, true);
      const radial = this.judgeRadial(filter_ds, retval.width, retval.height);
      if (!radial) {
        filter_ds = this.filterSepSvgs(ori_ds, retval.width, retval.height, false);
      }
      let cent_x = [],
        cent_y = [];
      for (let i = 0; i < filter_ds.length; i++) {
        const d_size = this.getPathSize(filter_ds[i]);
        cent_x.push((d_size.right - d_size.left) / 2);
        cent_y.push((d_size.bottom - d_size.top) / 2);
      }
      console.log(radial ? "radial" : "non-radial");
      // console.log(filter_ds.length);
      retval.svgs.push(head + filter_ds.join(" ") + tail);
      retval.ds.push(filter_ds.join(" "));
      filter_ds.forEach((it) => {
        retval.ds.push(it);
        retval.svgs.push(head + it + tail);
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
      // this.$store.state.d_list = obj.ds;
      dis.d_list = obj.ds;
      obj.ds.forEach((it) => {
        // dis.eles.push(`<svg width="${obj.width}" height="${obj.height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="${it}"></path></svg>`);
        dis.eles.push(
          `<svg width="${dis.width}" height="${dis.height}" viewBox="0 0 ${obj.width} ${obj.height}"><path d="${it}"></path></svg>`
        );
        const cur_size = this.getPathSize(it);
        dis.path_size.push(cur_size);
        dis.img_type.push(this.judgeImgType(it, cur_size));
        // this.$store.state.img_type.push(this.judgeImgType(it, cur_size));
      });
      // this.dis = dis;
      this.$store.state.img_preview.push(dis);
    },
    filterSepSvgs(d_list, img_width, img_height, consider_radial) {
      // console.log(`${img_width} ${img_height}`);
      let i = d_list.length - 1;
      //let back = d_list.length - 1;
      while (i >= 0) {
        // console.log(d_list);
        const cur_size = this.getPathSize(d_list[i]);
        let mid_x = (cur_size.left + cur_size.right) / 2;
        let mid_y = (cur_size.top + cur_size.bottom) / 2;
        if (
          cur_size.width / img_width <= 0.02 ||
          cur_size.height / img_height <= 0.02 ||
          (cur_size.width / img_width < 0.05 &&
            cur_size.height / img_height < 0.05)
        ) {
          d_list.splice(i, 1);
          i--; //back--;
          continue;
        }
        for (let j = i - 1; j >= 0; j--) {
          // if (i == j) continue;
          let it = d_list[i];
          let out = d_list[j];
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
              d_list[j] += d_list[i];
              d_list.splice(i, 1); //back--;
              break;
            }
          }
        }
        i--;
      }
      return d_list;
    },
    judgeRadial(d_list, img_w, img_h) {
      let centers = [];
      let max_center = 1;
      for (let i = 0; i < d_list.length; i++) {
        const i_size = this.getPathSize(d_list[i]);
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
      } else {
        return "square";
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
  background-color: #f4f5dc;
  border: 2px solid #e4ae40;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
  display: inline-block;
}
</style>