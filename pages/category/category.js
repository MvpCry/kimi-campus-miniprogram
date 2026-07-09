const api = require('../../utils/api');
const { CATEGORIES, CONDITIONS, CAMPUSES } = require('../../data/constants');

const PAGE_SIZE = 10;

Page({
  data: {
    categories: CATEGORIES,
    activeCategoryId: '',
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
        { id: 'price_asc', name: '价格最低' },
        { id: 'price_desc', name: '价格最高' },
        { id: 'hot', name: '最多浏览' }
      ],
      campus: CAMPUSES.map(c => ({ id: c, name: c })),
      condition: CONDITIONS.map(c => ({ id: c.id, name: c.name })),
      showPrice: true
    },
    posts: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad(options) {
    const categoryId = options.categoryId || CATEGORIES[0].id;
    this.setData({ activeCategoryId: categoryId });
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
    const { activeCategoryId, filters } = this.data;

    this.setData({ loading: true });

    try {
      const params = {
        page,
        size: PAGE_SIZE,
        category: activeCategoryId,
        sort: filters.sort,
        campus: filters.campus,
        condition: filters.condition,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice
      };

      const res = await api.get('/posts', params);
      const posts = reset ? res.list : [...this.data.posts, ...res.list];

      this.setData({
        posts,
        page,
        hasMore: res.hasMore,
        loading: false
      });
    } catch (e) {
      this.setData({ loading: false });
      console.error('load category posts failed', e);
    }
  },

  onCategoryChange(e) {
    const { category } = e.detail;
    this.setData({ activeCategoryId: category.id });
    this.loadPosts(true);
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
