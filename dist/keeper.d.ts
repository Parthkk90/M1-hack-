interface ScheduleInfo {
    schedulerAddress: string;
    lastChecked: number;
}
/**
 * Add scheduler address to tracking list
 */
export declare function trackScheduler(schedulerAddress: string): void;
/**
 * Start keeper bot
 */
export declare function startKeeper(): Promise<void>;
/**
 * Stop keeper bot
 */
export declare function stopKeeper(): void;
/**
 * Get keeper status
 */
export declare function getKeeperStatus(): {
    isRunning: boolean;
    keeperAddress: `0x${string}`;
    trackedSchedulers: ScheduleInfo[];
    checkInterval: number;
};
/**
 * Demo: Add some test schedulers and run keeper
 */
export declare function runKeeperDemo(): Promise<void>;
declare const _default: {
    startKeeper: typeof startKeeper;
    stopKeeper: typeof stopKeeper;
    getKeeperStatus: typeof getKeeperStatus;
    trackScheduler: typeof trackScheduler;
};
export default _default;
//# sourceMappingURL=keeper.d.ts.map