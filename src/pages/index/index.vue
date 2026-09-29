<template>
  <view class="page">
    <view class="header">
      <view class="h-left">
        <text class="h-greeting">{{ greeting }}</text>
        <text class="h-date">{{ currentDate }}</text>
      </view>
      <view class="h-badge">{{ daysCount }} 天</view>
    </view>

    <view class="stats">
      <view class="stat">
        <text class="sa-num">{{ currentWeight }}<text class="u">kg</text></text>
        <text class="sa-label">当前体重</text>
      </view>
      <view class="stat">
        <text class="sa-num" :class="changeKg > 0 ? 'warn' : 'ok'">{{ changeKg > 0 ? '+' : '' }}{{ changeKg }}<text class="u">kg</text></text>
        <text class="sa-label">较基线</text>
      </view>
      <view class="stat">
        <text class="sa-num ok">{{ toTarget }}<text class="u">kg</text></text>
        <text class="sa-label">距目标</text>
      </view>
      <view class="stat">
        <text class="sa-num">70<text class="u">kg</text></text>
        <text class="sa-label">目标</text>
      </view>
    </view>

    <view class="hero">
      <view class="hero-card">
        <view class="hero-top">
          <text class="hero-label">今日热量</text>
          <text class="hero-date">{{ todayDate }}</text>
        </view>
        <view class="hero-main">
          <view class="ring-wrap">
            <text class="ring-num">{{ totalKcal }}</text>
            <text class="ring-unit">/ 2000 KCAL</text>
          </view>
          <view class="hero-info">
            <view class="hi-row">
              <text class="hi-label">已摄入</text>
              <text class="hi-val c1">{{ totalKcal }} kcal</text>
            </view>
            <view class="hi-row">
              <text class="hi-label">还能吃</text>
              <text class="hi-val c2">{{ Math.max(2000 - totalKcal, 0) }} kcal</text>
            </view>
            <view class="hi-row">
              <text class="hi-label">蛋白质</text>
              <text class="hi-val c3">{{ protein }}g</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="macros">
      <view class="macro-card"><text class="mc-icon">🥩</text><text class="mc-val p">{{ protein }}g</text><text class="mc-label">蛋白质</text></view>
      <view class="macro-card"><text class="mc-icon">🍚</text><text class="mc-val c">{{ carbs }}g</text><text class="mc-label">碳水</text></view>
      <view class="macro-card"><text class="mc-icon">🥑</text><text class="mc-val f">{{ fat }}g</text><text class="mc-label">脂肪</text></view>
    </view>

    <view class="weight-card">
      <view class="wc-top">
        <text class="wc-title">体重记录</text>
        <text class="wc-badge" :class="changeKg > 0 ? 'up' : 'down'">{{ changeKg > 0 ? '↑' : '↓' }} {{ Math.abs(changeKg) }}kg</text>
      </view>
      <view class="wc-big"><text class="wc-num">{{ currentWeight }}</text><text class="wc-unit">kg</text></view>
      <text class="wc-sub">● 第一阶段 70kg · 还差 {{ toTarget }}kg</text>
      <view class="body-link" @tap="goBody"><text>📏 填写身高·体型分析</text></view>
    </view>

    <view class="section">
      <view class="sec-head">
        <text class="sec-title">🍽️ 今日饮食</text>
        <text class="sec-more" @tap="goAdd">+ 记录</text>
      </view>
      <view v-for="meal in meals" :key="meal.type" class="meal-card">
        <view class="meal-row">
          <view class="meal-icon" :class="meal.cls"><text>{{ meal.icon }}</text></view>
          <view class="meal-info">
            <text class="meal-name">{{ meal.type }}</text>
            <text class="meal-detail">{{ meal.detail }}</text>
          </view>
          <view class="meal-right">
            <text class="meal-kcal">{{ meal.kcal }} <text class="u">kcal</text></text>
            <text class="meal-time">{{ meal.time }}</text>
          </view>
        </view>
      </view>
      <view class="add-meal" @tap="goAdd"><text>+ 添加饮食记录</text></view>
    </view>

    <view class="advice-card">
      <view class="adv-head"><view class="adv-icon">💡</view><text class="adv-title">AI 小助手</text></view>
      <view class="adv-good"><text v-for="g in advice.good" :key="g" class="g-tag">✓ {{ g }}</text></view>
      <view v-for="t in advice.tips" :key="t" class="a-tip"><view class="at-d" /><text class="at-t">{{ t }}</text></view>
      <view class="a-final"><text>📌 {{ advice.overall }}</text></view>
    </view>

    <view class="fab" @tap="goAdd"><text class="fab-icon">+</text></view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { getMeals, getWeights } from '@/utils/api'

const greeting = ref('')
const currentDate = ref('')
const daysCount = ref(0)
const currentWeight = ref('72.0')
const totalKcal = ref(1035)
const protein = ref(48)
const carbs = ref(95)
const fat = ref(38)

const changeKg = computed(() => (parseFloat(currentWeight.value) - 70).toFixed(1))
const toTarget = computed(() => (parseFloat(currentWeight.value) - 70).toFixed(1))

const meals = ref([
  { type: '早餐', icon: '🌅', cls: 'breakfast', time: '早上', kcal: 145, detail: '拿铁、全麦面包' },
  { type: '午餐', icon: '🍱', cls: 'lunch', time: '中午', kcal: 900, detail: '煎蛋、牛肉、虾仁、烤肠、鸡米花、菠菜、米饭' }
])

const advice = ref({
  good: ['体重回落(↓1.4kg)', '午餐蛋白质充足'],
  tips: ['鸡米花和烤肠热量较高', '晚餐建议清淡', '多喝水帮助代谢'],
  overall: '午餐蛋白质很棒，但炸物偏多，晚餐吃清淡点就好'
})

onMounted(() => {
  const now = new Date()
  const hour = now.getHours()
  greeting.value = hour < 12 ? '早上好' : hour < 18 ? '下午好' : '晚上好'
  var y = now.getFullYear()
  var m = String(now.getMonth() + 1).padStart(2, '0')
  var d = String(now.getDate()).padStart(2, '0')
  var weekdays = ['周日','周一','周二','周三','周四','周五','周六']
  currentDate.value = `${y}-${m}-${d} ${weekdays[now.getDay()]}`
  loadData()
})

async function loadData() {
  try {
    var now = new Date()
    var y = now.getFullYear()
    var m = String(now.getMonth() + 1).padStart(2, '0')
    var d = String(now.getDate()).padStart(2, '0')
    var today = `${y}-${m}-${d}`
    var meals = await getMeals(today)
    if (meals && meals.length > 0) {
      totalKcal.value = meals.reduce(function(s: number, m: any) { return s + (m.kcal || 0) }, 0)
    }
    var weights = await getWeights()
    if (weights && weights.length > 0) {
      currentWeight.value = String(weights[0].morning_weight || 72.0)
    }
    daysCount.value = weights ? weights.length : 0
  } catch (e) {
    console.error('load error', e)
  }
}

function goAdd() { uni.navigateTo({ url: '/pages/add/add' }) }
function goBody() { uni.navigateTo({ url: '/pages/body/body' }) }
</script>

<style>
.page { min-height: 100vh; background: #F7F4EF; padding-bottom: 120rpx; font-family: -apple-system, "PingFang SC", sans-serif; }
.header { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 40rpx 20rpx; }
.h-left { display: flex; flex-direction: column; gap: 4rpx; }

.h-greeting { font-size: 34rpx; font-weight: 800; color: #1C1917; display: block; letter-spacing: -0.5rpx; }
.h-date { font-size: 22rpx; color: #A8A29E; font-weight: 500; }
.h-badge { font-size: 20rpx; color: #6B6560; background: #fff; padding: 8rpx 20rpx; border-radius: 20rpx; font-weight: 600; box-shadow: 0 2rpx 8rpx rgba(28,25,23,0.04); }
.stats { display: flex; margin: 0 40rpx 20rpx; background: #fff; border-radius: 36rpx; padding: 24rpx 0; box-shadow: 0 2rpx 16rpx rgba(28,25,23,0.04); }
.stat { flex: 1; text-align: center; }
.sa-num { font-size: 38rpx; font-weight: 800; color: #1C1917; }
.sa-num .u { font-size: 18rpx; color: #A8A29E; font-weight: 500; }
.sa-num.warn { color: #D4572E; }
.sa-num.ok { color: #3D8B6E; }
.sa-label { font-size: 18rpx; color: #A8A29E; margin-top: 6rpx; font-weight: 600; display: block; }
.hero { padding: 0 40rpx; margin-bottom: 24rpx; }
.hero-card { background: #fff; border-radius: 40rpx; padding: 48rpx 44rpx; box-shadow: 0 2rpx 16rpx rgba(28,25,23,0.05); }
.hero-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32rpx; }
.hero-label { font-size: 24rpx; font-weight: 700; color: #6B6560; }
.hero-date { font-size: 22rpx; color: #A8A29E; background: #F7F4EF; padding: 8rpx 20rpx; border-radius: 24rpx; }
.hero-main { display: flex; align-items: center; gap: 44rpx; }
.ring-wrap { display: flex; flex-direction: column; align-items: center; }
.ring-num { font-size: 72rpx; font-weight: 800; color: #1C1917; }
.ring-unit { font-size: 18rpx; color: #A8A29E; font-weight: 600; letter-spacing: 2rpx; margin-top: 4rpx; }
.hero-info { flex: 1; }
.hi-row { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0; }
.hi-label { font-size: 24rpx; color: #6B6560; font-weight: 500; }
.hi-val { font-size: 34rpx; font-weight: 800; }
.hi-val.c1 { color: #D4572E; } .hi-val.c2 { color: #3D8B6E; } .hi-val.c3 { color: #C47D6A; }
.macros { display: flex; gap: 20rpx; padding: 0 40rpx; margin-bottom: 28rpx; }
.macro-card { flex: 1; background: #fff; border-radius: 28rpx; padding: 28rpx 20rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.mc-icon { font-size: 34rpx; display: block; margin-bottom: 12rpx; }
.mc-val { font-size: 36rpx; font-weight: 800; display: block; }
.mc-val.p { color: #3D8B6E; } .mc-val.c { color: #D4572E; } .mc-val.f { color: #C47D6A; }
.mc-label { font-size: 20rpx; color: #A8A29E; font-weight: 600; }
.weight-card { background: #fff; border-radius: 36rpx; padding: 40rpx; margin: 0 40rpx 28rpx; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.wc-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.wc-title { font-size: 24rpx; font-weight: 700; color: #A8A29E; }
.wc-badge { font-size: 22rpx; font-weight: 800; padding: 6rpx 18rpx; border-radius: 20rpx; }
.wc-badge.up { color: #D4572E; background: #FDF0EA; }
.wc-badge.down { color: #3D8B6E; background: #EBF3EF; }
.wc-big { display: flex; align-items: baseline; gap: 8rpx; margin-bottom: 8rpx; }
.wc-num { font-size: 88rpx; font-weight: 800; letter-spacing: -3rpx; color: #1C1917; }
.wc-unit { font-size: 28rpx; color: #A8A29E; font-weight: 600; }
.wc-sub { font-size: 24rpx; color: #6B6560; font-weight: 500; }
.body-link { display: inline-flex; align-items: center; gap: 10rpx; margin-top: 20rpx; padding: 12rpx 28rpx; border-radius: 40rpx; background: #EDF3F8; color: #5B8DB8; font-size: 22rpx; font-weight: 700; }
.section { padding: 0 40rpx; margin-bottom: 28rpx; }
.sec-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20rpx; }
.sec-title { font-size: 32rpx; font-weight: 800; color: #1C1917; }
.sec-more { font-size: 26rpx; color: #D4572E; font-weight: 700; }
.meal-card { background: #fff; border-radius: 28rpx; margin-bottom: 20rpx; overflow: hidden; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.meal-row { display: flex; align-items: center; padding: 30rpx; gap: 24rpx; }
.meal-icon { width: 88rpx; height: 88rpx; border-radius: 28rpx; display: flex; align-items: center; justify-content: center; font-size: 38rpx; flex-shrink: 0; }
.meal-icon.breakfast { background: #FEFAEC; }
.meal-icon.lunch { background: #FDF0EA; }
.meal-info { flex: 1; min-width: 0; }
.meal-name { font-size: 30rpx; font-weight: 700; color: #1C1917; display: block; margin-bottom: 6rpx; }
.meal-detail { font-size: 23rpx; color: #A8A29E; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.meal-right { text-align: right; flex-shrink: 0; }
.meal-kcal { font-size: 32rpx; font-weight: 800; color: #D4572E; }
.meal-kcal .u { font-size: 20rpx; color: #A8A29E; font-weight: 500; }
.meal-time { font-size: 20rpx; color: #A8A29E; margin-top: 4rpx; }
.add-meal { width: 100%; padding: 28rpx; border-radius: 28rpx; border: 3rpx dashed #EAE5DD; background: transparent; color: #A8A29E; font-size: 28rpx; font-weight: 700; text-align: center; }
.advice-card { background: linear-gradient(135deg, #EBF3EF, #fff 60%); border-radius: 36rpx; padding: 36rpx; margin: 0 40rpx 28rpx; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.adv-head { display: flex; align-items: center; gap: 16rpx; margin-bottom: 24rpx; }
.adv-icon { width: 64rpx; height: 64rpx; border-radius: 22rpx; background: #3D8B6E; display: flex; align-items: center; justify-content: center; font-size: 30rpx; }
.adv-title { font-size: 30rpx; font-weight: 800; color: #3D8B6E; }
.adv-good { display: flex; flex-wrap: wrap; gap: 12rpx; margin-bottom: 20rpx; }
.g-tag { font-size: 22rpx; font-weight: 700; color: #3D8B6E; background: #fff; border-radius: 16rpx; padding: 8rpx 20rpx; }
.a-tip { display: flex; gap: 14rpx; padding: 8rpx 0; }
.at-d { width: 10rpx; height: 10rpx; border-radius: 50%; background: #3D8B6E; margin-top: 14rpx; flex-shrink: 0; opacity: 0.5; }
.at-t { font-size: 24rpx; color: #6B6560; line-height: 1.7; }
.a-final { margin-top: 24rpx; font-size: 24rpx; font-weight: 600; color: #1C1917; background: #fff; border-radius: 20rpx; padding: 20rpx 26rpx; }
.fab { position: fixed; right: 40rpx; bottom: 140rpx; width: 108rpx; height: 108rpx; border-radius: 40rpx; background: linear-gradient(135deg, #E8734A, #D4572E); display: flex; align-items: center; justify-content: center; box-shadow: 0 12rpx 32rpx rgba(232,115,74,0.35); z-index: 99; }
.fab-icon { color: #fff; font-size: 48rpx; font-weight: 300; }
</style>
