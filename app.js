const { initMockData } = require('./utils/mock');

App({
  globalData: {
    systemInfo: null,
    currentUser: null
  },

  onLaunch() {
    console.log('kimi校园 启动');
    this.initSystemInfo();
    initMockData();
    this.loadCurrentUser();
  },

  initSystemInfo() {
    try {
      const info = wx.getSystemInfoSync();
      this.globalData.systemInfo = info;
    } catch (e) {
      console.error('获取系统信息失败', e);
    }
  },

  loadCurrentUser() {
    const user = wx.getStorageSync('kimi_session_user');
    if (user) {
      this.globalData.currentUser = user;
    }
  },

  setCurrentUser(user) {
    this.globalData.currentUser = user;
    wx.setStorageSync('kimi_session_user', user);
  }
});
