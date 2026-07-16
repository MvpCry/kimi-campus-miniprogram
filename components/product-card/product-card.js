const { formatShortPrice, formatCount, getCategoryName } = require('../../utils/format');
const { CATEGORIES } = require('../../data/constants');

Component({
  properties: {
    post: {
      type: Object,
      value: {}
    }
  },

  data: {
    priceText: '',
    viewText: '',
    categoryName: ''
  },

  lifetimes: {
    attached() {
      this.updateData();
    }
  },

  observers: {
    'post': function() {
      this.updateData();
    }
  },

  methods: {
    updateData() {
      const { post } = this.data;
      if (!post || !post.id) return;

      this.setData({
        priceText: formatShortPrice(post.price),
        viewText: `${formatCount(post.viewCount || 0)}人浏览`,
        categoryName: getCategoryName(CATEGORIES, post.category)
      });
    },

    onTap() {
      this.triggerEvent('tap', { post: this.data.post });
    }
  }
});
