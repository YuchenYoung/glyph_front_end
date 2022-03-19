<template>
  <div class="block-area" style="text-align: center">
    <p class="title">Gallery</p>
    <div style="width: 100%; height: 480px;">
      <el-scrollbar class="vertical-scroll">
        <div v-for="(it, index) in objs" :key="index" @click="changeBest($event, index)" style="width: 86%; margin-left: 2%; margin-top: 10px">
          <el-popover placement="left" width="100" trigger="hover" close-delay="100">
            <!-- <graph :best="false" :old="true" :obj="firstImg(index)"></graph> -->
            <div v-html="it.eles[0]" style="width: 100px; height: 100px; box-sizing: content-box"></div>
            <graph :best="false" :old="false" :obj="it" ref="altGraph" :key="render_keys[index]" slot="reference" style="cursor: pointer;"></graph>
          </el-popover>
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
  computed: {
    firstImg() {
      return function(index) {
        return this.$store.state.first_imgs[index];
      }
    }
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
        // console.log('yyyyyyyyyyyyyyyyy');
        // console.log(_this.$refs);
        _this.$refs.altGraph[index].$forceUpdate();
      })
    }
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="less">
.el-popover {
  min-width: 0;
}
</style>