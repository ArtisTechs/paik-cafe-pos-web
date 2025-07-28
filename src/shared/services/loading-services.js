let loadingHandler = null;

export const setFullLoadingHandler = (handler) => {
  loadingHandler = handler;
};

export const showFullLoading = () => {
  if (loadingHandler) {
    loadingHandler(true);
  }
};

export const hideFullLoading = () => {
  if (loadingHandler) {
    loadingHandler(false);
  }
};
