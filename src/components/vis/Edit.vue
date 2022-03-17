<template>
  <div class="block-area" style="text-align: center">
    <p class="title">Edit</p>
    <div class="edit-area" style="">
      <el-scrollbar class="horizon-scroll">
        <div v-for="(it, idx) in maps" :key="idx" class="edit-item" :style="{'border-color': it.last ? '#1ea7c0': '#e4ae40'}">
          <div class="prop-box" style="">
            {{ it.prop }}
          </div>
          <div style="margin-top: 10px;">
            <span>Element</span>
            <el-select v-model="it.element" size="mini" style="width: 90px; margin-left: 10px">
              <el-option v-for="item in elements" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </div>
          <div style="margin-top: 5px;">
            <span>Encoding</span>
            <el-select v-model="it.type" size="mini" style="width: 90px; margin-left: 5px">
              <el-option v-for="item in encodings" :key="item" :label="item" :value="item">
              </el-option>
            </el-select>
          </div>
        </div>
        <div style="width: 50px"></div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
export default {
  props: ['encoding', 'lastProps'],
  data() {
    return {
      maps: [],
      elements: ['none'],
      encodings: ['none', 'x', 'y', 'color', 'alpha', 'length', 'size', 'flower', 'pie', 'heatmap', 'star']
    }
  },
  created() {
    const props = this.$store.state.props;
    const group_props = this.$store.state.group_props;
    const mapped_props = [];
    const last_props = this.lastProps;
    // const maps = this.$store.state.selected_img.mapper; 
    const img = this.$store.state.selected_img;
    for (let i = 0; i < img.d_list.length; i++) {
      this.elements.push(i);
    }
    let group_cnt = 0;
    for (let i = 0; i < this.encoding.length; i++) {
      let prop = this.encoding[i].prop;
      if (this.encoding[i].is_group) {
        prop = `group${group_cnt}`;
        group_cnt++;
      }
      if (prop != 'none') {
        let in_last = false;
        if (last_props.includes(prop)) in_last = true;
        this.maps.push({
          prop: prop,
          element: this.encoding[i].element,
          type: this.encoding[i].encoding,
          last: in_last
        });
        mapped_props.push(prop)
      }
    }
    const single_props = props.filter(d => !group_props.includes(d) && !mapped_props.includes(d));
    single_props.forEach(it => {
      this.maps.push({
        prop: it,
        element: "none",
        type: "none",
        last: false
      });
    });
  },
};
</script>

<style lang="less" scoped>

.edit-area {
  height: 150px; 
  width: 94%; 
  margin-left: 3%; 
  margin-right: 25px; 
  white-space: nowrap; 
  // overflow-x: scroll;
}

.edit-item {
  height: 125px; 
  width: 180px; 
  margin-right: 10px; 
  display: inline-block; 
  border: 2px solid #e4ae40; 
}

.prop-box {
  border: 1px solid; 
  height: 40px; 
  width: 160px; 
  margin-left: 10px; 
  margin-top: 10px; 
  white-space: normal; 
  font-size: 12px;
}

</style>