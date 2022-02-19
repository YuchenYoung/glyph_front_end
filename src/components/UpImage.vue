<template>
  <div style="text-align: center">
    <h2>Image Upload</h2>
    <el-button v-if="false" @click="testData">Test Data</el-button>
    <div v-show="upload_display">
      <el-input
        style="width: auto"
        placeholder="Search content"
        v-model="img_content"
        clearable
      >
      </el-input>
      <el-button @click="searchImg" style="margin-left: 20px"
        >Search</el-button
      >
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
      dis: {},
      img_content: ''
    };
  },
  methods: {
    testData() {
      console.log("test");
    },
    searchImg() {
      this.$axios({
        method: "get",
        url: "/search/",
        params: {
          keyWords: this.img_content + "+icon",
          imgNum: 10,
        },
      }).then((res) => {
        this.$store.state.img_content = this.img_content;
        console.log(res.data);
        let img_urls = [];
        res.data.forEach((it) => {
          img_urls.push(it);
        });
        this.viewImg(img_urls[1]);
      });
    },
    readImgFile(file) {
      let cur_src = URL.createObjectURL(file);
      this.viewImg(cur_src);
      this.$store.state.img_content = file.name.split(".")[0];
      return false;
    },
    viewImg(src) {
      const _this = this;
      const potrace = require("potrace");
      let trace = new potrace.Potrace();
      trace.loadImage(src, (err) => {
        if (err) throw err;
        let res_svg = trace.getSVG();
        _this.separateSvgComponents(res_svg.toString());
        _this.upload_display = false;
        _this.svg_display = true;
      });
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
      let dis = { coms: [] };
      dis.width = 100;
      const scale = dis.width / width;
      _this.$store.state.ex_scale = scale;
      dis.height = scale * height;
      dis.style = {
        width: dis.width + "px",
        height: dis.height + "px",
      };
      const tranx = width * 0.5 * (scale - 1);
      const trany = height * 0.5 * (scale - 1);
      dis.coms.push(
        `<svg width="${width}" height="${height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="M${mid}"></path></svg>`
      );
      mid.split("M").forEach((it) => {
        const cur_svg = head + "M" + it + tail;
        _this.svg_list.push(cur_svg);
        _this.$store.state.svg_list.push(cur_svg);
        _this.$store.state.d_list.push("M" + it);
        dis.coms.push(
          `<svg width="${width}" height="${height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="M${it}"></path></svg>`
        );
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