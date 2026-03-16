import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export type RealtimeSyncStatus = "idle" | "connecting" | "subscribed" | "degraded" | "error";

type QueryOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte";

interface QueryFilter {
    column: string;
    value: string | number | boolean | null;
    operator?: QueryOperator;
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

const DEFAULT_POLL_INTERVAL_MS = 5000;
const CONNECTION_GRACE_MS = 4000;
const defaultGetRowId = (row: any) => String(row?.id || "");

const sanitizeChannelSegment = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 48);

const buildChannelName = (consumer: string, table: string, scopeKey: string, instanceId: string) =>
    [
        "rt",
        sanitizeChannelSegment(consumer),
        sanitizeChannelSegment(table),
        sanitizeChannelSegment(scopeKey),
        sanitizeChannelSegment(instanceId),
    ].join("_");

const buildChannelFilter = (filter?: QueryFilter) => {
    if (!filter) return undefined;
    return `${filter.column}=${filter.operator || "eq"}.${filter.value}`;
};

const applyQueryFilter = (query: any, filter: QueryFilter) => {
    const operator = filter.operator || "eq";
    switch (operator) {
        case "neq":
            return query.neq(filter.column, filter.value);
        case "gt":
            return query.gt(filter.column, filter.value);
        case "gte":
            return query.gte(filter.column, filter.value);
        case "lt":
            return query.lt(filter.column, filter.value);
        case "lte":
            return query.lte(filter.column, filter.value);
        case "eq":
        default:
            return query.eq(filter.column, filter.value);
    }
};

const hasPayloadRow = (row: any) => !!row && typeof row === "object" && Object.keys(row).length > 0;

const getErrorMessage = (error: any) => {
    if (!error) return "Unknown realtime error";
    if (typeof error === "string") return error;
    if (error.message) return error.message;
    return "Unknown realtime error";
};

const normalizeRows = <TData,>(
    rows: any[] | null | undefined,
    mapRow?: (row: any) => TData,
    sort?: (left: TData, right: TData) => number
) => {
    const mapped = (rows || []).map((row) => (mapRow ? mapRow(row) : row as TData));
    return sort ? [...mapped].sort(sort) : mapped;
};

const applyRealtimePayload = <TData,>(
    currentRows: TData[],
    payload: any,
    mapRow: ((row: any) => TData) | undefined,
    getRowId: (row: any) => string,
    sort: ((left: TData, right: TData) => number) | undefined
) => {
    const eventType = payload?.eventType;
    const rawNew = hasPayloadRow(payload?.new) ? payload.new : null;
    const rawOld = hasPayloadRow(payload?.old) ? payload.old : null;
    const incoming = rawNew ? (mapRow ? mapRow(rawNew) : rawNew as TData) : null;
    const targetId = getRowId(rawNew || rawOld);

    if (!targetId) return currentRows;

    let nextRows = currentRows;

    if (eventType === "DELETE") {
        nextRows = currentRows.filter((row) => getRowId(row) !== targetId);
    } else if (incoming) {
        const existingIndex = currentRows.findIndex((row) => getRowId(row) === targetId);
        if (existingIndex >= 0) {
            nextRows = [...currentRows];
            nextRows[existingIndex] = incoming;
        } else {
            nextRows = [incoming, ...currentRows];
        }
    }

    return sort ? [...nextRows].sort(sort) : nextRows;
};

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
    enablePollingFallback = false,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
}: UseRealtimeCollectionOptions<TData>): RealtimeCollectionState<TData> {
    const [data, setData] = useState<TData[]>([]);
    const [loading, setLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState<RealtimeSyncStatus>(enabled ? "connecting" : "idle");
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);

    const instanceIdRef = useRef(Math.random().toString(36).slice(2, 10));
    const refreshRef = useRef(async () => {});
    const derivedGetRowId = getRowId || defaultGetRowId;
    const fetchFiltersKey = JSON.stringify(fetchFilters);
    const channelFilterKey = JSON.stringify(channelFilter || null);
    const orderByKey = JSON.stringify(orderBy || null);

    useEffect(() => {
        if (!enabled) {
            setData([]);
            setLoading(false);
            setSyncStatus("idle");
            setFetchError(null);
            setLastSyncedAt(null);
            refreshRef.current = async () => {};
            return;
        }

        let active = true;
        let pollTimer: number | null = null;
        let connectTimer: number | null = null;
        let hasSubscribed = false;
        const resolvedFetchFilters = JSON.parse(fetchFiltersKey) as QueryFilter[];
        const resolvedChannelFilter = JSON.parse(channelFilterKey) as QueryFilter | null;
        const resolvedOrderBy = JSON.parse(orderByKey) as RealtimeOrder | null;

        const stopPolling = () => {
            if (pollTimer !== null) {
                window.clearInterval(pollTimer);
                pollTimer = null;
            }
        };

        const fetchRows = async () => {
            try {
                let query = supabase.from(table).select(select);
                resolvedFetchFilters.forEach((filter) => {
                    query = applyQueryFilter(query, filter);
                });

                if (resolvedOrderBy) {
                    query = query.order(resolvedOrderBy.column, { ascending: resolvedOrderBy.ascending ?? true });
                }

                const { data: rows, error } = await query;
                if (!active) return;

                if (error) {
                    throw error;
                }

                setData(normalizeRows(rows, mapRow, sort));
                setFetchError(null);
                setLoading(false);
                setLastSyncedAt(Date.now());
            } catch (error) {
                if (!active) return;
                setFetchError(getErrorMessage(error));
                setLoading(false);
                setSyncStatus((current) => (current === "subscribed" ? "degraded" : "error"));
            }
        };

        const startPolling = () => {
            if (!enablePollingFallback || typeof window === "undefined" || pollTimer !== null) return;
            pollTimer = window.setInterval(() => {
                void fetchRows();
            }, pollIntervalMs);
        };

        refreshRef.current = fetchRows;
        setLoading(true);
        setSyncStatus("connecting");
        void fetchRows();

        if (typeof window !== "undefined") {
            connectTimer = window.setTimeout(() => {
                if (!active || hasSubscribed) return;
                setSyncStatus("degraded");
                startPolling();
                void fetchRows();
            }, CONNECTION_GRACE_MS);
        }

        const channel = supabase
            .channel(buildChannelName(consumer, table, scopeKey, instanceIdRef.current))
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table,
                    ...(buildChannelFilter(resolvedChannelFilter || undefined) ? { filter: buildChannelFilter(resolvedChannelFilter || undefined) } : {}),
                },
                (payload) => {
                    if (!active) return;
                    setData((currentRows) => applyRealtimePayload(currentRows, payload, mapRow, derivedGetRowId, sort));
                    setFetchError(null);
                    setLastSyncedAt(Date.now());
                }
            )
            .subscribe((status) => {
                if (!active) return;

                if (status === "SUBSCRIBED") {
                    hasSubscribed = true;
                    if (connectTimer !== null) {
                        window.clearTimeout(connectTimer);
                        connectTimer = null;
                    }
                    stopPolling();
                    setSyncStatus("subscribed");
                    void fetchRows();
                    return;
                }

                if (status === "CHANNEL_ERROR") {
                    setSyncStatus("error");
                    startPolling();
                    void fetchRows();
                    return;
                }

                if (status === "TIMED_OUT" || status === "CLOSED") {
                    setSyncStatus("degraded");
                    startPolling();
                    void fetchRows();
                    return;
                }

                setSyncStatus("connecting");
            });

        const handleVisibility = () => {
            if (document.visibilityState === "visible") {
                void fetchRows();
            }
        };

        const handleOnline = () => {
            void fetchRows();
        };

        if (typeof window !== "undefined") {
            document.addEventListener("visibilitychange", handleVisibility);
            window.addEventListener("online", handleOnline);
        }

        return () => {
            active = false;
            stopPolling();
            if (connectTimer !== null) {
                window.clearTimeout(connectTimer);
            }
            if (typeof window !== "undefined") {
                document.removeEventListener("visibilitychange", handleVisibility);
                window.removeEventListener("online", handleOnline);
            }
            supabase.removeChannel(channel);
        };
    }, [
        channelFilterKey,
        consumer,
        derivedGetRowId,
        enablePollingFallback,
        enabled,
        fetchFiltersKey,
        mapRow,
        pollIntervalMs,
        scopeKey,
        select,
        sort,
        table,
        orderByKey,
    ]);

    return {
        data,
        loading,
        syncStatus,
        fetchError,
        lastSyncedAt,
        refresh: () => refreshRef.current(),
    };
}
