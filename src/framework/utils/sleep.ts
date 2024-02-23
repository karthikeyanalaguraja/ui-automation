import log from './log';

/** Do not use sleep in feature steps, use Retry instead */
const sleep = (time: number): Promise<void> => {
  log.debug(`Sleeping for ${time} ms`);
  return new Promise((resolve) => {
    return setTimeout(resolve, time);
  });
};

export default sleep;
