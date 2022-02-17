<template>
  <div style="text-align: center">
    <h2>Image Upload</h2>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <el-upload
      class="upload-demo"
      drag
      :limit="1"
      action=""
      accept=".jpg, .png"
      :before-upload="readImgFile"
      v-show="upload_display"
    >
      <i class="el-icon-upload"></i>
      <div class="el-upload__text">Click or drag the file here to upload</div>
    </el-upload>
    <ul v-show="svg_display">
      <li v-for="it in dis.coms" :key="it" v-html="it" :style="dis.style"></li>
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
      dis: {}
    };
  },
  methods: {
    testData() {
      console.log("test");
    },
    readImgFile(file) {
      const _this = this;
      const potrace = require("potrace");
      let trace = new potrace.Potrace();
      let cur_src = URL.createObjectURL(file);
      trace.loadImage(cur_src, (err) => {
        if (err) throw err;
        let res_svg = trace.getSVG();
        _this.separateSvgComponents(res_svg.toString());
        _this.upload_display = false;
        _this.svg_display = true;
      });
      this.$store.state.img_content = file.name.split('.')[0]
      return false;
    },
    separateSvgComponents(src) {
      const _this = this;
      // this.$store.state.ori_svg = src;
      _this.svg_list.push(src);
      _this.$store.state.svg_list.push(src);
      let mid_st_str = `<path d="`;
      let mid_start = src.indexOf(mid_st_str) + mid_st_str.length;
      let head = src.substring(0, mid_start);
      let width = +head.split(`width="`)[1].split(`"`)[0];
      let height = +head.split(`height="`)[1].split(`"`)[0];
      _this.svg_style.width = width + "px";
      _this.svg_style.height = height + "px";
      _this.$store.state.svg_width = width;
      _this.$store.state.svg_height = height;
      src = src.substr(mid_start + 1);
      let mid_end = src.indexOf(`"`);
      let mid = src.substr(0, mid_end);
      let tail = src.substr(mid_end);
      let dis = {coms: []};
      dis.width = 100;
      const scale = dis.width / width;
      dis.height = scale * height;
      dis.style = {
        width: dis.width + "px",
        height: dis.height + "px"
      };
      const tranx = width * 0.5 * (scale - 1);
      const trany = height * 0.5 * (scale - 1);
      dis.coms.push(`<svg width="${width}" height="${height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="M${mid}"></path></svg>`)
      mid.split("M").forEach((it) => {
        const cur_svg = head + "M" + it + tail;
        _this.svg_list.push(cur_svg);
        _this.$store.state.svg_list.push(cur_svg);
        _this.$store.state.d_list.push("M" + it);
        dis.coms.push(`<svg width="${width}" height="${height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="M${it}"></path></svg>`)
      });
      _this.dis = dis;
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