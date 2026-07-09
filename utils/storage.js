/**
 * Storage 封装：统一操作 wx.storage，所有数据键前缀 kimi_
 */

const get = (key, defaultValue = null) => {
  try {
    const value = wx.getStorageSync(key);
    return value !== undefined && value !== '' ? value : defaultValue;
  } catch (e) {
    console.error(`storage get ${key} failed`, e);
    return defaultValue;
  }
};

const set = (key, value) => {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (e) {
    console.error(`storage set ${key} failed`, e);
    return false;
  }
};

const remove = (key) => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error(`storage remove ${key} failed`, e);
    return false;
  }
};

const clear = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('storage clear failed', e);
    return false;
  }
};

module.exports = {
  get,
  set,
  remove,
  clear
};
