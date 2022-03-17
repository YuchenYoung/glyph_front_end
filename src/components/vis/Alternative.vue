<template>
  <div class="block-area" style="text-align: center">
    <p class="title">Alternative</p>
    <div style="width: 100%; height: 480px;">
      <el-scrollbar class="vertical-scroll">
        <div v-for="(it, index) in objs" :key="index" @click="changeBest($event, index)" style="width: 86%; margin-left: 4%; margin-top: 10px">
          <graph :best="false" :obj="it" ref="altGraph" :key="render_keys[index]"></graph>
        </div>
      </el-scrollbar>
    </div>
  </div>
</template>

<script>
import Graph from './Graph.vue';
// import xlsx from "xlsx";
export default {
  components: { Graph },
  name: "Alternative",
  data() {
    return {
      objs: [],
      render_keys: [],
    };
  },
  created() {
    this.objs = this.$store.state.img_preview;
    this.render_keys = new Array(this.objs.length).fill(0);
  },
  methods: {
    changeBest(event, index) {
      // console.log(`change best ${index}`);
      this.$emit('selectedImgChanged', index);
    },
    updateRender(index) {
      // console.log("wwwwwwwwwwwwwwwwwwwwwwwww");
      // console.log(index);
      this.objs = this.$store.state.img_preview;
      const _this = this;
      _this.$nextTick(() => {
        // these two ways don't work
        // _this.render_keys[index]++;
        _this.$refs.altGraph[index].$forceUpdate();
      })
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>