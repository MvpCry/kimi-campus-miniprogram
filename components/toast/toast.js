Component({
  data: {
    visible: false,
    message: '',
    type: 'info'
  },

  timer: null,

  methods: {
    show(message, type = 'info', duration = 2000) {
      this.setData({ visible: true, message, type });
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.hide();
      }, duration);
    },

    hide() {
      this.setData({ visible: false });
    },

    success(message, duration) {
      this.show(message, 'success', duration);
    },

    error(message, duration) {
      this.show(message, 'error', duration);
    }
  }
});
