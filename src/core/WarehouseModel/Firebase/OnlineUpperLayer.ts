import {OnlineLayer} from "./OnlineLayer";

/**
 * All non-tray warehouse model classes may be only shallow loaded at a time, this
 * interface begins to unify the warehouse model for consistent recursive data access.
 */
export abstract class OnlineUpperLayer extends OnlineLayer {
    isDeepLoaded: boolean = false;
    public abstract loadNextLayer(): Promise<void>;
}