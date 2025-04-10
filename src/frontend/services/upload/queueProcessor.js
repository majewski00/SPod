export const processQueue = (
  initialQueue,
  processFile,
  onItemProgress,
  onItemComplete,
  onItemError,
  options
) => {
  let isPaused = false;
  let isCancelled = false;
  let currentlyProcessing = new Set();
  let uploadQueue = [...initialQueue];
  const maxConcurrent = 3;

  const processNext = async () => {
    if (isPaused || isCancelled) return;

    const pendingItems = uploadQueue.filter(
      (item) => item.status === "pending" && !currentlyProcessing.has(item.id)
    );

    const availableSlots = maxConcurrent - currentlyProcessing.size;
    const itemsToProcess = pendingItems.slice(0, availableSlots);

    for (const item of itemsToProcess) {
      currentlyProcessing.add(item.id);

      processItem(item).finally(() => {
        currentlyProcessing.delete(item.id);
        processNext();
      });
    }
  };

  const processItem = async (item) => {
    try {
      const result = await processFile(
        item.file,
        (progress, status = "uploading") => {
          updateInternalQueue(item.id, progress, status);
          onItemProgress(item.id, progress, status);
        },
        options
      );
      updateInternalQueue(item.id, 100, "complete");
      onItemComplete(item.id, result);
    } catch (error) {
      updateInternalQueue(item.id, 0, "failed");
      onItemError(item.id, error);
    }
  };

  const updateInternalQueue = (itemId, progress, status = "uploading") => {
    uploadQueue = uploadQueue.map((item) =>
      item.id === itemId ? { ...item, progress, status } : item
    );
  };

  processNext();

  return {
    pause: () => {
      isPaused = true;
    },
    resume: () => {
      isPaused = false;
      processNext();
    },
    cancel: () => {
      isCancelled = true;
    },
    getStatus: () => ({
      isPaused,
      isCancelled,
      currentlyProcessing: Array.from(currentlyProcessing),
    }),
  };
};
