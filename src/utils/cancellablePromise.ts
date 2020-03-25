export type CancellablePromise<T> = { promise: Promise<T>; cancel: () => void };

export function makeCancellable<T>(
    promise: Promise<T>, rejectReasonOnCancel: any = "cancelled"): CancellablePromise<T> {
    let isCancelled = false;

    const wrappedPromise: Promise<T> = new Promise((resolve, reject) => {
        promise.then(
            val => isCancelled ? reject(rejectReasonOnCancel) : resolve(val),
            error => isCancelled ? reject(rejectReasonOnCancel) : reject(error),
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            // noinspection ReuseOfLocalVariableJS
            isCancelled = true;
        },
    };
}