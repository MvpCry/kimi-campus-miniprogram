const api = require('../../utils/api');
const { validatePost } = require('../../utils/validators');
const { POST_TYPES, CATEGORIES, CONDITIONS, CAMPUSES, POST_TAGS } = require('../../data/constants');

Page({
  data: {
    POST_TYPES,
    CATEGORIES,
    CONDITIONS,
    CAMPUSES,
    POST_TAGS,
    postId: '',
    categoryIndex: 0,
    conditionIndex: -1,
    mediaFiles: [],
    showPrice: true,
    showCondition: true,
    displayTags: [],
    form: {
      type: 'sell',
      title: '',
      description: '',
      category: '',
      tags: [],
      price: '',
      originalPrice: '',
      condition: '',
      campus: '',
      location: '',
      contactMethod: '私信',
      images: []
    },
    submitting: false
  },

  async onLoad(options) {
    const postId = options.postId;
    if (!postId) {
      wx.showToast({ title: '帖子不存在', icon: 'none' });
      wx.navigateBack();
      return;
    }

    this.setData({ postId });
    await this.loadPost(postId);
  },

  async loadPost(postId) {
    try {
      const post = await api.get(`/posts/${postId}`);
      const app = getApp();
      const currentUser = app.globalData.currentUser;

      if (!currentUser || post.publisherId !== currentUser.id) {
        wx.showToast({ title: '无权编辑', icon: 'none' });
        wx.navigateBack();
        return;
      }

      const categoryIndex = CATEGORIES.findIndex(c => c.id === post.category);
      const conditionIndex = post.condition ? CONDITIONS.findIndex(c => c.id === post.condition) : -1;
      const mediaFiles = (post.images || []).map(url => ({ url, type: 'image' }));

      this.setData({
        categoryIndex: categoryIndex > -1 ? categoryIndex : 0,
        conditionIndex,
        mediaFiles,
        displayTags: this.computeDisplayTags(post.tags || []),
        ...this.computeTypeFlags(post.type || 'sell'),
        form: {
          type: post.type || 'sell',
          title: post.title || '',
          description: post.description || '',
          category: post.category || CATEGORIES[0].id,
          tags: post.tags || [],
          price: post.price !== null && post.price !== undefined ? String(post.price) : '',
          originalPrice: post.originalPrice !== null && post.originalPrice !== undefined ? String(post.originalPrice) : '',
          condition: post.condition || '',
          campus: post.campus || CAMPUSES[0],
          location: post.location || '',
          contactMethod: post.contactMethod || '私信',
          images: post.images || []
        }
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },

  computeTypeFlags(type) {
    return {
      showPrice: type === 'sell' || type === 'wanted',
      showCondition: type === 'sell' || type === 'barter'
    };
  },

  computeDisplayTags(selectedTags) {
    return POST_TAGS.map(t => ({
      ...t,
      active: selectedTags.includes(t.name)
    }));
  },

  selectType(e) {
    const { type } = e.currentTarget.dataset;
    this.setData({ 'form.type': type, ...this.computeTypeFlags(type) });
  },

  onInput(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({ [`form.${field}`]: e.detail.value });
  },

  onCategoryChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({
      'form.category': CATEGORIES[index].id,
      categoryIndex: index
    });
  },

  onConditionChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({
      'form.condition': CONDITIONS[index].id,
      conditionIndex: index
    });
  },

  onCampusChange(e) {
    const index = parseInt(e.detail.value, 10);
    this.setData({ 'form.campus': CAMPUSES[index] });
  },

  toggleTag(e) {
    const { name } = e.currentTarget.dataset;
    const tags = [...this.data.form.tags];
    const index = tags.indexOf(name);
    if (index > -1) {
      tags.splice(index, 1);
    } else if (tags.length < 3) {
      tags.push(name);
    } else {
      wx.showToast({ title: '最多选3个标签', icon: 'none' });
      return;
    }
    this.setData({ 'form.tags': tags, displayTags: this.computeDisplayTags(tags) });
  },

  onMediaChange(e) {
    const { files } = e.detail;
    const images = files.map(f => f.url);
    const mediaFiles = files.map(f => ({ url: f.url, type: f.type || 'image' }));
    this.setData({ 'form.images': images, mediaFiles });
  },

  async submit() {
    if (this.data.submitting) return;

    const { valid, errors } = validatePost(this.data.form);
    if (!valid) {
      wx.showToast({ title: errors[0], icon: 'none' });
      return;
    }

    this.setData({ submitting: true });

    try {
      const payload = this.buildPayload();
      await api.put(`/posts/${this.data.postId}`, payload);
      wx.showToast({ title: '保存成功', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      this.setData({ submitting: false });
    }
  },

  buildPayload() {
    const { form } = this.data;
    const payload = {
      type: form.type,
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tags: form.tags,
      campus: form.campus,
      location: form.location.trim(),
      contactMethod: form.contactMethod,
      images: form.images
    };

    if (form.type === 'sell') {
      payload.price = parseFloat(form.price);
      payload.originalPrice = form.originalPrice ? parseFloat(form.originalPrice) : null;
      payload.condition = form.condition;
    } else if (form.type === 'wanted') {
      payload.price = form.price ? parseFloat(form.price) : null;
    } else if (form.type === 'barter') {
      payload.condition = form.condition;
    }

    return payload;
  }
});
