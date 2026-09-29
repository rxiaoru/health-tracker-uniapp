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
.page { min-height: 100vh; background: #F7F4EF; }
.header { padding: 80rpx 40rpx 20rpx; }
.h-title { font-size: 36rpx; font-weight: 800; color: #1C1917; }
.content { padding: 0 40rpx 40rpx; }
.m-sec { margin-bottom: 36rpx; }
.m-label { font-size: 22rpx; font-weight: 700; color: #A8A29E; margin-bottom: 16rpx; display: block; text-transform: uppercase; letter-spacing: 2rpx; }
.meal-picker { display: flex; gap: 16rpx; }
.mp { flex: 1; padding: 24rpx 8rpx; border-radius: 24rpx; border: 3rpx solid #EAE5DD; background: #fff; font-size: 22rpx; font-weight: 700; color: #6B6560; text-align: center; }
.mp.active { border-color: #D4572E; color: #D4572E; background: #FDF0EA; }
.mp-i { display: block; font-size: 36rpx; margin-bottom: 8rpx; }
.m-input { width: 100%; min-height: 200rpx; padding: 28rpx; border-radius: 28rpx; border: 3rpx solid #EAE5DD; font-size: 30rpx; background: #fff; color: #1C1917; }
.m-btn { width: 100%; padding: 30rpx; border-radius: 28rpx; border: none; background: #D4572E; color: #fff; font-size: 30rpx; font-weight: 800; margin-top: 20rpx; }
.result { margin-top: 28rpx; padding: 32rpx; background: #fff; border-radius: 28rpx; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.ar-title { font-size: 30rpx; font-weight: 800; color: #1C1917; display: block; margin-bottom: 20rpx; }
.ar-item { display: flex; justify-content: space-between; align-items: center; padding: 16rpx 0; border-bottom: 1rpx dashed #EAE5DD; }
.ar-item .k { font-size: 26rpx; color: #1C1917; font-weight: 600; }
.ar-item .kd { font-size: 22rpx; color: #A8A29E; }
.ar-item .v { font-size: 28rpx; font-weight: 800; color: #D4572E; }
.ar-total { display: flex; justify-content: space-between; padding: 24rpx 0 8rpx; font-size: 28rpx; font-weight: 800; color: #1C1917; }
.ar-total .v { font-size: 40rpx; color: #D4572E; }
.save-btn { width: 100%; padding: 26rpx; border-radius: 24rpx; border: none; background: #3D8B6E; color: #fff; font-size: 28rpx; font-weight: 800; margin-top: 24rpx; }
</style>
