# Page Spec: create-post / edit-post（发布/编辑）

## 布局结构

1. 类型选择器（4个胶囊选项，横向均分）
2. 表单分组：
   - 标题输入
   - 描述 textarea
   - 分类 picker
   - 标签选择（多选 chip）
   - 价格/预算输入
   - 成色 picker
   - 校区 picker
   - 位置输入
3. media-uploader
4. 提交按钮（固定底部或表单末尾）

## 颜色覆盖

- 类型选中：--color-primary 背景，白色文字
- 标签选中：--color-primary 背景，白色文字
- 未选中：--color-muted

## 间距

- 表单项间距：24rpx
- 输入框高度：88rpx
- textarea 最小高度：200rpx
- 底部按钮距内容：48rpx

## 交互

- 切换类型时动态显示价格/成色字段
- 表单失焦校验，提交前全局校验
- 提交按钮 loading 态禁用

## 字段显隐规则

| 类型 | 价格 | 成色 | 预算 |
|------|------|------|------|
| sell | ✓ | ✓ | - |
| wanted | - | - | ✓ |
| lost-found | - | - | - |
| barter | - | ✓ | - |
