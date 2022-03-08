<template>
  <div class="block-area" style="text-align: center">
    <p class="title">Alternative</p>
    <div style="width: 100%; max-height: 480px; overflow-y: scroll;">
      <div v-for="(it, index) in objs" :key="index" style="width: 92%; margin-left: 4%; margin-top: 10px">
      <graph :best="false" :obj="it"></graph>
    </div>
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
      objs: []
    };
  },
  created() {
    this.objs = this.$store.state.img_preview;
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="less">

</style>