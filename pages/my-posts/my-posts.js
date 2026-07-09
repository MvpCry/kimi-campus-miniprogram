const api = require('../../utils/api');
const { POST_TYPES } = require('../../data/constants');

const PAGE_SIZE = 10;

Page({
  data: {
    POST_TYPES,
    currentType: 'sell',
    posts: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
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
      const res = await api.get(`/users/${user.id}/posts`, {
        page,
        size: PAGE_SIZE
      });

      let posts = reset ? res.list : [...this.data.posts, ...res.list];
      posts = posts.filter(p => p.type === this.data.currentType);

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

  switchType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ currentType: type });
    this.loadPosts(true);
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  },

  onEditTap(e) {
    const { postId } = e.currentTarget.dataset;
    wx.navigateTo({ url: `/pages/edit-post/edit-post?postId=${postId}` });
  },

  onDeleteTap(e) {
    const { postId } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复',
      confirmColor: '#DC2626',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.delete(`/posts/${postId}`);
            wx.showToast({ title: '已删除', icon: 'success' });
            this.loadPosts(true);
          } catch (err) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  getStatusText(status) {
    const map = {
      active: '进行中',
      sold: '已成交',
      inactive: '已下架',
      pending: '审核中'
    };
    return map[status] || status;
  }
});
