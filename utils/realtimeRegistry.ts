import { supabase } from "@/lib/supabaseClient";

type RealtimeSyncStatus = "idle" | "connecting" | "subscribed" | "degraded" | "error";

interface QueryFilter {
    column: string;
    value: string | number | boolean | null;
    operator?: string;
}

interface RealtimeOrder {
    column: string;
    ascending?: boolean;
}

export interface RegistryEntry<TData = any> {
    data: TData[];
    loading: boolean;
    syncStatus: RealtimeSyncStatus;
    fetchError: string | null;
    lastSyncedAt: number | null;
    listeners: Set<(entry: RegistryEntry<TData>) => void>;
    channel: any | null;
    fetchPromise: Promise<void> | null;
}

class RealtimeRegistry {
    private entries: Map<string, RegistryEntry> = new Map();

    private buildKey(table: string, scopeKey: string, select: string, filters: any, orderBy: any) {
        return `${table}:${scopeKey}:${select}:${JSON.stringify(filters)}:${JSON.stringify(orderBy)}`;
    }

    private async fetchRows(key: string, table: string, select: string, filters: QueryFilter[], orderBy?: RealtimeOrder) {
        const entry = this.entries.get(key);
        if (!entry) return;

        try {
            let query = supabase.from(table).select(select);
            filters.forEach((f) => {
                const op = f.operator || "eq";
                // @ts-ignore - dynamic as usual
                query = query[op](f.column, f.value);
            });

            if (orderBy) {
                query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
            }

            const { data, error } = await query;

            if (error) throw error;

            entry.data = data || [];
            entry.fetchError = null;
            entry.loading = false;
            entry.lastSyncedAt = Date.now();
            this.notify(key);
        } catch (err: any) {
            entry.fetchError = err.message || "Fetch failed";
            entry.loading = false;
            this.notify(key);
        } finally {
            entry.fetchPromise = null;
        }
    }

    private notify(key: string) {
        const entry = this.entries.get(key);
        if (entry) {
            entry.listeners.forEach((l) => l(entry));
        }
    }

    subscribe<TData>(
        options: {
            table: string;
            consumer: string;
            scopeKey: string;
            select?: string;
            fetchFilters?: QueryFilter[];
            channelFilter?: QueryFilter;
            orderBy?: RealtimeOrder;
            mapRow?: (row: any) => TData;
        },
        onUpdate: (entry: RegistryEntry<TData>) => void
    ) {
        const { table, scopeKey, select = "*", fetchFilters = [], orderBy } = options;
        const key = this.buildKey(table, scopeKey, select, fetchFilters, orderBy);

        let entry = this.entries.get(key);

        if (!entry) {
            entry = {
                data: [],
                loading: true,
                syncStatus: "connecting",
                fetchError: null,
                lastSyncedAt: null,
                listeners: new Set(),
                channel: null,
                fetchPromise: null,
            };
            this.entries.set(key, entry);

            // Trigger initial fetch
            entry.fetchPromise = this.fetchRows(key, table, select, fetchFilters, orderBy);

            // Setup Realtime Channel (Shared)
            const channelName = `registry_${table}_${scopeKey}`.replace(/[^a-zA-Z0-9_-]/g, "_");
            entry.channel = supabase
                .channel(channelName)
                .on("postgres_changes", { event: "*", schema: "public", table }, (payload) => {
                    // Refetch on any change to keep logic simple and consistent with existing hook's "refetch on change" or "apply payload" logic
                    // For now, simpler but robust: refetch to ensure data integrity
                    this.fetchRows(key, table, select, fetchFilters, orderBy);
                })
                .subscribe((status) => {
                    if (entry) {
                        if (status === "SUBSCRIBED") entry.syncStatus = "subscribed";
                        else if (status === "CHANNEL_ERROR") entry.syncStatus = "error";
                        else entry.syncStatus = "degraded";
                        this.notify(key);
                    }
                });
        }

        entry.listeners.add(onUpdate);
        
        // Immediate call with current state
        onUpdate(entry);

        return () => {
            if (entry) {
                entry.listeners.delete(onUpdate);
                if (entry.listeners.size === 0) {
                    if (entry.channel) supabase.removeChannel(entry.channel);
                    this.entries.delete(key);
                }
            }
        };
    }

    // Manual refresh for a specific key
    async refresh(table: string, scopeKey: string, select: string, filters: any, orderBy: any) {
        const key = this.buildKey(table, scopeKey, select, filters, orderBy);
        const entry = this.entries.get(key);
        if (entry && !entry.fetchPromise) {
            entry.fetchPromise = this.fetchRows(key, table, select, filters, orderBy);
            return entry.fetchPromise;
        }
    }
}

export const realtimeRegistry = new RealtimeRegistry();
