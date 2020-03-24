export type CancellablePromise<T> = { promise: Promise<T>; cancel: () => void };

export function makeCancelable<T>(promise: Promise<T>, rejectReasonOnCancel: any = "cancelled"): CancellablePromise<T> {
    let isCanceled = false;

    const wrappedPromise: Promise<T> = new Promise((resolve, reject) => {
        promise.then(
            val => isCanceled ? reject(rejectReasonOnCancel) : resolve(val),
            error => isCanceled ? reject(rejectReasonOnCancel) : reject(error),
        );
    });

    return {
        promise: wrappedPromise,
        cancel() {
            // noinspection ReuseOfLocalVariableJS
            isCanceled = true;
        },
    };
}