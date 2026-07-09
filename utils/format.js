/**
 * 格式化工具：时间、价格、校区、数量等
 */

function formatPrice(price, originalPrice = null) {
  if (price === null || price === undefined || price === '') {
    return '';
  }
  const num = parseFloat(price);
  if (isNaN(num)) return '';

  const priceText = num === 0 ? '免费送' : `¥${num.toFixed(num % 1 === 0 ? 0 : 2)}`;

  if (originalPrice !== null && originalPrice !== undefined && originalPrice > 0) {
    const orig = parseFloat(originalPrice);
    return `${priceText} · 原价¥${orig.toFixed(orig % 1 === 0 ? 0 : 2)}`;
  }
  return priceText;
}

function formatShortPrice(price) {
  if (price === null || price === undefined || price === '') return '';
  const num = parseFloat(price);
  if (isNaN(num)) return '';
  return num === 0 ? '免费送' : `¥${num.toFixed(num % 1 === 0 ? 0 : 2)}`;
}

function formatTimeAgo(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diff = now - date;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) return '刚刚';
  if (diff < hour) return `${Math.floor(diff / minute)}分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)}小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)}天前`;

  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d}`;
}

function formatDate(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const h = date.getHours();
  const min = date.getMinutes();
  return `${y}-${m < 10 ? '0' + m : m}-${d < 10 ? '0' + d : d} ${h < 10 ? '0' + h : h}:${min < 10 ? '0' + min : min}`;
}

function formatCount(count) {
  const n = parseInt(count, 10);
  if (isNaN(n)) return '0';
  if (n < 1000) return String(n);
  if (n < 10000) return `${(n / 1000).toFixed(1)}k`;
  return `${(n / 10000).toFixed(1)}w`;
}

function getCategoryName(categories, categoryId) {
  if (!categories || !categoryId) return '';
  const cat = categories.find(c => c.id === categoryId);
  return cat ? cat.name : categoryId;
}

function getConditionName(conditions, conditionId) {
  if (!conditions || !conditionId) return '';
  const c = conditions.find(item => item.id === conditionId);
  return c ? c.name : conditionId;
}

function getTagColor(tags, tagName) {
  if (!tags || !tagName) return '#64748B';
  const tag = tags.find(t => t.name === tagName);
  return tag ? tag.color : '#64748B';
}

module.exports = {
  formatPrice,
  formatShortPrice,
  formatTimeAgo,
  formatDate,
  formatCount,
  getCategoryName,
  getConditionName,
  getTagColor
};
