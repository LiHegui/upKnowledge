<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js App" @aaa="text" />
    <textVue foo="123">
      <button @click="text('123')">
        123
      </button>
    </textVue>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import textVue from "./components/text.vue";

export default {
  name: "App",
  components: {
    HelloWorld,
    textVue
  },
  mounted() {
    console.log(this.$bus);

  },
  methods: {
    text(a) {
      console.log(a);
    },
    text2(b){
      console.log("b");
      console.log(b);
    }
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
