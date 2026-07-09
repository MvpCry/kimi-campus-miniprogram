Component({
  properties: {
    files: {
      type: Array,
      value: []
    },
    maxCount: {
      type: Number,
      value: 9
    },
    maxVideoCount: {
      type: Number,
      value: 1
    },
    accept: {
      type: String,
      value: 'image'
    },
    showPreview: {
      type: Boolean,
      value: true
    }
  },

  data: {
    canAdd: true,
    internalFiles: []
  },

  lifetimes: {
    attached() {
      this.syncFiles();
    }
  },

  observers: {
    'files, maxCount, maxVideoCount, accept': function() {
      this.syncFiles();
    }
  },

  methods: {
    syncFiles() {
      const { files, maxCount } = this.data;
      const internalFiles = (files || []).map((file, index) => ({
        ...file,
        id: file.id || `f_${index}_${Date.now()}`,
        type: file.type || 'image',
        status: file.status || 'done'
      }));
      this.setData({
        internalFiles,
        canAdd: internalFiles.length < maxCount
      });
    },

    chooseMedia() {
      const { accept, maxCount, internalFiles, maxVideoCount } = this.data;
      const mediaType = this.getMediaType(accept);
      const currentCount = internalFiles.length;
      const remaining = maxCount - currentCount;

      if (remaining <= 0) {
        this.triggerError(`最多上传 ${maxCount} 个文件`);
        return;
      }

      wx.chooseMedia({
        count: remaining,
        mediaType,
        sourceType: ['album', 'camera'],
        success: (res) => {
          const chosen = res.tempFiles || [];
          const newFiles = [];
          let videoCount = internalFiles.filter(f => f.type === 'video').length;

          for (const file of chosen) {
            const isVideo = file.fileType === 'video' || file.thumbTempFilePath;
            const type = isVideo ? 'video' : 'image';

            if (type === 'video') {
              if (videoCount >= maxVideoCount) {
                this.triggerError(`最多上传 ${maxVideoCount} 个视频`);
                continue;
              }
              videoCount++;
            }

            newFiles.push({
              id: generateId(),
              url: file.tempFilePath,
              thumb: file.thumbTempFilePath || file.tempFilePath,
              type,
              status: 'done'
            });
          }

          if (newFiles.length === 0) return;

          const updated = [...internalFiles, ...newFiles];
          this.setData({
            internalFiles: updated,
            canAdd: updated.length < maxCount
          });
          this.triggerEvent('change', { files: updated });
        },
        fail: (err) => {
          if (err.errMsg && err.errMsg.includes('cancel')) return;
          this.triggerError('选择文件失败');
        }
      });
    },

    getMediaType(accept) {
      if (accept === 'image') return ['image'];
      if (accept === 'video') return ['video'];
      return ['image', 'video'];
    },

    previewMedia(e) {
      if (!this.data.showPreview) return;
      const { index } = e.currentTarget.dataset;
      const file = this.data.internalFiles[index];
      if (!file) return;

      if (file.type === 'video') {
        this.triggerEvent('preview', { index, file });
        return;
      }

      const urls = this.data.internalFiles
        .filter(f => f.type === 'image')
        .map(f => f.url);
      const current = urls.indexOf(file.url);

      wx.previewImage({
        urls,
        current: current >= 0 ? urls[current] : file.url
      });

      this.triggerEvent('preview', { index, file });
    },

    deleteFile(e) {
      const { index } = e.currentTarget.dataset;
      const updated = this.data.internalFiles.filter((_, i) => i !== index);
      this.setData({
        internalFiles: updated,
        canAdd: updated.length < this.data.maxCount
      });
      this.triggerEvent('change', { files: updated });
    },

    triggerError(msg) {
      wx.showToast({ title: msg, icon: 'none' });
      this.triggerEvent('error', { msg });
    }
  }
});

function generateId() {
  return `f_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}
