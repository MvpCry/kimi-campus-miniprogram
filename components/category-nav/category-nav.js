const { CATEGORIES } = require('../../data/constants');

const GRID_ICON_BGS = [
  '#FEE2E2',
  '#FEF3C7',
  '#DBEAFE',
  '#F3E8FF',
  '#D1FAE5',
  '#FFEDD5',
  '#E0F2FE',
  '#FCE7F3',
  '#ECFCCB',
  '#F5F3FF'
];

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
    items: [],
    columns: []
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
      const { categories, activeId, showIcon, theme } = this.data;
      const list = (categories || []).map((item, index) => ({
        ...item,
        _index: index,
        active: item.id === activeId,
        iconText: showIcon ? (item.iconText || item.icon || item.name.charAt(0)) : '',
        iconBg: item.iconBg || GRID_ICON_BGS[index % GRID_ICON_BGS.length],
        badge: item.badge || ''
      }));

      this.setData({ items: list });

      if (theme === 'grid') {
        const columns = [];
        for (let i = 0; i < list.length; i += 2) {
          columns.push(list.slice(i, i + 2));
        }
        this.setData({ columns });
      }
    },

    onTap(e) {
      const { index } = e.currentTarget.dataset;
      const category = this.data.items[index];
      if (!category) return;
      this.triggerEvent('change', { category });
    }
  }
});
