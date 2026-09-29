<template>
  <view class="page">
    <view class="header">
      <text class="h-title">📖 我的日记</text>
      <text class="h-add" @tap="addEvent">+ 记录</text>
    </view>
    <view class="content">
      <view v-for="event in events" :key="event.title" class="journal-entry">
        <view class="je-date">
          <text>{{ event.date }}</text>
          <text class="je-type" :class="event.type">{{ typeLabels[event.type] || '事件' }}</text>
        </view>
        <text class="je-title">{{ event.title }}</text>
        <text v-if="event.desc" class="je-desc">{{ event.desc }}</text>
        <view v-if="event.impact" class="je-impact">
          <text>{{ event.impact }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const typeLabels: Record<string, string> = { travel: '旅行', feast: '聚餐', milestone: '里程碑', other: '事件' }
const events = ref([
  { date: '2026-09-25', type: 'travel', title: '去了景德镇玩3天', desc: '中秋假期去了景德镇，来回吃了泡面，中间3天吃了江西菜，喝了超级多的水和饮料。', impact: '体重从 ~70kg 涨到 73.8kg，胖了约 6斤' },
  { date: '2026-09-27', type: 'milestone', title: '开始记录体重', desc: '从景德镇回来后开始认真记录体重，目标是回到70kg。', impact: '' },
  { date: '2026-09-29', type: 'milestone', title: '体重降到72.0kg', desc: '比昨天早上降了1.4kg，水分在消退。', impact: '距离第一阶段目标 70kg 还差 2kg' }
])

function addEvent() {
  uni.showToast({ title: '去日记页面添加', icon: 'none' })
}
</script>

<style>
.page { min-height: 100vh; background: #FAF8F5; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 32rpx 16rpx; }
.h-title { font-size: 34rpx; font-weight: 800; color: #1C1917; }
.h-add { font-size: 26rpx; color: #D4572E; font-weight: 700; }
.content { padding: 0 32rpx 60rpx; }
.journal-entry { background: #fff; border: 1rpx solid #EAE5DD; border-radius: 24rpx; padding: 28rpx; margin-bottom: 16rpx; }
.je-date { font-size: 22rpx; font-weight: 600; color: #A8A29E; margin-bottom: 12rpx; display: flex; align-items: center; gap: 12rpx; }
.je-type { font-size: 18rpx; font-weight: 700; padding: 4rpx 14rpx; border-radius: 10rpx; }
.je-type.travel { background: rgba(91,141,184,0.1); color: #5B8DB8; }
.je-type.milestone { background: rgba(61,139,110,0.08); color: #3D8B6E; }
.je-title { font-size: 28rpx; font-weight: 800; color: #1C1917; margin-bottom: 10rpx; display: block; }
.je-desc { font-size: 24rpx; color: #6B6560; line-height: 1.7; display: block; }
.je-impact { margin-top: 16rpx; padding: 16rpx 20rpx; background: #FAF8F5; border-radius: 16rpx; border-left: 6rpx solid #D4572E; }
.je-impact text { font-size: 22rpx; color: #6B6560; line-height: 1.7; }
</style>