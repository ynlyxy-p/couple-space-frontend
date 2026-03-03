<template>
  <div class="app-container">
    <!-- 路由出口：所有页面渲染到这里 -->
    <router-view></router-view>
  </div>
</template>

<script setup>
// 根组件仅作为路由容器
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.app-container {
  width: 100%;
  height: 100vh;
  background-color: #f5f5f5;
}
</style>