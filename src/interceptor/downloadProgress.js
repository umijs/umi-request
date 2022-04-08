const downloadProgress = async (response, options = {}) => {
  const { onDownloadProgress } = options;

  if (typeof onDownloadProgress === 'function') {
    const cloneRes = response.clone();
    let contentLength = cloneRes.headers.get('content-length');
    contentLength = Object.is(null, contentLength) ? null : +contentLength;
    const reader = cloneRes.body.getReader();

    let received = 0;
    const chunks = [];

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      chunks.push(value);
      received += value.length;

      onDownloadProgress(
        contentLength ? { received, total: contentLength, percentage: received / contentLength } : { received }
      );
    }
  }

  return response;
};

export default downloadProgress;
