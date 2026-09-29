# 健康手账 - 微信小程序

体重与饮食追踪小程序

## 开发

```bash
npm install
npm run dev:mp-weixin
```

用微信开发者工具打开 `dist/dev/mp-weixin` 目录

## 发布

1. 在微信开发者工具中点击「上传」
2. 在 mp.weixin.qq.com 提交审核
3. 审核通过后发布

## 环境变量

在 Supabase Dashboard 中已创建：
- weight_records (体重记录)
- meal_records (饮食记录)
- journal_events (日记事件)
- users (用户)
