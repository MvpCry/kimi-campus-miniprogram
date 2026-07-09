const api = require('../../utils/api');
const { validateMessage } = require('../../utils/validators');
const { formatTimeAgo } = require('../../utils/format');

Page({
  data: {
    postId: '',
    receiverId: '',
    post: null,
    receiver: null,
    messages: [],
    inputValue: '',
    sending: false,
    scrollIntoView: ''
  },

  async onLoad(options) {
    const { postId, receiverId } = options;
    if (!postId || !receiverId) {
      wx.showToast({ title: '参数错误', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ postId, receiverId });
    await this.loadPost(postId);
    await this.loadMessages();
    this.markMessagesRead();
  },

  async loadPost(postId) {
    try {
      const post = await api.get(`/posts/${postId}`);
      const users = wx.getStorageSync('kimi_users') || [];
      const receiver = users.find(u => u.id === this.data.receiverId) || null;
      this.setData({ post, receiver });
    } catch (e) {
      console.error('load post failed', e);
    }
  },

  async loadMessages() {
    try {
      const messages = await api.get('/messages', {
        postId: this.data.postId,
        otherUserId: this.data.receiverId
      });

      const app = getApp();
      const currentUserId = app.globalData.currentUser ? app.globalData.currentUser.id : '';

      const enriched = messages.map(m => ({
        ...m,
        isSelf: m.senderId === currentUserId,
        timeText: formatTimeAgo(m.createdAt)
      }));

      this.setData({ messages: enriched });
      this.scrollToBottom();
    } catch (e) {
      console.error('load messages failed', e);
    }
  },

  markMessagesRead() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) return;

    const allMessages = wx.getStorageSync('kimi_messages') || [];
    let changed = false;
    allMessages.forEach(m => {
      if (m.postId === this.data.postId && m.receiverId === user.id && m.senderId === this.data.receiverId && !m.read) {
        m.read = true;
        changed = true;
      }
    });
    if (changed) {
      wx.setStorageSync('kimi_messages', allMessages);
    }
  },

  onInput(e) {
    this.setData({ inputValue: e.detail.value });
  },

  async sendMessage() {
    const content = this.data.inputValue.trim();
    const { valid, error } = validateMessage(content);
    if (!valid) {
      wx.showToast({ title: error, icon: 'none' });
      return;
    }

    if (this.data.sending) return;
    this.setData({ sending: true });

    try {
      await api.post('/messages', {
        postId: this.data.postId,
        receiverId: this.data.receiverId,
        content
      });

      this.setData({ inputValue: '' });
      await this.loadMessages();
    } catch (e) {
      wx.showToast({ title: '发送失败', icon: 'none' });
    } finally {
      this.setData({ sending: false });
    }
  },

  scrollToBottom() {
    const messages = this.data.messages;
    if (messages.length === 0) return;
    const lastId = `msg-${messages[messages.length - 1].id}`;
    this.setData({ scrollIntoView: lastId });
  },

  onPostTap() {
    wx.navigateTo({ url: `/pages/post-detail/post-detail?postId=${this.data.postId}` });
  }
});
