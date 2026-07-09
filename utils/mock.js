/**
 * Mock 数据初始化
 * 首次启动时将 data/mock/*.json 写入 wx.storage
 */

const storage = require('./storage');

const MOCK_FILES = [
  { key: 'kimi_users', file: 'users.json' },
  { key: 'kimi_posts', file: 'posts.json' },
  { key: 'kimi_messages', file: 'messages.json' },
  { key: 'kimi_reports', file: 'reports.json' },
  { key: 'kimi_categories', file: 'categories.json' },
  { key: 'kimi_tags', file: 'tags.json' },
  { key: 'kimi_search_hot', file: 'search-hot.json' },
  { key: 'kimi_stats', file: 'stats.json' }
];

function loadJson(fileName) {
  try {
    const fs = wx.getFileSystemManager();
    const path = `${wx.env.USER_DATA_PATH}/../../data/mock/${fileName}`;
    const content = fs.readFileSync(path, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.warn(`read ${fileName} failed, fallback to require`, e);
    try {
      return require(`../data/mock/${fileName}`);
    } catch (e2) {
      console.error(`load ${fileName} failed`, e2);
      return [];
    }
  }
}

function initMockData() {
  const inited = storage.get('kimi_inited', false);
  if (inited) {
    return;
  }

  MOCK_FILES.forEach(({ key, file }) => {
    const exists = storage.get(key);
    if (exists && Array.isArray(exists) && exists.length > 0) {
      return;
    }
    const data = loadJson(file);
    storage.set(key, data);
  });

  // 默认登录用户：普通学生 u1001
  const sessionUser = storage.get('kimi_session_user');
  if (!sessionUser) {
    const users = storage.get('kimi_users', []);
    const defaultUser = users.find(u => u.id === 'u1001');
    if (defaultUser) {
      storage.set('kimi_session_user', defaultUser);
      const app = getApp();
      if (app) {
        app.globalData.currentUser = defaultUser;
      }
    }
  }

  // 初始化个人数据
  ensureUserData('u1001');
  ensureUserData('u_admin');

  storage.set('kimi_inited', true);
}

function ensureUserData(userId) {
  const favKey = `kimi_favorites_${userId}`;
  const histKey = `kimi_browsing_history_${userId}`;
  const searchKey = `kimi_search_history_${userId}`;

  if (!storage.get(favKey)) storage.set(favKey, []);
  if (!storage.get(histKey)) storage.set(histKey, []);
  if (!storage.get(searchKey)) storage.set(searchKey, []);
}

function resetMockData() {
  storage.set('kimi_inited', false);
  initMockData();
}

module.exports = {
  initMockData,
  resetMockData,
  ensureUserData
};
