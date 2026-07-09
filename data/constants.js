/**
 * 全局常量：分类、标签、成色、校区、举报原因等
 */

const CATEGORIES = [
  { id: 'digital', name: '数码电子', icon: 'icon-digital', sort: 1 },
  { id: 'books', name: '书籍教材', icon: 'icon-books', sort: 2 },
  { id: 'dorm', name: '宿舍用品', icon: 'icon-dorm', sort: 3 },
  { id: 'beauty', name: '美妆服饰', icon: 'icon-beauty', sort: 4 },
  { id: 'sports', name: '运动器材', icon: 'icon-sports', sort: 5 },
  { id: 'ebike', name: '电动车', icon: 'icon-ebike', sort: 6 },
  { id: 'exam', name: '考研资料', icon: 'icon-exam', sort: 7 }
];

const POST_TAGS = [
  { id: 'urgent', name: '急出', color: '#DC2626' },
  { id: 'negotiable', name: '可小刀', color: '#7C3AED' },
  { id: 'graduation', name: '毕业清仓', color: '#16A34A' },
  { id: 'bargain', name: '可议价', color: '#2563EB' },
  { id: 'casual', name: '随缘出', color: '#64748B' }
];

const CONDITIONS = [
  { id: 'new', name: '全新', level: 5 },
  { id: 'like-new', name: '几乎全新', level: 4 },
  { id: 'good', name: '轻微使用', level: 3 },
  { id: 'fair', name: '明显使用', level: 2 },
  { id: 'old', name: '旧但可用', level: 1 }
];

const CAMPUSES = ['本部', '南校区', '北校区', '东校区'];

const POST_TYPES = [
  { id: 'sell', name: '二手出售', icon: 'sell' },
  { id: 'wanted', name: '求购', icon: 'wanted' },
  { id: 'lost-found', name: '失物招领', icon: 'lost' },
  { id: 'barter', name: '以物换物', icon: 'barter' }
];

const REPORT_REASONS = [
  { id: 'ad', name: '广告/导流' },
  { id: 'false', name: '虚假信息' },
  { id: 'harass', name: '骚扰私信' },
  { id: 'illegal', name: '违规物品' },
  { id: 'part-time', name: '兼职/贷款' },
  { id: 'other', name: '其他' }
];

const SENSITIVE_WORDS = [
  '兼职', '贷款', '校园贷', '裸贷', '刷单', '返利', '代理',
  '加微信', '加qq', '加Q', '微信号', 'QQ号', 'qq号',
  '枪支', '刀具', '管制', '毒品', '迷药', '假证', '代考',
  '论文代写', '代写', '作弊', '外挂', '翻墙', 'vpn'
];

const ADMIN_USER_ID = 'admin_001';

module.exports = {
  CATEGORIES,
  POST_TAGS,
  CONDITIONS,
  CAMPUSES,
  POST_TYPES,
  REPORT_REASONS,
  SENSITIVE_WORDS,
  ADMIN_USER_ID
};
