<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "textVue",
  mounted() {
    this.$bus.$emit("bbb", { a: 222 });
    console.log("事件b");
  },
};
</script>

<style>
</style>