const api = require('../../utils/api');
const { formatTimeAgo } = require('../../utils/format');

Page({
  data: {
    conversations: [],
    loading: false
  },

  onShow() {
    this.loadConversations();
  },

  onPullDownRefresh() {
    this.loadConversations().finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  async loadConversations() {
    this.setData({ loading: true });
    try {
      const conversations = await api.get('/conversations');
      const users = wx.getStorageSync('kimi_users') || [];

      const enriched = conversations.map(c => {
        const otherUser = users.find(u => u.id === c.otherUserId) || {};
        return {
          ...c,
          otherUser,
          timeText: formatTimeAgo(c.lastMessage.createdAt)
        };
      });

      this.setData({ conversations: enriched, loading: false });
    } catch (e) {
      this.setData({ loading: false });
    }
  },

  onConversationTap(e) {
    const { conversation } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?postId=${conversation.postId}&receiverId=${conversation.otherUserId}`
    });
  }
});
