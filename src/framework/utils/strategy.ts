import sleep from './sleep';

type Action<T = void> = () => T | Promise<T>;
type ErrorHandler<T> = (error: any) => T;

const defaultConfig = {
  retryTimeout: 60 * 1000,
  retryPollInterval: 500,
};

export const retryWithTimeout = async <T>(
  action: Action<T>,
  timeoutAction: Action,
  timeout: number = defaultConfig.retryTimeout,
  pollingInterval: number = defaultConfig.retryPollInterval
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
) => {
  const startTime = Date.now();
  do {
    const result = await tryOnce(action);
    if (result) {
      return result;
    }
    await sleep(pollingInterval);
  } while (Date.now() - startTime < timeout);
  await run(timeoutAction);
  return undefined;
};

export const tryOnce = async <T>(action: Action<T>, onError?: ErrorHandler<T>): Promise<T | undefined> => {
  try {
    return await run(action);
  } catch (error) {
    if (onError) {
      return onError(error);
    }
    return undefined;
  }
};

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const run = async <T>(action: Action<T>) => {
  const result = action();
  // eslint-disable-next-line no-return-await
  return isPromise(result) ? await result : result;
};

const isPromise = (obj: any): boolean => {
  return Boolean(obj && obj.then);
};
