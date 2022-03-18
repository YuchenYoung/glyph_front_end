<template>
  <el-row>
    <el-col :span="18">
      <div id="visD3" style="height: 59%;" class="block-area">
        <p class="title">Visualization</p>
        <el-button type="warning" plain class="btn-visop" id="btn-export" @click="exportGraph">Export</el-button>
        <el-button type="warning" class="btn-visop" id="btn-update" @click="updateMaps" style="">Update</el-button>
        <div>
          <ul>
            <el-scrollbar class="vertical-scroll">
              <li v-for="(it, index) in img_obj.eles" :key="index">
                <div v-html="it" :style="img_obj.style"></div>
                <span>Element {{ index }}</span>
              </li>
            </el-scrollbar>
          </ul>
          <graph ref="mainGraph" :key="selectedKey" :best="true" v-on:selectedImgEncoding="getSelectedEncoding" style="width: 60%; margin-left: 5%; display: inline-block;"></graph>
        </div>
      </div>
      <edit :key="editKey" :lastProps="last_props" :lockedProps="locked_props" :encoding="selectedEncoding" ref="edit" style="height: 34%"></edit>
    </el-col>
    <el-col :span="6">
      <alternative ref="alt" v-on:selectedImgChanged="getSelectedChanged"></alternative>
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
      selectedEncoding: [],
      img_obj: {},
      last_props: [],
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
      this.last_props = [];
      this.selectedKey += 1;
    },
    getSelectedEncoding(obj) {
      console.log('===================');
      console.log(obj);
      this.selectedEncoding = obj;
      this.editKey += 1;
    },
    updateMaps() {
      const last_maps = this.$refs.edit.maps;
      const img_num = this.img_obj.d_list.length;
      const _this = this;
      let new_maps = [];
      this.last_props = [];
      this.locked_props = [];
      last_maps.forEach(it => {
        if (it.prop != 'none') {
          let cur_ele = it.element;
          if (cur_ele == 'none') {
            if (!it.locked) return;
            cur_ele = img_num;
          }
          if (it.prop.indexOf("group") >= 0) {
            new_maps.push({is_group: true, prop: it.prop.split("group")[1], ele: cur_ele});
          } else {
            new_maps.push({is_group: false, prop: it.prop, ele: cur_ele});
          }
          this.last_props.push(it.prop);
          if (it.locked) {
            this.locked_props.push(it.prop);
          }
        }
      });
      const pos = this.$store.state.selected_index;
      let up_data = {
        content: this.$store.state.theme,
        dataProps: this.$store.state.props,
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
        _this.img_obj = _this.$store.state.selected_img;
        _this.$nextTick(() => {
          _this.selectedKey += 1;
          _this.$refs.alt.updateRender(this.$store.state.selected_index);
        })
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
  width: 220px;
  text-align: center;
  height: 300px;
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
  background-color: #f4f5dc;
  border: 2px solid #e4ae40;
  border-radius: 6px;
  box-sizing: border-box;
  margin: 0 8px 8px 0;
}
</style>;
