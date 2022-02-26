<template>
  <el-row>
    <el-col :span="18">
      <graph></graph>
    </el-col>
    <el-col :span="6">
      <alternative></alternative>
    </el-col>
  </el-row>
</template>

<script>
import Graph from "../components/vis/Graph.vue";
import Alternative from "../components/vis/Alternative.vue";
export default {
  name: "Visualization",
  components: {
    "graph": Graph,
    "alternative": Alternative,
  },
};
</script>

<style lang="less" scoped></style>;
