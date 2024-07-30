<template>
  <div id="main">
    <div id="video">
    </div>
  </div>
</template>

<script>
import { init } from "./init.js";

export default {
  name: 'App',
  components: {
  },
  data() {
    return {
      width: 1080,
      height: 680,
    }
  },
  computed: {
    widthpx() { return this.width + "px" },
    heightpx() { return this.height + "px" },
  },
  mounted() {
    let el = document.getElementById("video")
    init(el, this.width, this.height)
  },
}
</script>
<style scoped>
#main {
  margin-top: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  /* background-color: black; */
}

#video {
  width: v-bind(widthpx);
  height: v-bind(heightpx);
  overflow: hidden;
}
</style>
<style>
* {
  border: 0;
  margin: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.lil-gui {
  z-index: 2 !important;
}
</style>