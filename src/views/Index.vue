<template>
  <div>
    <up-file></up-file>
    <el-divider></el-divider>
    <up-image></up-image>
    <el-divider></el-divider>
    <visualization></visualization>
  </div>
</template>

<script>
import UpFile from "../components/UpFile.vue";
import UpImage from "../components/UpImage.vue";
import Visualization from '../components/Visualization.vue'
export default {
  name: "Index",
  components: {
    "up-file": UpFile,
    "up-image": UpImage,
    "visualization": Visualization,
  },
};
</script>

<style lang="less" scoped>
</style>
