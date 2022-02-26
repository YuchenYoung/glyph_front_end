<template>
  <div>
    <up-file></up-file>
    <el-divider></el-divider>
    <up-image></up-image>
    <el-divider></el-divider>
    <graph></graph>
    <div style="margin-top: 20px; height: 1px"></div>
  </div>
</template>

<script>
import UpFile from "../components/UpFile.vue";
import UpImage from "../components/UpImage.vue";
import Graph from '../components/vis/Graph.vue'
export default {
  name: "Whole",
  components: {
    "up-file": UpFile,
    "up-image": UpImage,
    "graph": Graph,
  },
};
</script>

<style lang="less" scoped>
</style>