<template>
  <el-menu
    class="el-menu-vertical-demo"
    :collapse="false"
    :router="true"
    :default-active="$route.path"
  >
    <el-menu-item index="/index/data" id="nav-data">
      <div class="menu-background" id="bg-data"></div>
      <i class="el-icon-data-analysis"></i>
      <span slot="title" class="item-span">Data</span>
    </el-menu-item>
    <el-menu-item index="/index/image" id="nav-image">
      <div class="menu-background" id="bg-image"></div>
      <i class="el-icon-picture-outline"></i>
      <span slot="title" class="item-span">Gallery</span>
    </el-menu-item>
    <el-menu-item index="/index/vis" id="nav-vis">
      <div class="menu-background" id="bg-vis"></div>
      <i class="el-icon-data-line"></i>
      <span slot="title" class="item-span">Visualization</span>
    </el-menu-item>
  </el-menu>
</template>

<script>
export default {};
</script>

<style lang="less" scoped>

.el-menu-item {
  padding-right: 40px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 18px;
}

.item-span {
  margin-left: 15px;
}

#nav-data {
  padding-left: 30px;
  // border: 2px solid rgb(39, 187, 39);
  color: #1e6c69;
}

#nav-image {
  padding-left: 30px;
  // border: 2px solid red;
  color: #E4AE40;
}

#nav-vis {
  padding-left: 30px;
  // border: 2px solid yellow;
  color: #E56240;
}

.menu-background {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-top: 9px;
  margin-left: -8px;
  z-index: 2;
}

#bg-data {
  background-color: rgba(30, 108, 105, 0.4);
}

#bg-image {
  background-color: rgba(228, 174, 64, 0.4);
}

#bg-vis {
  background-color: rgba(229, 98, 64, 0.4);
}

ul {
  z-index: 5;
}
</style>