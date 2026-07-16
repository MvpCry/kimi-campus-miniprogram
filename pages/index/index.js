const api = require('../../utils/api');
const { CATEGORIES } = require('../../data/constants');

const PAGE_SIZE = 10;

const FILTER_TABS = [
  { id: 'recommend', name: '推荐' },
  { id: 'digital', name: '数码' },
  { id: 'books', name: '书籍' },
  { id: 'dorm', name: '宿舍' },
  { id: 'beauty', name: '美妆' },
  { id: 'sports', name: '运动' },
  { id: 'ebike', name: '电动车' },
  { id: 'exam', name: '考研' }
];

const FEATURE_CARDS = [
  { id: 'earn', name: '赚钱情报', desc: '月赚¥500+', color: '#DC2626', icon: '¥' },
  { id: 'rank', name: '校园榜单', desc: '热销好物', color: '#7C3AED', icon: '榜' },
  { id: 'subsidy', name: '限时补贴', desc: '官方券', color: '#16A34A', icon: '补' },
  { id: 'cashback', name: '以物换物', desc: '0元换', color: '#2563EB', icon: '换' }
];

Page({
  data: {
    banner: {
      title: 'kimi校园认证',
      subtitle: '实名认证 · 校园面交 · 严选好物'
    },
    filterTabs: FILTER_TABS,
    activeFilterTab: 'recommend',
    categories: CATEGORIES,
    featureCards: FEATURE_CARDS,
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
      const params = {
        page,
        size: PAGE_SIZE,
        sort: 'latest'
      };
      const activeTab = this.data.activeFilterTab;
      if (activeTab !== 'recommend') {
        params.category = activeTab;
      }

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
      console.error('load posts failed', e);
    }
  },

  onBannerTap() {
    wx.navigateTo({ url: '/pages/verification/verification' });
  },

  onSearchTap() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  onSearchFocus() {
    wx.navigateTo({ url: '/pages/search/search' });
  },

  onCameraTap() {
    wx.showToast({ title: '拍照搜索开发中', icon: 'none' });
  },

  onFilterTabChange(e) {
    const { id } = e.currentTarget.dataset;
    if (id === this.data.activeFilterTab) return;
    this.setData({ activeFilterTab: id }, () => {
      this.loadPosts(true);
    });
  },

  onCategoryChange(e) {
    const { category } = e.detail;
    wx.navigateTo({ url: `/pages/category/category?categoryId=${category.id}` });
  },

  onFeatureCardTap(e) {
    const { id } = e.currentTarget.dataset;
    const urls = {
      earn: '/pages/wanted-zone/wanted-zone',
      rank: '/pages/category/category',
      subsidy: '/pages/favorites/favorites',
      cashback: '/pages/barter-zone/barter-zone'
    };
    wx.navigateTo({ url: urls[id] || '/pages/category/category' });
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  },

  onCreateTap() {
    wx.navigateTo({ url: '/pages/create-post/create-post' });
  }
});
