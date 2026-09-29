#!/bin/bash
echo "🔨 Building WeChat Mini Program..."
sh node_modules/.bin/uni build -p mp-weixin
echo "✅ Build complete! Open dist/build/mp-weixin in WeChat Devtools"
echo "👀 Watching for changes..."
sh node_modules/.bin/uni -p mp-weixin --watch
