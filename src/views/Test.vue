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
      <el-button type="success" @click="searchImg" style="margin-left: 20px">TestSVG</el-button>
      <el-button @click="exampleImg">Default</el-button>
    </div>
    <div ref="testSvgSize"></div>
    <div>
      <div v-for="(item, index) in svg_list" :key="item">
        <el-divider></el-divider>
        <h3>Image {{ index + 1 }}</h3>
        <!-- <div v-html="item.code" class="svg-area"></div> -->
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
    <div>
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
        method: "get",
        url: "/testServer/",
      }).then((res) => {
        console.log(res.data);
        this.server_response = res.data;
      });
    },
    exampleImg() {
      let img_urls = [
        'https://img1.baidu.com/it/u=3988299520,1364854370&fm=253&fmt=auto&app=138&f=JPEG?w=450&h=468',
        'https://cdn3.iconfinder.com/data/icons/food-and-drink-55/50/burger-13-2-512.png',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQX9DMqAGXnvFSDHs_Qd-d2Xl2qcwrHo8gbA&usqp=CAU',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTh4kVYP6xekBhOtr4e_xzvHT9vUxz6U7oRCw&usqp=CAU',
      ]
      this.img_urls = img_urls;
      this.imgToSVG();
    },
    searchImg() {
      console.log(this.search_keys);
      this.img_urls = [];
      this.svg_list = [];
      this.$axios({
        method: "get",
        url: "/search/",
        params: {
          keyWords: this.search_keys,
          imgNum: this.search_num,
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
          this.displayResult(this.segmentSvg(res_svg.toString()));
          // this.separateSvgComponents(res_svg);
        });
      });
      console.log(this.svg_list);
    },
    segmentSvg(src) {
      let retval = {svgs: [], ds: []};
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
      retval.svgs.push(head + filter_ds.join(' ') + tail);
      retval.ds.push(filter_ds.join(' '));
      filter_ds.forEach((it) => {
        retval.ds.push(it);
        retval.svgs.push(head + it + tail);
      });
      return retval;
    },
    filterSepSvgs(d_list, img_width, img_height) {
      let fil_ds = [];
      d_list.forEach(it => {
        let judge = true;
        this.$refs.testSvgSize.innerHTML = `<svg><path d="${it}"></path></svg>`;
        const cur_size = this.$refs.testSvgSize.childNodes[0].childNodes[0].getBoundingClientRect();
        this.$refs.testSvgSize.innerHTML = '';
        if (cur_size.width / img_width < 0.05 && cur_size.height / img_height < 0.05) {
          return;
        }
        d_list.forEach(out => {
          if (!judge || it == out) return;
          this.$refs.testSvgSize.innerHTML = `<svg><path d="${out}"></path></svg>`;
          const out_size = this.$refs.testSvgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          this.$refs.testSvgSize.innerHTML = `<svg><path d="${out+it}"></path></svg>`;
          const tog_size = this.$refs.testSvgSize.childNodes[0].childNodes[0].getBoundingClientRect();
          this.$refs.testSvgSize.innerHTML = '';
          if (Math.abs(out_size.height - tog_size.height) <= 1e-6 && Math.abs(out_size.width - tog_size.width) <= 1e-6) {
            judge = false;
          }
        });
        if (judge) fil_ds.push(it);
      });
      return fil_ds;
    },
    displayResult(obj) {
      let svg_obj = {
        code: obj.svgs[0],
        style: {},
        com_list: [],
        width: 0,
        height: 0,
      };
      let width = 100;
      let scale = width / obj.width;
      let height = obj.height * scale;
      let tranx = obj.width * 0.5 * (scale - 1);
      let trany = obj.height * 0.5 * (scale - 1);
      svg_obj.style.width = width + "px";
      svg_obj.style.height = height + "px";
      svg_obj.width = width;
      svg_obj.height = height;
      obj.ds.forEach((it) => {
        svg_obj.com_list.push(
          `<svg width="${obj.width}" height="${obj.height}" transform="translate(${tranx},${trany}),scale(${scale},${scale})"><path d="${it}"></path></svg>`
        );
      });
      this.svg_list.push(svg_obj);
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