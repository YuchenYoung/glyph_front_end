<template>
  <el-menu
    class="el-menu-vertical-demo"
    :collapse="true"
    :router="true"
    :default-active="$route.path"
  >
    <el-menu-item index="/index/data">
      <!-- <div class="menu-background"></div> -->
      <i class="el-icon-data-analysis"></i>
      <span slot="title">Data</span>
    </el-menu-item>
    <el-menu-item index="/index/image">
      <!-- <div class="menu-background"></div> -->
      <i class="el-icon-picture-outline"></i>
      <span slot="title">Image</span>
    </el-menu-item>
    <el-menu-item index="/index/vis">
      <!-- <div class="menu-background"></div> -->
      <i class="el-icon-data-line"></i>
      <span slot="title">Visualization</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>
// .menu-background {
//   background-color: aquamarine;
//   position: absolute;
//   width: 50%;
//   height: 50%;
//   border-radius: 50%;
//   z-index: -1;
// }

// ul {
//   z-index: -2;
// }
</style>