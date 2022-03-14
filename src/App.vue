<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

  export default {
    name: 'App',
    components: {
    }
  }
  </script>

<style lang="less">
#app {
  /* font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50; */
  @import './assets/font/font.css';
  @themeYelllow: #e4ae40;
  @bgGray: #fdf6e3;
  background-color: @themeYelllow;
}

.title {
  text-align: left;
  margin-left: 24px;
  margin-top: 0;
  margin-bottom: 14px;
  padding-top: 16px;
  font-size: 28px;
  font-weight: 500;
  font-family: "Lucida Sans Unicode";
  position: relative;
}

#nav {
  // padding: 30px;
}
</style>
