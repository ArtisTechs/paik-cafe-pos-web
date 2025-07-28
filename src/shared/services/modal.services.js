class ModalService {
  showModalCallback = null;
  hideModalCallback = null;

  registerShowModalCallback(callback) {
    this.showModalCallback = callback;
  }

  registerHideModalCallback(callback) {
    this.hideModalCallback = callback;
  }

  show({
    title,
    message,
    onConfirm,
    confirmText,
    confirmButtonClass,
    onCancel,
  }) {
    if (this.showModalCallback) {
      this.showModalCallback({
        title,
        message,
        onConfirm,
        confirmText,
        confirmButtonClass,
        onCancel,
      });
    }
  }

  hide() {
    if (this.hideModalCallback) {
      this.hideModalCallback();
    }
  }
}

export const modalService = new ModalService();
