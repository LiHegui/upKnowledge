<template>
  <div class="about">
    <h1>This is an about page</h1>
    <input :value="state.count" type="text" @change="changeState" />
  </div>
</template>
<script setup lang="ts">
import { reactive } from "vue";

const state = reactive({
  count: 0,
});

const changeState = (event:any) => {
  state.count = event.target.value
};
</script>
<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
