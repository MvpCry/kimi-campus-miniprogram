Component({
  properties: {
    title: { type: String, value: '暂无内容' },
    description: { type: String, value: '' },
    actionText: { type: String, value: '' },
    icon: { type: String, value: 'box' }
  },

  methods: {
    onAction() {
      this.triggerEvent('action');
    }
  }
});
