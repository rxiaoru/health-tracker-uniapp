<template>
  <view class="page">
    <view class="header"><text class="h-title">📝 记录饮食</text></view>
    <view class="content">
      <view class="m-sec">
        <text class="m-label">餐次</text>
        <view class="meal-picker">
          <view v-for="m in mealTypes" :key="m.label" class="mp" :class="{ active: selMeal === m.label }" @tap="selMeal = m.label">
            <text class="mp-i">{{ m.icon }}</text>
            <text>{{ m.label }}</text>
          </view>
        </view>
      </view>
      <view class="m-sec">
        <text class="m-label">吃了什么</text>
        <textarea class="m-input" v-model="foodText" placeholder="用逗号分隔，例如：&#10;米饭半碗，西兰花炒虾仁，一个苹果" :maxlength="500" />
      </view>
      <button class="m-btn" @tap="analyze">
        {{ analyzing ? '分析中...' : '🔍 分析热量' }}
      </button>
      <view v-if="result" class="result">
        <text class="ar-title">📊 分析结果</text>
        <view v-for="item in result.items" :key="item.name" class="ar-item">
          <text class="k">{{ item.name }} <text class="kd">{{ item.portion }}</text></text>
          <text class="v">{{ item.kcal }} kcal</text>
        </view>
        <view class="ar-total"><text>总计</text><text class="v">{{ result.total }} kcal</text></view>
        <button class="save-btn" @tap="save">💾 保存</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { analyzeFoodText, type FoodItem } from '@/utils/foodDb'
import { addMeal } from '@/utils/api'

const mealTypes = [
  { icon: '🌅', label: '早餐' },
  { icon: '☀️', label: '午餐' },
  { icon: '🌙', label: '晚餐' },
  { icon: '🍰', label: '加餐' }
]
const selMeal = ref('早餐')
const foodText = ref('')
const analyzing = ref(false)
const result = ref<{ items: FoodItem[]; total: number } | null>(null)

function analyze() {
  if (!foodText.value.trim()) {
    uni.showToast({ title: '请输入食物', icon: 'none' })
    return
  }
  analyzing.value = true
  setTimeout(() => {
    result.value = analyzeFoodText(foodText.value)
    analyzing.value = false
  }, 500)
}

async function save() {
  if (!result.value) return
  try {
    var now = new Date()
    var y = now.getFullYear()
    var m = String(now.getMonth() + 1).padStart(2, '0')
    var d = String(now.getDate()).padStart(2, '0')
    var today = `${y}-${m}-${d}`
    for (const item of result.value.items) {
      await addMeal({ date: today, meal_type: selMeal.value, food_name: item.name, portion: item.portion, kcal: item.kcal })
    }
    uni.showToast({ title: '已保存' })
    setTimeout(() => uni.navigateBack(), 1000)
  } catch (e) {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}
</script>

<style>
.page { min-height: 100vh; background: #FAF8F5; }
.header { padding: 20rpx 32rpx 16rpx; }
.h-title { font-size: 34rpx; font-weight: 800; color: #1C1917; }
.content { padding: 0 32rpx 60rpx; }
.m-sec { margin-bottom: 32rpx; }
.m-label { font-size: 12px; font-weight: 600; color: #A8A29E; margin-bottom: 12rpx; display: block; text-transform: uppercase; letter-spacing: 1px; }
.meal-picker { display: flex; gap: 12rpx; }
.mp { flex: 1; padding: 20rpx 8rpx 16rpx; border-radius: 20rpx; border: 2rpx solid #EAE5DD; background: #fff; font-size: 22rpx; font-weight: 600; color: #6B6560; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8rpx; transition: all .2s; }
.mp-i { font-size: 32rpx; display: block; }
.mp.active { border-color: #D4572E; color: #D4572E; background: #FDF0EA; }
.m-input { width: 100%; box-sizing: border-box; min-height: 180rpx; padding: 24rpx; border-radius: 20rpx; border: 2rpx solid #EAE5DD; font-size: 28rpx; background: #fff; color: #1C1917; line-height: 1.6; }
.m-btn { width: 100%; box-sizing: border-box; padding: 26rpx; border-radius: 24rpx; border: none; background: #D4572E; color: #fff; font-size: 30rpx; font-weight: 700; margin-top: 20rpx; text-align: center; display: flex; align-items: center; justify-content: center; }
.m-btn::after { border: none; }
.result { margin-top: 28rpx; padding: 28rpx; background: #fff; border-radius: 24rpx; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.ar-title { font-size: 28rpx; font-weight: 800; color: #1C1917; display: block; margin-bottom: 16rpx; }
.ar-item { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0; border-bottom: 1rpx solid #F0EDE8; }
.ar-item .k { font-size: 26rpx; color: #1C1917; font-weight: 500; }
.ar-item .kd { font-size: 22rpx; color: #A8A29E; margin-left: 8rpx; }
.ar-item .v { font-size: 26rpx; font-weight: 700; color: #D4572E; }
.ar-total { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0 8rpx; font-size: 26rpx; font-weight: 700; color: #1C1917; }
.ar-total .v { font-size: 36rpx; color: #D4572E; font-weight: 800; }
.save-btn { width: 100%; box-sizing: border-box; padding: 24rpx; border-radius: 24rpx; border: none; background: #3D8B6E; color: #fff; font-size: 28rpx; font-weight: 700; margin-top: 24rpx; text-align: center; }
.save-btn::after { border: none; }
</style>
