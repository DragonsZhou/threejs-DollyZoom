<template>
  <div id="main">
    <div id="video"></div>
  </div>
</template>

<script>
import MyBone from "./MyBone"
export default {
  name: 'App',
  components: {
  },
  mounted(){
    let el=document.getElementById("video")
    MyBone(el)
  }
}
</script>
<style  scoped>
#main{
  margin-top: 50px;
  width: 100%;
  display: flex;
  justify-content: center;
  /* background-color: black; */
}
#video{
  width: 1080px;
  height: 540px;
}
</style>
<style>
*{
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
</style>
