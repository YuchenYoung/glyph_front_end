<template>
  <el-row>
    <el-col :span="18">
      <div id="visD3" style="height: 59%;" class="block-area">
        <p class="title">Visualization</p>
        <el-button type="warning" plain class="btn-visop" id="btn-export" @click="exportGraph">Export</el-button>
        <el-button type="warning" class="btn-visop" id="btn-update" @click="updateMaps" style="">Update</el-button>
        <div style="margin-top: 12px;">
          <ul>
            <el-scrollbar class="vertical-scroll">
              <li v-for="(it, index) in img_obj.eles" :key="index">
                <div v-html="it" style="width: 100px; height: 100px; box-sizing: content-box"></div>
                <span>Element {{ index }}</span>
              </li>
            </el-scrollbar>
          </ul>
          <graph ref="mainGraph" :key="selectedKey" :best="true" v-on:selectedImgEncoding="getSelectedEncoding" style="width: 60%; margin-left: 5%; display: inline-block;"></graph>
        </div>
      </div>
      <edit :key="editKey" :lockedProps="locked_props" :encoding="selectedEncoding" ref="edit" style="height: 34%"></edit>
    </el-col>
    <el-col :span="6">
      <alternative ref="alt" :key="altKey" v-on:selectedImgChanged="getSelectedChanged"></alternative>
    </el-col>
  </el-row>
</template>

<script>
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
    }
  },
  created() {
    this.img_obj = this.$store.state.selected_img;
  },
  methods: {
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
        mapped: new_maps
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
      const content = this.$refs.mainGraph.$refs.mainGraph.innerHTML;
      const fileName = `vis-${this.$store.state.theme}.svg`;
      const element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content))
      element.setAttribute('download', fileName);
      element.style.display = 'none';
      element.click();
    }
  }
};
</script>

<style lang="less" scoped>
.btn-visop {
  position: absolute;
  float: right;
  top: 30px;
  right: 28%;
  padding: 10px 24px;
  font-size: 18px;
  font-family: "Lucida Sans Unicode";
}

#btn-update {
  margin-right: 130px;
  // background-color: #e9b95a;
}


ul {
  list-style: none;
  padding: 0;
  margin: 0;
  width: 230px;
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
}

li div {
  background-color: #ffffff;
  border: 2px solid #e4ae40;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
}

.el-button--warning.is-plain:hover {
  background: #f7d694;
}

</style>;
