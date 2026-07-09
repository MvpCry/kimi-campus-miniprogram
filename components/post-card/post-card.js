const { formatShortPrice, formatTimeAgo, getCategoryName, getConditionName, getTagColor } = require('../../utils/format');
const { CATEGORIES, CONDITIONS } = require('../../data/constants');

Component({
  properties: {
    post: {
      type: Object,
      value: {}
    },
    showTypeTag: {
      type: Boolean,
      value: false
    }
  },

  data: {
    priceText: '',
    timeText: '',
    categoryName: '',
    conditionName: '',
    tagStyles: []
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

      const tags = post.tags || [];
      const tagStyles = tags.map(name => ({
        name,
        color: getTagColor(require('../../data/mock/tags.json'), name)
      }));

      this.setData({
        priceText: formatShortPrice(post.price),
        timeText: formatTimeAgo(post.createdAt),
        categoryName: getCategoryName(CATEGORIES, post.category),
        conditionName: getConditionName(CONDITIONS, post.condition),
        tagStyles
      });
    },

    onTap() {
      this.triggerEvent('tap', { post: this.data.post });
    }
  }
});
