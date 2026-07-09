const api = require('../../utils/api');

const PAGE_SIZE = 10;
const STATUS_TABS = [
  { id: '', name: '全部' },
  { id: 'active', name: '已上架' },
  { id: 'pending', name: '待审核' },
  { id: 'inactive', name: '已下架' }
];

Page({
  data: {
    STATUS_TABS,
    currentStatus: '',
    posts: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.checkAdmin();
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

  checkAdmin() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user || user.role !== 'admin') {
      wx.showToast({ title: '无权访问', icon: 'none' });
      wx.navigateBack();
    }
  },

  async loadPosts(reset = false) {
    if (this.data.loading) return;

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const params = { page, size: PAGE_SIZE };
      if (this.data.currentStatus) {
        params.status = this.data.currentStatus;
      }

      const res = await api.get('/admin/posts', params);
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

  switchStatus(e) {
    const { status } = e.currentTarget.dataset;
    this.setData({ currentStatus: status });
    this.loadPosts(true);
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  },

  async updateStatus(postId, status) {
    try {
      await api.put(`/admin/posts/${postId}/status`, { status });
      wx.showToast({ title: '操作成功', icon: 'success' });
      this.loadPosts(true);
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onApproveTap(e) {
    const { postid } = e.currentTarget.dataset;
    this.updateStatus(postid, 'active');
  },

  onRejectTap(e) {
    const { postid } = e.currentTarget.dataset;
    this.updateStatus(postid, 'inactive');
  }
});
