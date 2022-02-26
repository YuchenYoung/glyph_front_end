<template>
  <el-container>
    <el-aside style="width: auto">
      <navigator></navigator>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script>
import Navigator from '../components/Navigator.vue'
export default {
  name: "Index",
  components: {
    "navigator": Navigator
  },
};
</script>

<style lang="less">

.el-container, .el-row, .el-col {
  height: 100%;
}

.el-aside {
  width: auto;
}

.el-main {
  padding: 0;
}

.el-aside > ul, .block-area {
  margin: 16px 12px 0;
  height: 95%;
  background-color: #fafafa;
  border: 1px solid #c0c0c0;
  border-radius: 10px;
}

</style>

<style lang="less" scoped>

</style>
