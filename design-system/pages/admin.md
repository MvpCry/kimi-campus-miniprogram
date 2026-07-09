# Page Spec: admin（后台管理）

## 布局结构

1. 顶部概览卡片网格（2x2）
2. 快捷入口列表（图标 + 文字 + 箭头）
3. 退出管理入口

## 颜色覆盖

- 概览卡片背景：#FFFFFF
- 数字颜色：var(--color-primary)
- 入口 hover 背景：var(--color-muted)

## 间距

- 概览卡片网格间距：16rpx
- 卡片内边距：24rpx
- 快捷入口高度：104rpx

## 权限

- 仅 role === 'admin' 可访问
- 非管理员进入时显示空状态并 2s 后返回

## 子页面

- admin-users：用户列表
- admin-posts：帖子审核/管理
- admin-reports：举报处理
- admin-stats：数据统计图表
