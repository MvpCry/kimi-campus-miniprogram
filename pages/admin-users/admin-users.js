const api = require('../../utils/api');

const PAGE_SIZE = 20;

Page({
  data: {
    users: [],
    page: 1,
    hasMore: true,
    loading: false,
    keyword: ''
  },

  onLoad() {
    this.checkAdmin();
    this.loadUsers(true);
  },

  onPullDownRefresh() {
    this.loadUsers(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadUsers(false);
    }
  },

  checkAdmin() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user || user.role !== 'admin') {
      wx.showToast({ title: '无权访问', icon: 'none' });
      wx.navigateBack();
    }
  },

  async loadUsers(reset = false) {
    if (this.data.loading) return;

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get('/admin/users', {
        page,
        size: PAGE_SIZE
      });

      let users = reset ? res.list : [...this.data.users, ...res.list];
      if (this.data.keyword) {
        const kw = this.data.keyword.toLowerCase();
        users = users.filter(u =>
          (u.nickname && u.nickname.toLowerCase().includes(kw)) ||
          (u.studentId && u.studentId.toLowerCase().includes(kw))
        );
      }

      this.setData({
        users,
        page,
        hasMore: res.hasMore,
        loading: false
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onSearchInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    this.loadUsers(true);
  },

  onMuteTap(e) {
    const { userid } = e.currentTarget.dataset;
    wx.showActionSheet({
      itemList: ['禁言1天', '禁言7天', '禁言30天', '取消禁言'],
      success: async (res) => {
        const days = [1, 7, 30, 0][res.tapIndex];
        const mutedUntil = days > 0
          ? new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
          : null;

        try {
          await api.put(`/admin/users/${userid}/mute`, { mutedUntil });
          wx.showToast({ title: '操作成功', icon: 'success' });
          this.loadUsers(true);
        } catch (err) {
          wx.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    });
  }
});
