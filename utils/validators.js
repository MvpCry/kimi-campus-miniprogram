/**
 * 表单校验 + 内容合规（敏感词过滤）
 */

const { SENSITIVE_WORDS } = require('../data/constants');

function isEmpty(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function validatePost(post) {
  const errors = [];

  if (isEmpty(post.title)) {
    errors.push('请填写物品标题');
  } else if (post.title.length < 2 || post.title.length > 60) {
    errors.push('标题长度需在 2-60 字之间');
  }

  if (isEmpty(post.description)) {
    errors.push('请填写物品详情');
  } else if (post.description.length > 2000) {
    errors.push('详情长度不能超过 2000 字');
  }

  if (!post.category) {
    errors.push('请选择分类');
  }

  if (!post.campus) {
    errors.push('请选择所在校区');
  }

  if (!post.type) {
    errors.push('请选择帖子类型');
  }

  // 出售类型需填写价格
  if (post.type === 'sell') {
    if (post.price === undefined || post.price === null || post.price === '') {
      errors.push('请填写售价');
    } else if (isNaN(parseFloat(post.price)) || parseFloat(post.price) < 0) {
      errors.push('售价需为有效金额');
    }
  }

  // 违规内容检测
  const sensitive = checkSensitiveWords(`${post.title} ${post.description} ${post.location || ''}`);
  if (sensitive.length > 0) {
    errors.push(`内容包含违规词：${sensitive.join('、')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function checkSensitiveWords(text) {
  if (!text) return [];
  const lowerText = String(text).toLowerCase();
  const found = [];
  SENSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word.toLowerCase()) && !found.includes(word)) {
      found.push(word);
    }
  });
  return found;
}

function validateVerification(data) {
  const errors = [];
  if (isEmpty(data.realName)) errors.push('请填写真实姓名');
  if (isEmpty(data.studentId)) errors.push('请填写学号');
  if (isEmpty(data.campus)) errors.push('请选择校区');
  return { valid: errors.length === 0, errors };
}

function validateReport(data) {
  const errors = [];
  if (!data.reason) errors.push('请选择举报原因');
  if (isEmpty(data.detail)) errors.push('请填写举报说明');
  return { valid: errors.length === 0, errors };
}

function validateMessage(content) {
  if (isEmpty(content)) return { valid: false, error: '请输入消息内容' };
  if (content.length > 500) return { valid: false, error: '消息长度不能超过500字' };
  const sensitive = checkSensitiveWords(content);
  if (sensitive.length > 0) return { valid: false, error: `消息包含违规词：${sensitive.join('、')}` };
  return { valid: true };
}

module.exports = {
  isEmpty,
  validatePost,
  checkSensitiveWords,
  validateVerification,
  validateReport,
  validateMessage
};
