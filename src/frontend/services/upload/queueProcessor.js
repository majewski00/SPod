export const processQueue = (
  getQueue,
  processFile,
  onItemProgress,
  onItemComplete,
  onItemError
) => {
  let isPaused = false;
  let isCancelled = false;
  let currentlyProcessing = new Set();
  const maxConcurrent = 3;

  const processNext = async () => {
    if (isPaused || isCancelled) return;
    const queue = getQueue();

    const pendingItems = queue.filter(
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
      const result = await processFile(item, onItemProgress);
      onItemComplete(item.id, result); // ? it might not be the right place to call this - complexity of response
    } catch (error) {
      onItemError(item.id, error);
    }
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
