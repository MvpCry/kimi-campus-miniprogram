const DEFAULT_FILTERS = {
  sort: 'latest',
  campus: '',
  condition: '',
  minPrice: '',
  maxPrice: ''
};

Component({
  properties: {
    filters: {
      type: Object,
      value: { ...DEFAULT_FILTERS }
    },
    options: {
      type: Object,
      value: {
        sort: [
          { id: 'latest', name: '最新发布' },
          { id: 'price_asc', name: '价格最低' },
          { id: 'price_desc', name: '价格最高' },
          { id: 'hot', name: '最多浏览' }
        ],
        campus: [],
        condition: []
      }
    },
    sticky: {
      type: Boolean,
      value: false
    }
  },

  data: {
    expanded: '',
    localFilters: { ...DEFAULT_FILTERS },
    panels: []
  },

  lifetimes: {
    attached() {
      this.initPanels();
      this.setData({ localFilters: { ...this.data.filters } });
    }
  },

  observers: {
    'filters, options': function() {
      this.initPanels();
    }
  },

  methods: {
    initPanels() {
      const { options } = this.data;
      const panels = [];

      if (options.sort && options.sort.length) {
        panels.push({ key: 'sort', name: '排序' });
      }
      if (options.campus && options.campus.length) {
        panels.push({ key: 'campus', name: '校区' });
      }
      if (options.condition && options.condition.length) {
        panels.push({ key: 'condition', name: '成色' });
      }
      if (options.showPrice) {
        panels.push({ key: 'price', name: '价格' });
      }

      this.setData({ panels });
    },

    getActiveLabel(key) {
      const { localFilters, options } = this.data;
      const value = localFilters[key];
      if (!value) return '';
      const list = options[key] || [];
      const item = list.find(i => i.id === value);
      return item ? item.name : '';
    },

    togglePanel(e) {
      const { key } = e.currentTarget.dataset;
      const expanded = this.data.expanded === key ? '' : key;
      this.setData({ expanded });
    },

    closePanel() {
      this.setData({ expanded: '' });
    },

    selectOption(e) {
      const { key, id } = e.currentTarget.dataset;
      this.setData({
        [`localFilters.${key}`]: id,
        expanded: ''
      }, () => {
        this.triggerChange();
      });
    },

    onPriceInput(e) {
      const { key } = e.currentTarget.dataset;
      const value = e.detail.value;
      this.setData({
        [`localFilters.${key}`]: value
      });
    },

    confirmPrice() {
      const { minPrice, maxPrice } = this.data.localFilters;
      const min = parseFloat(minPrice);
      const max = parseFloat(maxPrice);

      if (!isNaN(min) && !isNaN(max) && min > max) {
        wx.showToast({ title: '最低价不能高于最高价', icon: 'none' });
        return;
      }

      this.setData({ expanded: '' });
      this.triggerChange();
    },

    reset() {
      this.setData({
        localFilters: { ...DEFAULT_FILTERS },
        expanded: ''
      }, () => {
        this.triggerEvent('reset');
        this.triggerChange();
      });
    },

    triggerChange() {
      this.triggerEvent('change', { filters: { ...this.data.localFilters } });
    }
  }
});
