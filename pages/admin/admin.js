const api = require('../../utils/api');

Page({
  data: {
    isAdmin: false,
    summary: {
      userCount: 0,
      postCount: 0,
      reportCount: 0,
      pendingReportCount: 0
    },
    menuItems: [
      { icon: 'users', label: '用户管理', url: '/pages/admin-users/admin-users' },
      { icon: 'posts', label: '帖子管理', url: '/pages/admin-posts/admin-posts' },
      { icon: 'reports', label: '举报处理', url: '/pages/admin-reports/admin-reports' },
      { icon: 'stats', label: '数据统计', url: '/pages/admin-stats/admin-stats' }
    ]
  },

  async onShow() {
    const app = getApp();
    const user = app.globalData.currentUser;

    if (!user || user.role !== 'admin') {
      this.setData({ isAdmin: false });
      wx.showToast({ title: '无权访问', icon: 'none' });
      setTimeout(() => wx.switchTab({ url: '/pages/profile/profile' }), 1500);
      return;
    }

    this.setData({ isAdmin: true });
    await this.loadSummary();
  },

  async loadSummary() {
    try {
      const summary = await api.get('/admin/stats/summary');
      this.setData({ summary });
    } catch (e) {
      console.error('load summary failed', e);
    }
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  }
});
