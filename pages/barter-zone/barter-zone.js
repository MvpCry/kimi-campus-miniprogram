const api = require('../../utils/api');
const { CONDITIONS, CAMPUSES } = require('../../data/constants');

const PAGE_SIZE = 10;

Page({
  data: {
    filters: {
      sort: 'latest',
      campus: '',
      condition: '',
      minPrice: '',
      maxPrice: ''
    },
    filterOptions: {
      sort: [
        { id: 'latest', name: '最新发布' },
        { id: 'hot', name: '最多浏览' }
      ],
      campus: CAMPUSES.map(c => ({ id: c, name: c })),
      condition: CONDITIONS.map(c => ({ id: c.id, name: c.name })),
      showPrice: false
    },
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
    const { filters } = this.data;

    this.setData({ loading: true });

    try {
      const res = await api.get('/posts', {
        page,
        size: PAGE_SIZE,
        type: 'barter',
        sort: filters.sort,
        campus: filters.campus,
        condition: filters.condition
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

  onFilterChange(e) {
    const { filters } = e.detail;
    this.setData({ filters });
    this.loadPosts(true);
  },

  onFilterReset() {
    this.setData({
      filters: {
        sort: 'latest',
        campus: '',
        condition: '',
        minPrice: '',
        maxPrice: ''
      }
    }, () => {
      this.loadPosts(true);
    });
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  }
});
