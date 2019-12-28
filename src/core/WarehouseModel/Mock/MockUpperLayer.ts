/**
 * All non-tray warehouse model classes may be only shallow loaded at a time, this
 * interface begins to unify the warehouse model for consistent recursive data access.
 */
export interface MockUpperLayer {
    isDeepLoaded: boolean;
    loadNextLayer(): Promise<void>;
}