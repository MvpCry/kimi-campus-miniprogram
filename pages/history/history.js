const storage = require('../../utils/storage');
const { formatDate } = require('../../utils/format');

Page({
  data: {
    groupedHistory: [],
    hasHistory: false
  },

  onShow() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.loadHistory();
    wx.stopPullDownRefresh();
  },

  loadHistory() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) {
      this.setData({ groupedHistory: [], hasHistory: false });
      return;
    }

    const history = storage.get(`kimi_browsing_history_${user.id}`, []);
    const grouped = this.groupByDate(history);
    this.setData({ groupedHistory: grouped, hasHistory: history.length > 0 });
  },

  groupByDate(history) {
    const map = {};
    history.forEach(item => {
      const date = formatDate(item.viewedAt).split(' ')[0];
      if (!map[date]) map[date] = [];
      map[date].push(item);
    });

    return Object.keys(map).sort((a, b) => b.localeCompare(a)).map(date => ({
      date,
      posts: map[date]
    }));
  },

  clearHistory() {
    wx.showModal({
      title: '清空历史',
      content: '确定清空所有浏览历史？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          const user = app.globalData.currentUser;
          if (user) {
            storage.set(`kimi_browsing_history_${user.id}`, []);
            this.setData({ groupedHistory: [], hasHistory: false });
          }
        }
      }
    });
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  }
});
