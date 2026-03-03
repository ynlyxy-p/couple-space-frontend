<template>
  <el-card>
    <div class="moment-header">
      <el-avatar :src="moment.publisher.avatar" class="moment-avatar"></el-avatar>
      <div class="moment-publisher">
        <span class="username">{{ moment.publisher.username }}</span>
        <span class="time">{{ formatDate(moment.created_at) }}</span>
      </div>
    </div>
    <div class="moment-content">{{ moment.content }}</div>
    <div class="moment-images" v-if="moment.images.length > 0">
      <el-image
          v-for="(img, index) in moment.images"
          :key="index"
          :src="img"
          fit="cover"
          class="moment-image"
          preview-src-list="moment.images"
      ></el-image>
    </div>
  </el-card>
</template>

<script setup>
const props = defineProps({
  moment: {
    type: Object,
    required: true
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`
}
</script>

<style scoped>
.moment-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.moment-avatar {
  margin-right: 10px;
}

.username {
  font-weight: bold;
  display: block;
}

.time {
  font-size: 12px;
  color: #999;
}

.moment-content {
  margin-bottom: 10px;
  line-height: 1.6;
}

.moment-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.moment-image {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}
</style>