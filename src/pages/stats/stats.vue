<template>
  <view class="page">
    <view class="header"><text class="h-title">📊 饮食分析</text></view>
    <view class="content">
      <view v-if="loading" class="loading"><text>加载中...</text></view>
      <template v-else>
        <view class="stat-card">
          <text class="sc-head">📋 两天总览</text>
          <view class="sc-grid">
            <view class="sc-item"><text class="sc-val">{{ avgKcal }}</text><text class="sc-l">日均热量</text></view>
            <view class="sc-item"><text class="sc-val">{{ totalProtein }}g</text><text class="sc-l">总蛋白</text></view>
            <view class="sc-item"><text class="sc-val">{{ weightChange }}</text><text class="sc-l">体重变化</text></view>
          </view>
        </view>

        <view class="stat-card more">
          <text class="sc-head green">✓ 多吃这些</text>
          <view v-if="proteinCount < 3" class="sc-tip"><text>🥩 蛋白质不够 — 建议每天至少1份(鸡蛋/鸡胸肉/鱼虾)</text></view>
          <view v-if="vegCount < 4" class="sc-tip"><text>🥬 蔬菜偏少 — 建议每天至少2-3份绿叶菜</text></view>
          <view v-if="proteinEaten.length" class="sc-note"><text>已吃蛋白: {{ proteinEaten.join('、') }}</text></view>
          <view v-if="vegEaten.length" class="sc-note"><text>已吃蔬菜: {{ vegEaten.join('、') }}</text></view>
        </view>

        <view class="stat-card less">
          <text class="sc-head orange">⚠ 少吃这些</text>
          <view v-if="carbCount > 6" class="sc-tip warn"><text>🍚 碳水偏多 — 两天{{ carbCount }}次，适当减量</text></view>
          <view v-if="junkCount > 0" class="sc-tip warn"><text>🚫 垃圾食品 — {{ junkEaten.join('、') }}</text></view>
          <view v-if="junkCount === 0 && carbCount <= 6" class="sc-tip ok"><text>👍 碳水控制得不错，继续保持</text></view>
        </view>

        <view class="stat-card rec">
          <text class="sc-head primary">💡 明天建议</text>
          <view class="sc-tip"><text>🍳 早餐加一个水煮蛋(补蛋白)</text></view>
          <view class="sc-tip"><text>🥗 午餐保证2份蔬菜(深绿色优先)</text></view>
          <view class="sc-tip"><text>🍚 晚餐减少主食，多吃蛋白质+蔬菜</text></view>
          <view class="sc-tip"><text>💧 喝水2000ml+(帮助代谢)</text></view>
          <view class="sc-tip"><text>🚶 饭后散步20分钟(有助消化)</text></view>
        </view>
      </template>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const loading = ref(true)
const avgKcal = ref(0)
const totalProtein = ref(0)
const weightChange = ref('--')
const proteinCount = ref(0)
const vegCount = ref(0)
const carbCount = ref(0)
const junkCount = ref(0)
const proteinEaten = ref<string[]>([])
const vegEaten = ref<string[]>([])
const junkEaten = ref<string[]>([])

onMounted(() => {
  // Demo data - will be replaced with Supabase query
  setTimeout(() => {
    avgKcal.value = 855
    totalProtein.value = 48
    weightChange.value = '-1.4'
    proteinCount.value = 2
    vegCount.value = 1
    carbCount.value = 4
    junkCount.value = 0
    proteinEaten.value = ['煎蛋', '煎牛肉', '虾仁']
    vegEaten.value = ['菠菜']
    loading.value = false
  }, 500)
})
</script>

<style>
.page { min-height: 100vh; background: #F7F4EF; }
.header { padding: 20rpx 40rpx 20rpx; }
.h-title { font-size: 36rpx; font-weight: 800; color: #1C1917; }
.content { padding: 0 40rpx 40rpx; }
.loading { text-align: center; padding: 100rpx; color: #A8A29E; font-size: 28rpx; }
.stat-card { background: #fff; border: 1rpx solid #EAE5DD; border-radius: 28rpx; padding: 32rpx; margin-bottom: 24rpx; }
.sc-head { font-size: 28rpx; font-weight: 800; margin-bottom: 24rpx; color: #1C1917; display: block; }
.sc-head.green { color: #3D8B6E; }
.sc-head.orange { color: #D4572E; }
.sc-head.primary { color: #D4572E; }
.sc-grid { display: flex; justify-content: space-around; text-align: center; }
.sc-item .sc-val { font-size: 44rpx; font-weight: 800; color: #D4572E; display: block; }
.sc-item .sc-l { font-size: 20rpx; color: #A8A29E; margin-top: 6rpx; font-weight: 600; display: block; }
.sc-tip { font-size: 24rpx; color: #6B6560; padding: 12rpx 0; line-height: 1.7; }
.sc-tip.warn { color: #D4572E; }
.sc-tip.ok { color: #3D8B6E; }
.sc-note { font-size: 20rpx; color: #A8A29E; margin-top: 12rpx; padding: 12rpx 20rpx; background: #F7F4EF; border-radius: 16rpx; font-weight: 500; }
.stat-card.more { border-left: 6rpx solid #3D8B6E; }
.stat-card.less { border-left: 6rpx solid #D4572E; }
.stat-card.rec { border-left: 6rpx solid #D4572E; }
</style>
