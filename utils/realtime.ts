import { useEffect, useState, useMemo } from "react";
import { realtimeRegistry } from "./realtimeRegistry";

export type RealtimeSyncStatus = "idle" | "connecting" | "subscribed" | "degraded" | "error";

interface QueryFilter {
    column: string;
    value: string | number | boolean | null;
    operator?: string;
}

interface RealtimeOrder {
    column: string;
    ascending?: boolean;
}

interface UseRealtimeCollectionOptions<TData> {
    table: string;
    consumer: string;
    scopeKey: string;
    enabled: boolean;
    select?: string;
    fetchFilters?: QueryFilter[];
    channelFilter?: QueryFilter;
    orderBy?: RealtimeOrder;
    mapRow?: (row: any) => TData;
    sort?: (left: TData, right: TData) => number;
    getRowId?: (row: any) => string;
    enablePollingFallback?: boolean;
    pollIntervalMs?: number;
}

export interface RealtimeCollectionState<TData> {
    data: TData[];
    loading: boolean;
    syncStatus: RealtimeSyncStatus;
    fetchError: string | null;
    lastSyncedAt: number | null;
    refresh: () => Promise<void>;
}

const defaultGetRowId = (row: any) => String(row?.id || "");

export function useRealtimeCollection<TData>({
    table,
    consumer,
    scopeKey,
    enabled,
    select = "*",
    fetchFilters = [],
    channelFilter,
    orderBy,
    mapRow,
    sort,
    getRowId,
}: UseRealtimeCollectionOptions<TData>): RealtimeCollectionState<TData> {
    const [state, setState] = useState<any>({
        data: [],
        loading: enabled,
        syncStatus: enabled ? "connecting" : "idle",
        fetchError: null,
        lastSyncedAt: null,
    });

    const derivedGetRowId = getRowId || defaultGetRowId;

    useEffect(() => {
        if (!enabled) {
            setState({
                data: [],
                loading: false,
                syncStatus: "idle",
                fetchError: null,
                lastSyncedAt: null,
            });
            return;
        }

        const unsubscribe = realtimeRegistry.subscribe<TData>(
            {
                table,
                consumer,
                scopeKey,
                select,
                fetchFilters,
                channelFilter,
                orderBy,
            },
            (entry) => {
                setState({
                    data: entry.data,
                    loading: entry.loading,
                    syncStatus: entry.syncStatus,
                    fetchError: entry.fetchError,
                    lastSyncedAt: entry.lastSyncedAt,
                });
            }
        );

        return () => unsubscribe();
    }, [table, scopeKey, JSON.stringify(fetchFilters), JSON.stringify(orderBy), enabled]);

    // Apply client-side sorting and mapping
    const processedData = useMemo(() => {
        const mapped = (state.data || []).map((row: any) => (mapRow ? mapRow(row) : row as TData));
        return sort ? [...mapped].sort(sort) : mapped;
    }, [state.data, mapRow, sort]);

    return {
        data: processedData,
        loading: state.loading,
        syncStatus: state.syncStatus,
        fetchError: state.fetchError,
        lastSyncedAt: state.lastSyncedAt,
        refresh: async () => {
            await realtimeRegistry.refresh(table, scopeKey, select, fetchFilters, orderBy);
        },
    };
}
