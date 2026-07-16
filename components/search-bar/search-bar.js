Component({
  properties: {
    placeholder: { type: String, value: '搜索物品、教材、电动车...' },
    value: { type: String, value: '' },
    showFilter: { type: Boolean, value: false },
    showCamera: { type: Boolean, value: false },
    showSearchBtn: { type: Boolean, value: false }
  },

  methods: {
    onInput(e) {
      const value = e.detail.value;
      this.triggerEvent('input', { value });
    },
    onConfirm(e) {
      this.triggerEvent('search', { value: e.detail.value });
    },
    onClear() {
      this.triggerEvent('clear');
    },
    onFocus() {
      this.triggerEvent('focus');
    },
    onFilter() {
      this.triggerEvent('filter');
    },
    onCamera() {
      this.triggerEvent('camera');
    },
    onSearchTap() {
      this.triggerEvent('search', { value: this.data.value });
    }
  }
});
