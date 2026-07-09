const api = require('../../utils/api');
const { REPORT_REASONS } = require('../../data/constants');
const { formatDate } = require('../../utils/format');

const PAGE_SIZE = 10;
const STATUS_TABS = [
  { id: 'pending', name: '待处理' },
  { id: 'resolved', name: '已处理' }
];

Page({
  data: {
    STATUS_TABS,
    REPORT_REASONS,
    currentStatus: 'pending',
    reports: [],
    page: 1,
    hasMore: true,
    loading: false
  },

  onLoad() {
    this.checkAdmin();
    this.loadReports(true);
  },

  onPullDownRefresh() {
    this.loadReports(true).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadReports(false);
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

  async loadReports(reset = false) {
    if (this.data.loading) return;

    const page = reset ? 1 : this.data.page + 1;
    this.setData({ loading: true });

    try {
      const res = await api.get('/admin/reports', {
        page,
        size: PAGE_SIZE,
        status: this.data.currentStatus
      });

      const posts = wx.getStorageSync('kimi_posts') || [];
      const users = wx.getStorageSync('kimi_users') || [];

      const enriched = res.list.map(r => ({
        ...r,
        post: posts.find(p => p.id === r.postId) || null,
        reporter: users.find(u => u.id === r.reporterId) || null,
        reasonText: (REPORT_REASONS.find(item => item.id === r.reason) || {}).name || r.reason,
        timeText: formatDate(r.createdAt)
      }));

      const reports = reset ? enriched : [...this.data.reports, ...enriched];
      this.setData({
        reports,
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
    this.loadReports(true);
  },

  async handleReport(reportId, action) {
    try {
      await api.put(`/admin/reports/${reportId}/status`, { status: 'resolved' });

      if (action === 'remove') {
        const report = this.data.reports.find(r => r.id === reportId);
        if (report && report.postId) {
          await api.put(`/admin/posts/${report.postId}/status`, { status: 'inactive' });
        }
      }

      wx.showToast({ title: '已处理', icon: 'success' });
      this.loadReports(true);
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' });
    }
  },

  onResolveTap(e) {
    const { reportid } = e.currentTarget.dataset;
    this.handleReport(reportid, 'resolve');
  },

  onRemoveTap(e) {
    const { reportid } = e.currentTarget.dataset;
    wx.showModal({
      title: '确认处理',
      content: '将举报标记为已处理并下架目标帖子？',
      confirmColor: '#DC2626',
      success: (res) => {
        if (res.confirm) {
          this.handleReport(reportid, 'remove');
        }
      }
    });
  }
});
