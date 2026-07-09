const api = require('../../utils/api');
const { validateVerification } = require('../../utils/validators');
const { CAMPUSES } = require('../../data/constants');

Page({
  data: {
    CAMPUSES,
    user: null,
    form: {
      realName: '',
      studentId: '',
      campus: '',
      dorm: ''
    },
    mediaFiles: [],
    submitted: false,
    submitting: false
  },

  onShow() {
    this.loadUser();
  },

  loadUser() {
    const app = getApp();
    const user = app.globalData.currentUser;
    if (!user) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      return;
    }

    this.setData({
      user,
      submitted: user.verifiedStatus === 'pending' || user.verifiedStatus === 'approved',
      form: {
        realName: user.realName || '',
        studentId: user.studentId || '',
        campus: user.campus || CAMPUSES[0],
        dorm: user.dorm || ''
      }
    });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCampusChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({ 'form.campus': CAMPUSES[index] });
  },

  onMediaChange(e) {
    const { files } = e.detail;
    const mediaFiles = files.map(f => ({ url: f.url, type: f.type || 'image' }));
    this.setData({ mediaFiles });
  },

  async submit() {
    if (this.data.submitting || this.data.submitted) return;

    const { valid, errors } = validateVerification(this.data.form);
    if (!valid) {
      wx.showToast({ title: errors[0], icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      await api.post('/verification', this.data.form);

      const app = getApp();
      const user = { ...app.globalData.currentUser, verifiedStatus: 'pending' };
      app.setCurrentUser(user);

      this.setData({ submitted: true, submitting: false });
      wx.showToast({ title: '提交成功', icon: 'success' });
    } catch (e) {
      this.setData({ submitting: false });
    }
  }
});
