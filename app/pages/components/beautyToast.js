const default_data = {
  visible: false,
  content: '',
  duration: 2000
};

let timmer = null;

Component({
  data: {
    ...default_data
  },

  methods: {
    handleShow (options) {
      const { content } = options;
      this.setData({ content: content, visible: true });

      const d = this.data.duration;
      if (timmer) clearTimeout(timmer);
      if (d !== 0) {
        timmer = setTimeout(() => {
          this.handleHide();
          timmer = null;
        }, d);
      }
    },

    handleHide () {
      this.setData({ ...default_data });
    }
  }
});

module.exports = {
  BeautyToast: function(options) {
    const pages = getCurrentPages();
    const toast = pages[0].selectComponent('#toast');
    if (toast) {
      toast.handleShow(options);
    }
  }
}