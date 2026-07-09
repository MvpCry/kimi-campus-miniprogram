const api = require('../../utils/api');
const { CATEGORIES } = require('../../data/constants');

const PAGE_SIZE = 10;

Page({
  data: {
    categories: CATEGORIES,
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    refreshing: false
  },

  onLoad() {
    this.loadPosts(true);
  },

  onShow() {
    if (this.data.posts.length === 0) {
      this.loadPosts(true);
    }
  },

  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadPosts(true).finally(() => {
      this.setData({ refreshing: false });
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

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get('/posts', {
        page,
        size: PAGE_SIZE,
        sort: 'latest'
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
      console.error('load posts failed', e);
    }
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  onSearchFocus() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  onCategoryChange(e) {
    const { category } = e.detail;
    wx.navigateTo({ url: `/pages/category/category?categoryId=${category.id}` });
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  },

  onCreateTap() {
    wx.navigateTo({ url: '/pages/create-post/create-post' });
  }
});
