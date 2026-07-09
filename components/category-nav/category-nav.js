const { CATEGORIES } = require('../../data/constants');

Component({
  properties: {
    categories: {
      type: Array,
      value: CATEGORIES
    },
    activeId: {
      type: String,
      value: ''
    },
    scrollable: {
      type: Boolean,
      value: true
    },
    showIcon: {
      type: Boolean,
      value: true
    },
    theme: {
      type: String,
      value: 'pill'
    }
  },

  data: {
    items: []
  },

  lifetimes: {
    attached() {
      this.updateItems();
    }
  },

  observers: {
    'categories, activeId': function() {
      this.updateItems();
    }
  },

  methods: {
    updateItems() {
      const { categories, activeId, showIcon } = this.data;
      const items = (categories || []).map(item => ({
        ...item,
        active: item.id === activeId,
        iconText: showIcon ? (item.iconText || item.name.charAt(0)) : ''
      }));
      this.setData({ items });
    },

    onTap(e) {
      const { index } = e.currentTarget.dataset;
      const category = this.data.items[index];
      if (!category) return;
      this.triggerEvent('change', { category });
    }
  }
});
