<template>
  <el-container>
    <el-header height='50px'> MetaGlyph </el-header>
    <el-container>
      <el-aside style="width: auto">
        <navigator></navigator>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import Navigator from "../components/Navigator.vue";
export default {
  name: "Index",
  components: {
    navigator: Navigator,
  },
};
</script>

<style lang="less">
@import "../assets/font/font.css";
@themeYelllow: #e4ae40;
@bgGray: #f8f6f0;


.el-container,
.el-row,
.el-col {
  height: 100%;
}

.el-aside {
  width: 80px;
}

.el-main {
  padding: 0;
}

.el-aside > ul,
.el-header, .block-area {
  margin: 16px 12px 0;
  height: 95%;
  background-color: @bgGray;
  // border: 2px solid @themeYelllow;
  border-radius: 8px;
}

.el-header {
  font-family: "QuiteMagical";
  letter-spacing: 5px;
  font-size: 60px;
  color: @bgGray;
  text-align: center;
  height: 200px;
  background-color: @themeYelllow;
}

.el-scrollbar {
  height: 100%;
}

.el-scrollbar__wrap {
  overflow: scroll;
}

.horizon-scroll .el-scrollbar__wrap {
  height: 120%;
  overflow-y: hidden;
}

.vertical-scroll .el-scrollbar__wrap {
  width: 115%;
  overflow-x: hidden;
}

</style>