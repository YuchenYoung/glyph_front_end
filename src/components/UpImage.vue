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
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    </el-upload>
    <ul v-show="svg_display">
      <li v-for="item in svg_list" :key="item" v-html="item" :style="svg_style"></li>
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
      return false;
    },
    separateSvgComponents(src) {
      const _this = this;
      let mid_st_str = `<path d="`;
      let mid_start = src.indexOf(mid_st_str) + mid_st_str.length;
      let head = src.substring(0, mid_start);
      _this.svg_style.width = head.split(`width="`)[1].split(`"`)[0] + "px";
      _this.svg_style.height = head.split(`height="`)[1].split(`"`)[0] + "px";
      _this.$store.state.svg_width = +head.split(`width="`)[1].split(`"`)[0];
      _this.$store.state.svg_height = +head.split(`height="`)[1].split(`"`)[0];
      src = src.substr(mid_start + 1);
      let mid_end = src.indexOf(`"`);
      let mid = src.substr(0, mid_end);
      let tail = src.substr(mid_end);
      mid.split("M").forEach((it) => {
        _this.svg_list.push(head + "M" + it + tail);
        _this.$store.state.d_list.push("M" + it);
      });
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