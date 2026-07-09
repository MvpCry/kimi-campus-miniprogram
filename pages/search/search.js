const api = require('../../utils/api');
const storage = require('../../utils/storage');

const HISTORY_KEY_PREFIX = 'kimi_search_history_';
const MAX_HISTORY = 10;
const PAGE_SIZE = 10;

Page({
  data: {
    keyword: '',
    searching: false,
    history: [],
    hotSearch: [],
    posts: [],
    page: 1,
    hasMore: true,
    loading: false,
    searched: false
  },

  onLoad() {
    this.loadHistory();
    this.loadHotSearch();
  },

  onShow() {
    this.loadHistory();
  },

  loadHistory() {
    const user = getApp().globalData.currentUser;
    const userId = user ? user.id : 'guest';
    const history = storage.get(`${HISTORY_KEY_PREFIX}${userId}`, []);
    this.setData({ history });
  },

  async loadHotSearch() {
    try {
      const list = await api.get('/search/hot');
      this.setData({ hotSearch: list || [] });
    } catch (e) {
      console.error('load hot search failed', e);
    }
  },

  saveHistory(keyword) {
    if (!keyword.trim()) return;
    const user = getApp().globalData.currentUser;
    const userId = user ? user.id : 'guest';
    const key = `${HISTORY_KEY_PREFIX}${userId}`;
    let history = storage.get(key, []);
    history = history.filter(k => k !== keyword);
    history.unshift(keyword);
    if (history.length > MAX_HISTORY) {
      history = history.slice(0, MAX_HISTORY);
    }
    storage.set(key, history);
    this.setData({ history });
  },

  clearHistory() {
    const user = getApp().globalData.currentUser;
    const userId = user ? user.id : 'guest';
    storage.set(`${HISTORY_KEY_PREFIX}${userId}`, []);
    this.setData({ history: [] });
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch(e) {
    const keyword = e.detail.value || this.data.keyword;
    if (!keyword.trim()) return;
    this.saveHistory(keyword.trim());
    this.setData({ keyword: keyword.trim(), searched: true, searching: true });
    this.loadPosts(true).finally(() => {
      this.setData({ searching: false });
    });
  },

  onClear() {
    this.setData({
      keyword: '',
      posts: [],
      searched: false,
      hasMore: true
    });
  },

  onHistoryTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword });
    this.onSearch({ detail: { value: keyword } });
  },

  onHotTap(e) {
    const { keyword } = e.currentTarget.dataset;
    this.setData({ keyword });
    this.onSearch({ detail: { value: keyword } });
  },

  async loadPosts(reset = false) {
    if (this.data.loading) return;

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get('/posts', {
        page,
        size: PAGE_SIZE,
        keyword: this.data.keyword,
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

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading && this.data.searched) {
      this.loadPosts(false);
    }
  },

  onPostTap(e) {
    const { post } = e.detail;
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${post.id}` });
  }
});
