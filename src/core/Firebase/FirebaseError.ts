export class FirebaseError extends Error {
    public constructor(public code: string) {
        super();
    }
}