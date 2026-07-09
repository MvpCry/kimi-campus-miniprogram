const api = require('../../utils/api');

const PAGE_SIZE = 10;

Page({
  data: {
    posts: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onShow() {
    this.loadPosts(true);
  },

  onPullDownRefresh() {
    this.loadPosts(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPosts(false);
    }
  },

  async loadPosts(reset = false) {
    if (this.data.loading) return;

    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get(`/users/${user.id}/favorites`, {
        page,
        size: PAGE_SIZE
      });

      const posts = reset ? res.list : [...this.data.posts, ...res.list];
      this.setData({
        posts,
        page,
        hasMore: res.hasMore,
        loading: false
      });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  }
});
