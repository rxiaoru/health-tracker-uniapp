<template>
  <view class="page">
    <view class="header"><text class="h-title">📏 体型分析</text></view>
    <view class="content">
      <view class="body-card">
        <text class="bc-head">基本信息</text>
        <view class="bc-row"><text class="bc-l">身高</text><input class="bc-input" type="digit" v-model="height" placeholder="170" /><text class="bc-u">cm</text></view>
        <view class="bc-row"><text class="bc-l">体重</text><input class="bc-input" type="digit" v-model="weight" placeholder="72.0" /><text class="bc-u">kg</text></view>
        <view class="bc-row"><text class="bc-l">年龄</text><input class="bc-input" type="number" v-model="age" placeholder="25" /><text class="bc-u">岁</text></view>
        <view class="bc-row"><text class="bc-l">性别</text><view class="bc-gender"><button class="g-btn" :class="{active: gender==='male'}" @tap="gender='male'">男</button><button class="g-btn" :class="{active: gender==='female'}" @tap="gender='female'">女</button></view></view>
      </view>
      <button class="analyze-btn" @tap="analyzeBody">🔍 分析 BMI</button>
      <view v-if="bmiResult" class="result">
        <text class="r-bmi">BMI: {{ bmiResult.bmi }}</text>
        <text class="r-status" :style="{ color: bmiResult.color }">{{ bmiResult.status }}</text>
        <text class="r-advice">{{ bmiResult.advice }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { saveProfile } from '@/utils/api'

const height = ref('')
const weight = ref('')
const age = ref('')
const gender = ref('male')
const bmiResult = ref<{ bmi: string; status: string; advice: string; color: string } | null>(null)

function analyzeBody() {
  var h = parseFloat(height.value)
  var w = parseFloat(weight.value)
  if (!h || !w) { uni.showToast({ title: '请填身高体重', icon: 'none' }); return }
  var bmi = (w / Math.pow(h / 100, 2)).toFixed(1)
  var status = '', advice = '', color = ''
  var bmiNum = parseFloat(bmi)
  if (bmiNum < 18.5) { status = '偏瘦'; color = '#5B8DB8'; advice = '适当增加优质蛋白和力量训练' }
  else if (bmiNum < 24) { status = '正常'; color = '#3D8B6E'; advice = '保持当前状态，注意体脂率' }
  else if (bmiNum < 28) { status = '偏胖'; color = '#D4572E'; advice = '控制碳水+有氧运动，目标减5-8kg' }
  else { status = '肥胖'; color = '#C93B3B'; advice = '建议制定详细减重计划' }
  bmiResult.value = { bmi, status, advice, color }
  // Save profile
  saveProfile({ height: h, weight: w, age: parseInt(age.value) || 25, gender: gender.value }).catch(console.error)
}
</script>

<style>
.page { min-height: 100vh; background: #FAF8F5; }
.header { padding: 20rpx 32rpx 16rpx; }
.h-title { font-size: 34rpx; font-weight: 800; color: #1C1917; }
.content { padding: 0 32rpx 60rpx; }
.body-card { background: #fff; border: 1rpx solid #EAE5DD; border-radius: 24rpx; padding: 32rpx; margin-bottom: 28rpx; }
.bc-head { font-size: 28rpx; font-weight: 800; color: #1C1917; margin-bottom: 24rpx; display: block; }
.bc-row { display: flex; align-items: center; gap: 20rpx; padding: 16rpx 0; border-bottom: 1rpx solid #F0EDE8; }
.bc-row:last-child { border: none; }
.bc-l { font-size: 26rpx; color: #6B6560; font-weight: 500; width: 72rpx; flex-shrink: 0; }
.bc-input { flex: 1; padding: 16rpx 20rpx; border: 2rpx solid #EAE5DD; border-radius: 16rpx; font-size: 28rpx; background: #FAF8F5; color: #1C1917; text-align: left; }
.bc-u { font-size: 24rpx; color: #A8A29E; font-weight: 500; width: 48rpx; flex-shrink: 0; }
.bc-gender { display: flex; gap: 12rpx; flex: 1; }
.g-btn { flex: 1; padding: 16rpx; border-radius: 16rpx; border: 2rpx solid #EAE5DD; background: #FAF8F5; font-size: 26rpx; font-weight: 600; color: #6B6560; text-align: center; margin: 0; line-height: 1; }
.g-btn::after { border: none; }
.g-btn.active { border-color: #D4572E; color: #D4572E; background: #FDF0EA; }
.analyze-btn { width: 100%; box-sizing: border-box; padding: 26rpx; border-radius: 24rpx; border: none; background: #D4572E; color: #fff; font-size: 30rpx; font-weight: 700; text-align: center; }
.analyze-btn::after { border: none; }
.result { margin-top: 28rpx; padding: 32rpx; background: #fff; border-radius: 24rpx; text-align: center; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.r-bmi { font-size: 56rpx; font-weight: 800; color: #1C1917; display: block; }
.r-status { font-size: 32rpx; font-weight: 800; display: block; margin: 16rpx 0; }
.r-advice { font-size: 26rpx; color: #6B6560; line-height: 1.7; display: block; }
</style>