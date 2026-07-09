# Page Spec: category（分类页）

## 布局结构

1. 顶部固定 category-nav（横向滚动，高度 88rpx）
2. 固定 filter-bar（高度 80rpx，吸顶）
3. 帖子列表
4. 底部安全区占位

## 颜色覆盖

- category-nav 背景：var(--color-background)
- filter-bar 背景：#FFFFFF
- 下拉面板背景：#FFFFFF，阴影 --shadow-md

## 间距

- category-nav 内边距：12rpx 0
- filter-bar 内边距：16rpx 24rpx
- 列表顶部距 filter-bar：16rpx

## 交互

- category-nav 切换时滚动到可视区
- filter-bar 展开面板覆盖下方列表，点击遮罩收起
- 选择筛选条件后列表立即刷新（带 loading）

## 状态

- 无结果：empty-state，图片 200rpx，标题“暂无相关帖子”
