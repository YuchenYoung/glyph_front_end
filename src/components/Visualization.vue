<template>
  <el-row>
    <el-col :span="18">
      <div id="visD3" style="height: 59%;" class="block-area">
        <div style="text-align: left;">
          <p class="title">Visualization</p>
          <el-button type="warning" class="btn-visop" id="btn-toggle" @click="toggleVis">Toggle</el-button>
        </div>
        <div style="margin-top: 12px;">
          <ul>
            <el-scrollbar class="vertical-scroll">
              <li v-for="(it, index) in img_obj.eles" :key="index">
                <div v-html="resizeSvg(it, 70)" :style="{'border-color': index == ele_hover ? '#e56240' : '#e4ae40'}"></div>
                <span>Element {{ index }}</span>
              </li>
            </el-scrollbar>
          </ul>
          <graph ref="mainGraph" :key="selectedKey" :best="true" v-on:selectedImgEncoding="getSelectedEncoding" style="width: 60%; margin-left: 5%; display: inline-block;"></graph>
        </div>
      </div>
      <edit :key="editKey" :lockedProps="locked_props" :encoding="selectedEncoding" ref="edit" style="height: 34%" v-on:updateMaps="updateMaps" v-on:exportGraph="exportGraph" v-on:eleHoverChange="changeEleHover"></edit>
    </el-col>
    <el-col :span="6">
      <alternative ref="alt" :key="altKey" v-on:selectedImgChanged="getSelectedChanged"></alternative>
    </el-col>
  </el-row>
</template>

<script>
import JsZip from 'jszip'
import Graph from "../components/vis/Graph.vue";
import Alternative from "../components/vis/Alternative.vue";
import Edit from '../components/vis/Edit.vue'
export default {
  name: "Visualization",
  components: {
    "graph": Graph,
    "alternative": Alternative,
    "edit": Edit
  },
  data() {
    return {
      selectedKey: 0,
      editKey: 0,
      altKey: 0,
      selectedEncoding: [],
      img_obj: {},
      locked_props: [],
      ele_hover: -1,
    }
  },
  created() {
    this.img_obj = this.$store.state.selected_img;
  },
  methods: {
    resizeSvg(src, new_width) {
      new_width = parseInt(new_width)
      const width = +(src.split(`width="`)[1].split(`"`)[0]);
      const height = +(src.split(`height="`)[1].split(`"`)[0]);
      const new_height = parseInt(height * new_width / width);
      let head = src.split(`width="`)[0] + `width="`;
      let tail = src.substring(src.indexOf(`width="`) + 7);
      tail = tail.substring(tail.indexOf(`"`))
      let retval = head + new_width + tail;
      head = retval.split(`height="`)[0] + `height="`;
      tail = retval.substring(src.indexOf(`height="`) + 8);
      tail = tail.substring(tail.indexOf(`"`))
      retval = head + new_height + tail;
      return retval;
    },
    getSelectedChanged(index) {
      this.$store.state.selected_index = +index;
      this.$store.state.selected_img = this.$store.state.img_preview[+index];
      this.img_obj = this.$store.state.selected_img;
      this.locked_props = [];
      this.selectedKey += 1;
    },
    getSelectedEncoding(obj) {
      console.log('===================');
      console.log(obj);
      this.selectedEncoding = obj;
      this.editKey += 1;
    },
    reRenderPage() {
      this.img_obj = this.$store.state.selected_img;
      this.$nextTick(() => {
        this.selectedKey += 1;
        this.altKey += 1;
        // _this.$refs.alt.updateRender(this.$store.state.selected_index);
      });
    },
    toggleVis() {
      this.$refs.mainGraph.show_vis = !this.$refs.mainGraph.show_vis;
    },
    changeEleHover(ele) {
      this.ele_hover = ele;
    },
    updateMaps() {
      const last_maps = this.$refs.edit.maps;
      const img_num = this.img_obj.d_list.length;
      const _this = this;
      const pos = this.$store.state.selected_index;
      this.$store.state.img_preview[pos].encoded = {};
      let new_maps = [];
      last_maps.forEach(it => {
        if (it.prop != 'none') {
          let cur_ele = it.element;
          if (!it.selected && !it.locked) {
            return;
          }
          if (cur_ele == 'none') {
            cur_ele = img_num;
          } else {
            if (it.type != 'none') {
              this.$store.state.img_preview[pos].encoded[it.prop] = it.type;
            }
          }
          if (it.prop.indexOf("group") >= 0) {
            new_maps.push({is_group: true, prop: it.prop.split("group")[1], ele: cur_ele});
          } else {
            new_maps.push({is_group: false, prop: it.prop, ele: cur_ele});
          }
          if (it.selected && !this.locked_props.includes(it.prop)) {
            this.locked_props.push(it.prop);
          }
        }
      });
      if (!this.$refs.edit.remap) {
        this.$store.state.selected_img = this.$store.state.img_preview[pos];
        this.reRenderPage();
        return;
      }
      let up_data = {
        content: this.$store.state.theme,
        dataProps: this.$store.state.props,
        similarity: this.$store.state.similarity,
        dataTypes: this.$store.state.data_type,
        groups : this.$store.state.group_props,
        svgsList: this.$store.state.all_svgs.slice(pos, pos + 1),
        mapped: new_maps,
        cachedMatrix: false
      };
      console.log(up_data)
      this.$axios({
        method: "post",
        url: "/mapping/mul/",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: up_data,
      }).then((res) => {
        _this.$store.state.img_preview[pos].mapper = res.data.mappers[0];
        _this.$store.state.img_preview[pos].score = res.data.scores[0];
        _this.$store.state.selected_img = _this.$store.state.img_preview[pos];
        this.reRenderPage();
      })
    },
    exportGraph() {
      // console.log(this.$refs.mainGraph.$refs);
      const zip = new JsZip();
      let files = [];

      const vis_svg = this.resizeSvg(this.$refs.mainGraph.$refs.mainGraph.childNodes[0].outerHTML, 1200);
      files.push({name: 'visulization.svg', raw: vis_svg});

      const legend_svg = this.resizeSvg(this.$refs.mainGraph.$refs.mainGraph.childNodes[1].outerHTML, 800);
      files.push({name: 'legend.svg', raw: legend_svg});
      
      const ori_svg = this.resizeSvg(this.img_obj.eles[0], this.img_obj.ori_size.width);
      // const ori_svg = this.img_obj.eles[0];
      files.push({name: 'image.svg', raw: ori_svg});

      let map_csv = ['prop', 'element', 'encoding-type'].join(',') + '\n';
      this.selectedEncoding.forEach(it => {
        if (it.prop != 'none' && it.element != 'none' && it.encoding != 'none') {
          map_csv += ([it.prop, it.element, it.encoding].join(',') + '\n');
        }
      })
      files.push({name: 'encoding.csv', raw: map_csv});

      files.forEach(it => {
        zip.file(it.name, it.raw);
      })
      zip.generateAsync({
        type: "blob",
        compression: "DEFLATE",
        compressionOptions: {
          level: 9
        }
      }).then(content => {
        const fileName = `vis-${this.$store.state.theme}.zip`;
        const element = document.createElement('a');
        element.setAttribute('href', URL.createObjectURL(content))
        element.setAttribute('download', fileName);
        element.style.display = 'none';
        element.click();
      });
      
    }
  }
};
</script>

<style lang="less" scoped>

.btn-visop {
  float: right;
  margin-top: 20px;
  margin-right: 28px;
  padding: 10px 24px;
  font-size: 18px;
  font-family: "Lucida Sans Unicode";
}

.title {
  display: inline-block;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 240px;
  text-align: center;
  height: 290px;
  margin-left: 40px;
  display: inline-block;
  text-align: left;
}

li {
  overflow: hidden;
  display: inline-block;
  text-align: center;
  margin-bottom: 10px;
}

li div {
  width: 74px; 
  height: 74px; 
  box-sizing: content-box;
  background-color: #ffffff;
  border: 2px solid;
  // border-color: #e4ae40;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 4px 0;
}

li span {
  font-size: 14px;
  margin-left: -8px;
}


</style>;
