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
      <view class="m-sec">
        <text class="m-label">拍照识别（可选）</text>
        <view class="pu" @tap="choosePhoto">
          <text class="pu-icon">📷</text>
          <text class="pu-text">拍照或从相册选择</text>
          <text class="pu-sub">选照片后填入 API Key 即可 AI 识别</text>
        </view>
        <image v-if="photoUrl" :src="photoUrl" class="pp" mode="widthFix" />
      </view>
      <view class="m-sec" v-if="photos.length > 0">
        <text class="m-label">🔑 API Key</text>
        <input type="text" class="m-key-input" v-model="apiKey" placeholder="sk-..." />
        <view class="meal-picker" style="margin-top:12rpx">
          <view v-for="p in providers" :key="p.value" class="mp" :class="{ active: provider === p.value }" @tap="provider = p.value">
            <text>{{ p.label }}</text>
          </view>
        </view>
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
        <button class="copy-btn" @tap="copyToAI">💬 发给AI</button>
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
const photos = ref([])
const photoUrl = ref('')
const apiKey = ref('')
const provider = ref('zai')
const providers = [
  { label: '智谱AI', value: 'zai' },
  { label: 'DeepSeek', value: 'deepseek' },
  { label: 'OpenAI', value: 'openai' },
  { label: '通义千问', value: 'qwen' }
]

function choosePhoto() {
  uni.chooseImage({
    count: 3,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: function(res) {
      photos.value = []
      var loaded = 0
      res.tempFilePaths.forEach(function(path, i) {
        // #ifdef H5
        var r = new FileReader()
        r.onload = function(e) {
          photos.value.push(e.target.result)
          if (i === 0) photoUrl.value = e.target.result
          loaded++
          if (loaded === res.tempFilePaths.length) showToast(res.tempFilePaths.length + ' 张已选')
        }
        r.readAsDataURL(path)
        // #endif
        // #ifdef MP-WEIXIN
        var fs = uni.getFileSystemManager()
        fs.readFile({
          filePath: path,
          encoding: 'base64',
          success: function(data) {
            var base64 = 'data:image/jpeg;base64,' + data.data
            photos.value.push(base64)
            if (i === 0) photoUrl.value = base64
            loaded++
            if (loaded === res.tempFilePaths.length) uni.showToast({ title: res.tempFilePaths.length + ' 张已选', icon: 'none' })
          }
        })
        // #endif
      })
    }
  })
}
const foodText = ref('')
const analyzing = ref(false)
const result = ref<{ items: FoodItem[]; total: number } | null>(null)

function analyze() {
  if (!foodText.value.trim() && photos.value.length === 0) {
    uni.showToast({ title: '请输入食物或拍照', icon: 'none' })
    return
  }
  analyzing.value = true

  if (photos.value.length > 0 && apiKey.value) {
    // AI vision analysis
    var selectedProvider = provider.value
    var apiUrl, model
    if (selectedProvider === 'zai') { apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'; model = 'glm-4v' }
    else if (selectedProvider === 'qwen') { apiUrl = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'; model = 'qwen-vl-plus' }
    else { apiUrl = 'https://api.openai.com/v1/chat/completions'; model = 'gpt-4o-mini' }

    var msgContent = [{ type: 'text', text: '识别图片中的所有食物。用中文回复，每行一个：食物名(分量) 热量kcal。只列食物。' }]
    photos.value.forEach(function(p) { msgContent.push({ type: 'image_url', image_url: { url: p } }) })

    uni.request({
      url: apiUrl,
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + apiKey.value },
      data: { model: model, messages: [{ role: 'user', content: msgContent }], max_tokens: 600 },
      timeout: 30000,
      success: function(res) {
        analyzing.value = false
        if (res.statusCode === 200 && res.data.choices) {
          var aiText = res.data.choices[0].message.content || ''
          var r = analyzeFoodText(aiText || foodText.value || '食物')
          r.items.forEach(function(item) { item.portion = item.portion === '估算' ? 'AI识别' : item.portion })
          result.value = r
        } else {
          uni.showToast({ title: 'AI识别失败(' + res.statusCode + ')', icon: 'none' })
          if (foodText.value.trim()) result.value = analyzeFoodText(foodText.value)
        }
      },
      fail: function(err) {
        analyzing.value = false
        uni.showToast({ title: '网络错误', icon: 'none' })
        if (foodText.value.trim()) result.value = analyzeFoodText(foodText.value)
      }
    })
  } else if (photos.value.length > 0 && !apiKey.value) {
    // Photo without key - prompt
    analyzing.value = false
    uni.showModal({
      title: '需要 API Key',
      content: 'AI 识图需要 API Key。填入 Key 后可自动识别，或点击下方"复制发给AI"让我帮你分析。',
      showCancel: false,
      confirmText: '知道了'
    })
    result.value = { items: [{ name: '📷 已拍照', portion: '等待分析', kcal: 0 }], total: 0 }
  } else {
    // Text only
    setTimeout(function() {
      result.value = analyzeFoodText(foodText.value)
      analyzing.value = false
    }, 300)
  }
}

function copyToAI() {
  var now = new Date()
  var y = now.getFullYear()
  var m = String(now.getMonth() + 1).padStart(2, '0')
  var d = String(now.getDate()).padStart(2, '0')
  var t = '请帮我识别今天(' + y + '-' + m + '-' + d + ')' + selMeal.value + '吃了什么，并估算热量。我拍了照片，请列出每种食物、分量和热量。'
  uni.setClipboardData({ data: t })
  uni.showToast({ title: '已复制，去粘贴给AI' })
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
.mp { flex: 1; padding: 20rpx 8rpx 16rpx; border-radius: 20rpx; border: 2rpx solid #EAE5DD; background: #fff; font-size: 22rpx; font-weight: 600; color: #6B6560; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8rpx; }
.mp-i { font-size: 32rpx; display: block; }
.mp.active { border-color: #D4572E; color: #D4572E; background: #FDF0EA; }
.m-input, .m-key-input { width: 100%; box-sizing: border-box; padding: 24rpx; border-radius: 20rpx; border: 2rpx solid #EAE5DD; font-size: 28rpx; background: #fff; color: #1C1917; }
.m-key-input { min-height: auto; padding: 20rpx 24rpx; font-size: 26rpx; }
.pu { border: 3rpx dashed #EAE5DD; border-radius: 24rpx; padding: 40rpx; text-align: center; background: #fff; }
.pu:active { border-color: #D4572E; background: #FDF0EA; }
.pu-icon { font-size: 60rpx; display: block; margin-bottom: 12rpx; }
.pu-text { font-size: 28rpx; font-weight: 700; color: #1C1917; display: block; }
.pu-sub { font-size: 22rpx; color: #A8A29E; margin-top: 8rpx; display: block; }
.pp { width: 100%; border-radius: 20rpx; margin-top: 16rpx; border: 2rpx solid #EAE5DD; }
.m-btn { width: 100%; box-sizing: border-box; padding: 26rpx; border-radius: 24rpx; border: none; background: #D4572E; color: #fff; font-size: 30rpx; font-weight: 700; margin-top: 8rpx; text-align: center; }
.m-btn::after { border: none; }
.result { margin-top: 28rpx; padding: 28rpx; background: #fff; border-radius: 24rpx; box-shadow: 0 2rpx 12rpx rgba(28,25,23,0.04); }
.ar-title { font-size: 28rpx; font-weight: 800; color: #1C1917; display: block; margin-bottom: 16rpx; }
.ar-item { display: flex; justify-content: space-between; align-items: center; padding: 14rpx 0; border-bottom: 1rpx solid #F0EDE8; }
.ar-item .k { font-size: 26rpx; color: #1C1917; font-weight: 500; }
.ar-item .kd { font-size: 22rpx; color: #A8A29E; margin-left: 8rpx; }
.ar-item .v { font-size: 26rpx; font-weight: 700; color: #D4572E; }
.ar-total { display: flex; justify-content: space-between; align-items: center; padding: 20rpx 0 8rpx; font-size: 26rpx; font-weight: 700; color: #1C1917; }
.ar-total .v { font-size: 36rpx; color: #D4572E; font-weight: 800; }
.copy-btn { width: 100%; box-sizing: border-box; padding: 22rpx; border-radius: 24rpx; border: 2rpx solid #EAE5DD; background: #fff; color: #6B6560; font-size: 26rpx; font-weight: 700; margin-top: 20rpx; text-align: center; }
.copy-btn::after { border: none; }
.save-btn { width: 100%; box-sizing: border-box; padding: 24rpx; border-radius: 24rpx; border: none; background: #3D8B6E; color: #fff; font-size: 28rpx; font-weight: 700; margin-top: 16rpx; text-align: center; }
.save-btn::after { border: none; }
</style>