export * from "./axios";

export function retry(
  func: (nextTry: () => void) => void,
  time: number = 1000,
  max: number = 1
) {
  let count = 0;
  const nextTry = (isFirst: boolean = false) => {
    if (count >= max) {
      return;
    }

    if (isFirst) {
      func(nextTry);
    } else {
      count++;
      setTimeout(() => func(nextTry), time);
    }
  };

  nextTry(true);
}
