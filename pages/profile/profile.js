const api = require('../../utils/api');

Page({
  data: {
    user: null,
    isAdmin: false,
    menuGroups: []
  },

  onShow() {
    this.loadUser();
  },

  async loadUser() {
    try {
      const user = await api.get('/users/me');
      const isAdmin = user.role === 'admin';
      this.setData({
        user,
        isAdmin,
        menuGroups: this.buildMenuGroups(isAdmin)
      });
    } catch (e) {
      console.error('load user failed', e);
    }
  },

  buildMenuGroups(isAdmin) {
    const groups = [
      {
        title: '我的交易',
        items: [
          { icon: 'post', label: '我的发布', url: '/pages/my-posts/my-posts' },
          { icon: 'favorite', label: '我的收藏', url: '/pages/favorites/favorites' },
          { icon: 'history', label: '浏览历史', url: '/pages/history/history' }
        ]
      },
      {
        title: '账户设置',
        items: [
          { icon: 'verify', label: '身份认证', url: '/pages/verification/verification' }
        ]
      }
    ];

    if (isAdmin) {
      groups.push({
        title: '管理后台',
        items: [
          { icon: 'admin', label: '后台管理', url: '/pages/admin/admin' }
        ]
      });
    }

    return groups;
  },

  onMenuTap(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({ url });
  },

  onAvatarTap() {
    // 头像编辑占位
    wx.showToast({ title: '头像功能开发中', icon: 'none' });
  }
});
