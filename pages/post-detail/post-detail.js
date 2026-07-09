const api = require('../../utils/api');
const { formatPrice, formatDate, getCategoryName, getConditionName } = require('../../utils/format');
const { CATEGORIES, CONDITIONS, REPORT_REASONS } = require('../../data/constants');

Page({
  data: {
    postId: '',
    post: null,
    publisher: null,
    isOwner: false,
    isFavorite: false,
    currentImage: 0,
    showReportModal: false,
    reportReasons: REPORT_REASONS,
    selectedReportReason: '',
    reportDetail: ''
  },

  async onLoad(options) {
    const postId = options.postId;
    if (!postId) {
      wx.showToast({ title: '帖子不存在', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }

    this.setData({ postId });
    await this.loadPost(postId);
    this.checkFavorite(postId);
    this.incrementView(postId);
  },

  async loadPost(postId) {
    try {
      const post = await api.get(`/posts/${postId}`);
      const app = getApp();
      const currentUser = app.globalData.currentUser;
      const isOwner = currentUser && post.publisherId === currentUser.id;

      const users = wx.getStorageSync('kimi_users') || [];
      const publisher = users.find(u => u.id === post.publisherId) || null;

      this.setData({
        post,
        publisher,
        isOwner
      });

      this.addToHistory(post);
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  addToHistory(post) {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user || this.data.isOwner) return;

    const key = `kimi_browsing_history_${user.id}`;
    const history = wx.getStorageSync(key) || [];
    const filtered = history.filter(item => item.id !== post.id);
    filtered.unshift({
      ...post,
      viewedAt: new Date().toISOString()
    });
    wx.setStorageSync(key, filtered.slice(0, 100));
  },

  checkFavorite(postId) {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) return;
    const favorites = wx.getStorageSync(`kimi_favorites_${user.id}`) || [];
    this.setData({ isFavorite: favorites.includes(postId) });
  },

  incrementView(postId) {
    const posts = wx.getStorageSync('kimi_posts') || [];
    const index = posts.findIndex(p => p.id === postId);
    if (index !== -1) {
      posts[index].viewCount = (posts[index].viewCount || 0) + 1;
      wx.setStorageSync('kimi_posts', posts);
    }
  },

  onSwiperChange(e) {
    this.setData({ currentImage: e.detail.current });
  },

  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const urls = this.data.post.images || [];
    wx.previewImage({ urls, current: urls[index] });
  },

  async toggleFavorite() {
    const { postId, isFavorite } = this.data;
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${postId}`);
        this.setData({ isFavorite: false });
        wx.showToast({ title: '已取消收藏', icon: 'none' });
      } else {
        await api.post('/favorites', { postId });
        this.setData({ isFavorite: true });
        wx.showToast({ title: '收藏成功', icon: 'none' });
      }
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onMessageTap() {
    const { post, publisher } = this.data;
    if (!publisher) return;
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?postId=${post.id}&receiverId=${publisher.id}`
    });
  },

  onEditTap() {
    const { postId } = this.data;
    wx.navigateTo({ url: `/pages/edit-post/edit-post?postId=${postId}` });
  },

  onDeleteTap() {
    wx.showModal({
      title: '确认删除',
      content: '删除后无法恢复，是否继续？',
      confirmColor: '#DC2626',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.delete(`/posts/${this.data.postId}`);
            wx.showToast({ title: '已删除', icon: 'success' });
            setTimeout(() => wx.navigateBack(), 1500);
          } catch (e) {
            wx.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  },

  onReportTap() {
    this.setData({ showReportModal: true });
  },

  onReportCancel() {
    this.setData({ showReportModal: false });
  },

  selectReportReason(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedReportReason: id });
  },

  onReportDetailInput(e) {
    this.setData({ reportDetail: e.detail.value });
  },

  async submitReport() {
    const { postId, selectedReportReason, reportDetail } = this.data;
    if (!selectedReportReason) {
      wx.showToast({ title: '请选择举报原因', icon: 'none' });
      return;
    }
    if (!reportDetail.trim()) {
      wx.showToast({ title: '请填写举报说明', icon: 'none' });
      return;
    }

    try {
      await api.post('/reports', {
        postId,
        reason: selectedReportReason,
        detail: reportDetail
      });
      this.setData({ showReportModal: false, selectedReportReason: '', reportDetail: '' });
      wx.showToast({ title: '举报已提交', icon: 'success' });
    } catch (e) {
      wx.showToast({ title: '举报失败', icon: 'none' });
    }
  },

  formatPrice,
  formatDate,
  getCategoryName,
  getConditionName,
  CATEGORIES,
  CONDITIONS
});
