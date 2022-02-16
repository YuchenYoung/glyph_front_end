<template>
  <div style="text-align: center; width: 94%; margin-left: 3%">
    <h2>Test SVG</h2>
    <div>
      <el-input
        style="width: auto"
        placeholder="Search content"
        v-model="search_keys"
        clearable
      >
      </el-input>
      <el-input-number
        v-model="search_num"
        controls-position="right"
        :step="1"
        :min="1"
        style="margin-left: 20px"
      ></el-input-number>
      <el-button @click="searchImg" style="margin-left: 20px"
        >TestSVG</el-button
      >
    </div>
    <div>
      <div v-for="(item, index) in svg_list" :key="item">
        <el-divider></el-divider>
        <h3>Image {{ index + 1 }}</h3>
        <div v-html="item.code" class="svg-area"></div>
        <ul>
          <li
            v-for="it in item.com_list"
            :key="it"
            v-html="it"
            :style="item.style"
            class="svg-area"
          ></li>
        </ul>
      </div>
    </div>
    <div v-if="false">
      <el-divider></el-divider>
      <h2>Test Server</h2>
      <el-button @click="testServer">Test Server</el-button>
      <p>{{ server_response }}</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "UpFile",
  props: {},
  data() {
    return {
      table_display: false,
      search_keys: "",
      search_num: 10,
      img_urls: [],
      svg_list: [],
      server_response: "",
    };
  },
  methods: {
    testServer() {
      this.$axios({
        method: "post",
        url: "/testServer",
      }).then((res) => {
        console.log(res.data);
        this.server_response = res.data;
      });
    },
    searchImg() {
      console.log(this.search_keys);
      this.$axios({
        method: "post",
        url: "/search",
        params: {
          keyWords: this.search_keys,
          imgNum: this.search_num * 3,
        },
      }).then((res) => {
        console.log(res.data);
        this.img_urls = [];
        this.svg_list = [];
        res.data.forEach((it) => {
          this.img_urls.push(it);
        });
        this.imgToSVG();
      });
    },
    imgToSVG() {
      // const _this = this;
      this.img_urls.forEach((cur_url) => {
        const potrace = require("potrace");
        let trace = new potrace.Potrace();
        trace.loadImage(cur_url, (err) => {
          if (err) {
            throw err;
          }
          let res_svg = trace.getSVG();
          console.log(res_svg);
          this.separateSvgComponents(res_svg);
        });
      });
      console.log(this.svg_list);
    },
    separateSvgComponents(src) {
      // const _this = this;
      let svg_obj = {
        code: src,
        style: {},
        com_list: [],
        path_list: [],
        width: 0,
        height: 0,
      };
      let mid_st_str = `<path d="`;
      let mid_start = src.indexOf(mid_st_str) + mid_st_str.length;
      let head = src.substring(0, mid_start);
      let ori_width = +head.split(`width="`)[1].split(`"`)[0];
      let ori_height = +head.split(`height="`)[1].split(`"`)[0];
      let width = 100;
      let scale = width / ori_width;
      let height = ori_height * scale;
      let tranx = ori_width * 0.5 * (scale - 1);
      let trany = ori_height * 0.5 * (scale - 1);
      svg_obj.style.width = width + "px";
      svg_obj.style.height = height + "px";
      svg_obj.width = width;
      svg_obj.height = height;
      src = src.substr(mid_start + 1);
      let mid_end = src.indexOf(`"`);
      let mid = src.substr(0, mid_end);
      // let tail = src.substr(mid_end);
      mid.split("M").forEach((it) => {
        // svg_obj.com_list.push(head + "M" + it + tail);
        svg_obj.com_list.push(
          `<svg width="${ori_width}" height="${ori_height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="M${it}"></path></svg>`
        );
        svg_obj.path_list.push("M" + it);
      });
      if (
        svg_obj.path_list.length < 10 &&
        this.svg_list.length < this.search_num
      ) {
        this.svg_list.push(svg_obj);
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

.svg-area {
  overflow: hidden;
  background-color: #fff;
  border: 1px solid #c0ccda;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
  display: inline-block;
}
</style>