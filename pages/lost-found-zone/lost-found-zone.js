const api = require('../../utils/api');

const PAGE_SIZE = 10;
const SUB_TYPES = [
  { id: 'lost', name: '寻物' },
  { id: 'found', name: '招领' }
];

Page({
  data: {
    SUB_TYPES,
    currentSubType: 'lost',
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

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get('/posts', {
        page,
        size: PAGE_SIZE,
        type: 'lost-found',
        subType: this.data.currentSubType,
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
    }
  },

  switchSubType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ currentSubType: type });
    this.loadPosts(true);
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  }
});
