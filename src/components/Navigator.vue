<template>
  <el-menu class="el-menu-vertical-demo" :collapse="false" :router="true" :default-active="$route.path">
    <el-menu-item index="/index/data" id="nav-data">
      <div class="menu-background" id="bg-data">
        <svg width="24" height="24" viewBox="-1 7 36 18">
          <path d="M18.8333 14.65V24H27.0833C30.75 23.6333 33.5 20.5167 33.5 16.6667C33.5 12.6333 30.2 9.33332 26.1667 9.33332H25.9833C25.0667 5.11665 21.4 1.99999 17 1.99999C11.8667 1.99999 7.83333 6.03332 7.83333 11.1667C4.71667 11.5333 2.33333 14.2833 2.33333 17.5833C2.33333 21.0667 5.26667 24 8.75 24H17V14.65L12.7833 18.8667L11.5 17.5833L17.9167 11.1667L24.3333 17.5833L23.05 18.8667L18.8333 14.65ZM18.8333 24V25.8333H17V24H14.25V25.8333H8.75C4.16667 25.8333 0.5 22.1667 0.5 17.5833C0.5 13.9167 2.88333 10.8 6 9.69999C6.73333 4.38332 11.3167 0.166656 17 0.166656C21.7667 0.166656 25.9833 3.28332 27.45 7.49999C31.85 8.04999 35.3333 11.9 35.3333 16.6667C35.3333 21.4333 31.6667 25.2833 27.0833 25.8333H21.5833V24H18.8333Z" fill="black"/>
        </svg>
      </div>
      <span slot="title" class="item-span">Data</span>
    </el-menu-item>
    <el-menu-item index="/index/preprocess" id="nav-preprocess">
      <div class="menu-background" id="bg-preprocess">
        <svg width="24" height="24" viewBox="0 0.5 31 34">
          <path d="M9.86364 9.86364V15.5H16.9091V9.86364H9.86364ZM0 0H5.63636V1.40909H25.3636V0H31V5.63636H29.5909V25.3636H31V31H25.3636V29.5909H5.63636V31H0V25.3636H1.40909V5.63636H0V0ZM5.63636 25.3636V26.7727H25.3636V25.3636H26.7727V5.63636H25.3636V4.22727H5.63636V5.63636H4.22727V25.3636H5.63636ZM7.04545 7.04545H19.7273V12.6818H23.9545V23.9545H9.86364V18.3182H7.04545V7.04545ZM19.7273 18.3182H12.6818V21.1364H21.1364V15.5H19.7273V18.3182Z" fill="white"/>
        </svg>
      </div>
      <span slot="title" class="item-span">Preprocess</span>
    </el-menu-item>
    <el-menu-item index="/index/vis" id="nav-vis">
      <div class="menu-background" id="bg-vis">
        <svg width="24" height="24" viewBox="0 0 36 34">
          <path d="M11.3899 18.8315C11.367 18.8608 11.3441 18.8913 11.3339 18.9283L9.5677 25.4037C9.46454 25.7806 9.57025 26.1868 9.84915 26.4733C10.058 26.6771 10.333 26.7891 10.6259 26.7891C10.7227 26.7891 10.8195 26.7777 10.915 26.7522L17.3444 24.9987C17.3547 24.9987 17.3598 25.0076 17.3674 25.0076C17.4412 25.0076 17.5139 24.9809 17.5686 24.9248L34.761 7.73491C35.2717 7.22367 35.5518 6.5271 35.5518 5.7694C35.5518 4.91049 35.1876 4.05223 34.5496 3.41612L32.926 1.78997C32.2893 1.15196 31.4297 0.78714 30.5714 0.78714C29.8138 0.78714 29.1172 1.06732 28.6053 1.57728L11.4154 18.7717C11.3976 18.7882 11.4027 18.8124 11.3899 18.8315ZM33.0788 6.05147L31.3711 7.75791L28.6027 4.94553L30.2862 3.26205C30.5523 2.99466 31.068 3.03353 31.3737 3.34036L32.9985 4.96655C33.168 5.13592 33.2647 5.36127 33.2647 5.58411C33.2635 5.7669 33.1985 5.93244 33.0788 6.05147ZM14.4474 19.1015L26.853 6.6952L29.6228 9.50946L17.2401 21.8915L14.4474 19.1015ZM12.1871 24.1315L13.0836 20.841L15.475 23.2325L12.1871 24.1315Z" fill="black"/>
          <path d="M34.1676 12.8636C33.5169 12.8636 32.9833 13.3927 32.9808 14.0524V30.079C32.9808 30.9194 32.2982 31.602 31.4565 31.602H4.34542C3.50497 31.602 2.81983 30.9195 2.81983 30.079V3.9204C2.81983 3.07925 3.50497 2.39609 4.34542 2.39609H21.8065C22.461 2.39609 22.9921 1.86449 22.9921 1.20986C22.9921 0.556641 22.461 0.0243378 21.8065 0.0243378H4.16461C2.11569 0.0243378 0.44812 1.69063 0.44812 3.74083V30.2598C0.44812 32.31 2.11569 33.9757 4.16461 33.9757H31.636C33.6863 33.9757 35.3532 32.31 35.3532 30.2598V14.0447C35.3505 13.3927 34.8183 12.8636 34.1676 12.8636Z" fill="black"/>
        </svg>
      </div>
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
  padding-bottom: 10px;
  font-size: 16px;
  padding-left: 20px;
  background-color: white;
  width: 90%;
  height: 62px;
  margin-left: 5%;
  margin-top: 10px;
  margin-bottom: 10px;
  box-sizing: border-box;
  border: 2px solid transparent;
  border-radius: 10px;
}

#nav-data.is-active {
  border: 2px solid #1e6c69;
}

#nav-preprocess.is-active {
  border: 2px solid #e4ae40;
}

#nav-vis.is-active {
  border: 2px solid #e56240;
}

.item-span {
  margin-left: 50px;
}

#nav-data {
  color: #1e6c69;
}

#nav-preprocess {
  color: #e4ae40;
}

#nav-vis {
  color: #e56240;
}

.menu-background {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-top: 9px;
  margin-left: -8px;
  z-index: 2;
  background-color: #f7eccb;
}

.menu-background svg {
  margin-top: -15px;
  margin-left: 8px;
}

.is-active .menu-background svg path {
  fill: white !important;
}

#bg-data svg path {
  fill: #1e6c69;
}

#bg-preprocess svg path {
  fill: #e4ae40;
}

#bg-vis svg path {
  fill: #e56240;
}

.is-active #bg-data {
  background-color: #1e6c69;
}

.is-active #bg-preprocess {
  background-color: #e4ae40;
}

.is-active #bg-vis {
  background-color: #e56240;
}

ul {
  z-index: 5;
}
</style>