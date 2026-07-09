const api = require('../../utils/api');

Page({
  data: {
    trends: [],
    categories: [],
    maxPostCount: 10,
    maxCategoryCount: 10
  },

  onLoad() {
    this.checkAdmin();
    this.loadStats();
  },

  checkAdmin() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user || user.role !== 'admin') {
      wx.showToast({ title: '无权访问', icon: 'none' });
      wx.navigateBack();
    }
  },

  async loadStats() {
    try {
      const [trends, categories] = await Promise.all([
        api.get('/admin/stats/trends'),
        api.get('/admin/stats/categories')
      ]);

      const maxPostCount = this.computeMax(trends.map(t => t.postCount || 0));
      const maxCategoryCount = this.computeMax(categories.map(c => c.count || 0));

      const enrichedTrends = trends.map(t => ({
        ...t,
        dateLabel: t.date ? t.date.slice(5) : ''
      }));

      this.setData({ trends: enrichedTrends, categories, maxPostCount, maxCategoryCount });
    } catch (e) {
      console.error('load stats failed', e);
    }
  },

  computeMax(values) {
    const max = Math.max(...values, 1);
    return Math.ceil(max / 10) * 10;
  }
});
