<template>
  <div style="text-align: center" class="block-area">
    <h2>Image Upload</h2>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <div id="svgMeasure" ref="svgSize"></div>
    <div v-show="!imgReady">
      <el-input
        style="width: auto"
        placeholder="Search content"
        v-model="img_content"
        clearable
      >
      </el-input>
      <el-button @click="searchImg" style="margin-left: 20px">Search</el-button>
      <el-button type="primary" @click="simpleImg" style="margin-left: 20px">Simple</el-button>
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
    <ul v-show="imgReady">
      <li
        v-for="it in previewElements"
        :key="it"
        v-html="it"
        :style="previewStyle"
      ></li>
    </ul>
  </div>
</template>

<script>
export default {
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
      sep_objs: [],
      dis: {},
      search_num: 0,
      deal_num: 0,
      img_content: "",
      // up_data: {},
    };
  },
  computed: {
    imgReady() {
      return this.$store.state.img_ready;
    },
    previewElements() {
      return this.$store.state.img_preview.eles;
    },
    previewStyle() {
      return this.$store.state.img_preview.style;
    },
    propLength() {
      return this.$store.state.props.length;
    },
  },
  watch: {
    deal_num(val) {
      console.log(`${val} ${this.search_num}`);
      // if (val > 0 && val >= this.search_num) {
      if (val > 0 && val == Math.max(1, parseInt(this.search_num * 0.1)) ) {
        // if (val == 1) {
        this.getDataMap();
      }
    },
  },
  methods: {
    testData() {
      console.log(this.$refs.svgSize.clientHeight);
    },
    searchImg() {
      this.$axios({
        method: "get",
        url: "/search/",
        params: {
          keyWords: this.img_content,
          imgNum: 400,
        },
      }).then((res) => {
        this.$store.state.img_content = this.img_content;
        console.log(res.data);
        let img_urls = [];
        res.data.forEach((it) => {
          img_urls.push(it);
        });
        this.search_num = img_urls.length;
        console.log(img_urls);
        this.loadImgs(img_urls);
        // this.viewImg(img_urls[4]);
      });
      // let img_urls = [
      //   'https://img1.baidu.com/it/u=3988299520,1364854370&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=468',
      //   'https://cdn3.iconfinder.com/data/icons/food-and-drink-55/50/burger-13-2-512.png',
      //   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQX9DMqAGXnvFSDHs_Qd-d2Xl2qcwrHo8gbA&usqp=CAU',
      //   'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4kVYP6xekBhOtr4e_xzvHT9vUxz6U7oRCw&usqp=CAU',
      // ];
      // this.viewImg('https://img0.baidu.com/it/u=92751486,4059642266&fm=253&fmt=auto&app=138&f=PNG?w=500&h=490');
      // this.viewImg('https://img1.baidu.com/it/u=3988299520,1364854370&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=468');
    },
    simpleImg() {
      let img_urls = ['https://img1.baidu.com/it/u=3988299520,1364854370&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=468'];
      this.loadImgs(img_urls);
    },
    readImgFile(file) {
      let cur_src = URL.createObjectURL(file);
      this.viewImg(cur_src);
      this.$store.state.img_content = file.name.split(".")[0];
      return false;
    },
    loadImgs(img_urls) {
      img_urls.forEach((it) => {
        const _this = this;
        const potrace = require("potrace");
        // let trace = new potrace.Potrace();
        // trace.loadImage(it, (err) => {
        try {
          potrace.trace(it, function (err, svg) {
            if (err) {
              // _this.deal_num++;
              console.log(`A== ${_this.deal_num}`);
              throw err;
            }
            // let res_svg = trace.getSVG();
            // let obj = _this.segmentSvg(res_svg.toString());
            let obj = _this.segmentSvg(svg.toString());
            console.log(obj);
            if (
              obj.svgs.length >= _this.propLength &&
              obj.svgs.length <= 2 * _this.propLength
            ) {
              _this.sep_objs.push(obj);
              // _this.up_data.svgsList.push(obj.svgs);
              _this.all_svgs.push(obj.svgs);
              _this.deal_num++;
              console.log(`B== ${_this.deal_num}`);
            }
            // _this.deal_num++;
            // console.log(`B== ${_this.deal_num}`);
          });
        } catch (err) {
          console.log("A=err");
        }
      });
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
      console.log(`map part ${pos} ${num} ${best_img}`)
      if (pos >= num) {
        this.uploadSegmentation(this.sep_objs[best_img]);
        this.$store.state.mapper = best_map;
        return;
      }
      let up_data = {
        // content: this.$store.state.img_content,
        content: "burger",
        dataProps: this.$store.state.props,
        // dataProps: ['Item', 'cheese', 'bacon', 'Calories'],
        svgsList: this.all_svgs.slice(pos, pos + 4),
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
        if (res.data.score > best_score) {
          best_score = res.data.score;
          best_img = pos + res.data.best_img;
          best_map = res.data.mapper;
        }
        this.mapPartData(pos + 4, this.all_svgs.length, best_img, best_score, best_map);
      });
    },
    getDataMap() {
      console.log("===================");
      this.mapPartData(0, this.all_svgs.length, -1, -1, [])
    },
    segmentSvg(src) {
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
      const filter_ds = this.filterSepSvgs(ori_ds, retval.width, retval.height);
      retval.svgs.push(head + filter_ds.join(" ") + tail);
      retval.ds.push(filter_ds.join(" "));
      filter_ds.forEach((it) => {
        retval.ds.push(it);
        retval.svgs.push(head + it + tail);
      });
      return retval;
    },
    uploadSegmentation(obj) {
      this.svg_style.width = obj.width + "px";
      this.svg_style.height = obj.height + "px";
      this.$store.state.svg_width = obj.width;
      this.$store.state.svg_height = obj.height;
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
      this.svg_list = obj.svgs;
      this.$store.state.svg_list = obj.svgs;
      this.$store.state.d_list = obj.ds;
      obj.ds.forEach((it) => {
        dis.eles.push(
          `<svg width="${obj.width}" height="${obj.height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="${it}"></path></svg>`
        );
        this.$refs.svgSize.innerHTML = `<svg><path d="${it}"></path></svg>`;
        const cur_size =
          this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
        this.$refs.svgSize.innerHTML = "";
        this.$store.state.paths_size.push({
          width: cur_size.width,
          height: cur_size.height,
        });
        this.$store.state.img_type.push(this.judgeImgType(it, cur_size));
      });
      // this.dis = dis;
      this.$store.state.img_preview = dis;
      this.$store.state.img_ready = true;
    },
    filterSepSvgs(d_list, img_width, img_height) {
      let fil_ds = [];
      d_list.forEach((it) => {
        this.$refs.svgSize.innerHTML = `<svg><path d="${it}"></path></svg>`;
        const cur_size =
          this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
        this.$refs.svgSize.innerHTML = "";
        if (
          cur_size.width / img_width < 0.05 &&
          cur_size.height / img_height < 0.05
        ) {
          return;
        }
        let judge = true;
        d_list.forEach((out) => {
          if (!judge || it == out) return;
          this.$refs.svgSize.innerHTML = `<svg><path d="${out}"></path></svg>`;
          const out_size =
            this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          this.$refs.svgSize.innerHTML = `<svg><path d="${
            out + it
          }"></path></svg>`;
          const tog_size =
            this.$refs.svgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          this.$refs.svgSize.innerHTML = "";
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
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
  display: inline-block;
}
</style>