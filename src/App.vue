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
  @bgGray: #f8f6f0;
  background-color: @themeYelllow;
}

#nav {
  // padding: 30px;
}
</style>
