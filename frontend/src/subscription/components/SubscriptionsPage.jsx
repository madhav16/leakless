import React, { useState, useMemo, useRef } from 'react';
import { useSubscriptions, useCreateSubscription, useUpdateSubscription, useDeleteSubscription } from '../hooks/useSubscriptions';
import { useReactTable, getCoreRowModel, getFilteredRowModel, flexRender } from '@tanstack/react-table';
import { Plus, Edit2, Trash2, AlertCircle, Inbox, RefreshCw, Search, X, SearchX } from 'lucide-react';
import { Input } from '@/ui/input';
import { Button } from '@/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/ui/table';
import { formatCurrency, formatDate } from '@/utils/format';
import SubscriptionFormDialog from './SubscriptionFormDialog';
import SubscriptionDeleteDialog from './SubscriptionDeleteDialog';

// Matches name, category, and billing_cycle — case-insensitive, trimmed.
const subscriptionGlobalFilter = (row, _columnId, filterValue) => {
  const q = filterValue.trim().toLowerCase();
  if (!q) return true;
  const name = row.original.name?.toLowerCase() || '';
  const category = row.original.category?.toLowerCase() || '';
  const billingCycle = row.original.billing_cycle?.toLowerCase() || '';
  return name.includes(q) || category.includes(q) || billingCycle.includes(q);
};

export default function SubscriptionsPage() {
  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);

  // Search state and ref for input focus
  const [globalFilter, setGlobalFilter] = useState('');
  const searchInputRef = useRef(null);

  // Fetch
  const {
    data: subscriptions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useSubscriptions();

  // Mutations
  const createMutation = useCreateSubscription();
  const updateMutation = useUpdateSubscription(editingSubscription?.id);
  const deleteMutation = useDeleteSubscription();

  // Handlers
  const handleCreateSubmit = (payload) => {
    createMutation.mutate(payload, { onSuccess: () => setIsCreateOpen(false) });
  };

  const handleEditSubmit = (payload) => {
    updateMutation.mutate(payload, { onSuccess: () => setEditingSubscription(null) });
  };

  const handleDeleteConfirm = () => {
    if (!deletingSubscription) return;
    deleteMutation.mutate(deletingSubscription.id, {
      onSuccess: () => setDeletingSubscription(null),
    });
  };

  // TanStack Table Column Definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Subscription',
        cell: ({ row }) => (
          <span className="font-semibold text-white">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'cost',
        header: 'Cost',
        cell: ({ row }) => {
          const cost = parseFloat(row.original.cost);
          return (
            <span className="font-medium text-slate-200 tabular-nums">
              {formatCurrency(cost)}
              <span className="text-slate-500 text-xs font-normal">
                {' '}/ {row.original.billing_cycle}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) =>
          row.original.category ? (
            <Badge variant="outline" className="border-white/10 text-slate-300">
              {row.original.category}
            </Badge>
          ) : (
            <span className="text-slate-600 font-normal">—</span>
          ),
      },
      {
        accessorKey: 'renewal_date',
        header: 'Renewal Date',
        cell: ({ row }) => (
          <span className="text-slate-300 text-sm tabular-nums">
            {formatDate(row.original.renewal_date)}
          </span>
        ),
      },
      {
        accessorKey: 'is_trial',
        header: 'Type',
        cell: ({ row }) =>
          row.original.is_trial ? (
            <Badge variant="warning">Free Trial</Badge>
          ) : (
            <Badge variant="success">Paid</Badge>
          ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          const isDeleting =
            deleteMutation.isPending && deletingSubscription?.id === row.original.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setEditingSubscription(row.original)}
                className="h-8 w-8 text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                disabled={deleteMutation.isPending}
                aria-label={`Edit ${row.original.name}`}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDeletingSubscription(row.original)}
                className="h-8 w-8 text-slate-500 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                disabled={isDeleting}
                aria-label={`Delete ${row.original.name}`}
              >
                {isDeleting ? (
                  <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [deleteMutation.isPending, deletingSubscription?.id],
  );

  // TanStack Table — configured with built-in global filter
  const table = useReactTable({
    data: subscriptions,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: subscriptionGlobalFilter,
  });

  // Derive filtered row count once so it can be reused without calling
  // getFilteredRowModel() repeatedly across the render.
  const filteredRows = table.getFilteredRowModel().rows;

  // Badge copy
  const badgeLabel = (() => {
    if (isLoading || isError) return null;
    const total = subscriptions.length;
    const shown = filteredRows.length;
    if (!globalFilter.trim()) return `${total} Total`;
    return `${shown} of ${total}`;
  })();

  // Whether we have data but search produces nothing
  const isEmptySearch =
    !isLoading && !isError && subscriptions.length > 0 && filteredRows.length === 0;

  return (
    <div className="flex flex-col h-full p-6 md:p-8 gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Subscriptions
          </h1>
          <p className="mt-1.5 text-sm md:text-base text-slate-400">
            Track, analyze, and manage your active subscriptions and trial periods.
          </p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subscription</span>
        </Button>
      </div>

      {/* Main Card */}
      <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Card Header — fixed */}
        <CardHeader className="border-b border-white/5 pb-4 flex-shrink-0">
          <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
            <span>All Subscriptions</span>
            {badgeLabel && (
              <Badge variant="secondary" className="bg-surface-300 text-slate-300 tabular-nums">
                {badgeLabel}
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs md:text-sm">
            Detailed breakdown of your current software licenses and subscriptions.
          </CardDescription>
        </CardHeader>

        {/* Search bar — fixed below card header, only shown when data exists */}
        {!isLoading && !isError && subscriptions.length > 0 && (
          <div className="flex-shrink-0 px-4 py-3 border-b border-white/5">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
              <Input
                ref={searchInputRef}
                type="text"
                value={globalFilter}
                onChange={(e) => table.setGlobalFilter(e.target.value)}
                placeholder="Search subscriptions…"
                className="pl-9 pr-10"
              />
              {globalFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setGlobalFilter('');
                    searchInputRef.current?.focus();
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500 hover:text-white hover:bg-transparent"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
            <p className="mt-1.5 text-xs text-slate-500 select-none">
              {globalFilter.trim() ? (
                `Showing ${filteredRows.length} of ${subscriptions.length} subscription${subscriptions.length === 1 ? '' : 's'}`
              ) : (
                `Showing all ${subscriptions.length} subscription${subscriptions.length === 1 ? '' : 's'}`
              )}
            </p>
          </div>
        )}

        {/* Scrollable content area */}
        <CardContent className="p-0 flex flex-col flex-1 min-h-0">

          {/* Loading Skeleton */}
          {isLoading && (
            <Table containerClassName="flex-1 overflow-y-auto">
              <TableHeader>
                <TableRow>
                  {['Subscription', 'Cost', 'Category', 'Renewal Date', 'Type', ''].map((h, i) => (
                    <TableHead key={i} className="sticky top-0 z-10 bg-surface-200 border-b border-white/5">
                      {h && <div className="h-3 bg-slate-800/60 rounded w-16 animate-pulse" />}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(6)].map((_, rIdx) => (
                  <TableRow key={rIdx} className="animate-pulse">
                    <TableCell><div className="h-4 bg-slate-800/50 rounded w-32" /></TableCell>
                    <TableCell><div className="h-4 bg-slate-800/50 rounded w-24" /></TableCell>
                    <TableCell><div className="h-5 bg-slate-800/50 rounded-full w-20" /></TableCell>
                    <TableCell><div className="h-4 bg-slate-800/50 rounded w-24" /></TableCell>
                    <TableCell><div className="h-5 bg-slate-800/50 rounded-full w-14" /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <div className="h-8 w-8 bg-slate-800/50 rounded" />
                        <div className="h-8 w-8 bg-slate-800/50 rounded" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center flex-1 p-12 text-center">
              <div className="p-3 bg-red-950/20 rounded-full border border-red-500/20 text-red-400 mb-4 animate-bounce">
                <AlertCircle className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Failed to load subscriptions</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-6">
                {error?.message || 'We had trouble connecting to the server. Please check your network.'}
              </p>
              <Button onClick={() => refetch()} variant="outline" className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                <span>Retry</span>
              </Button>
            </div>
          )}

          {/* Empty State — no subscriptions at all */}
          {!isLoading && !isError && subscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center flex-1 p-16 text-center">
              <div className="p-4 bg-surface-300/50 rounded-full text-slate-400 mb-4 border border-white/5">
                <Inbox className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">No subscriptions yet</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Keep track of your recurring costs, renewal dates, and free trial periods. Add your first subscription to get started.
              </p>
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-all shadow-md"
              >
                <Plus className="h-4 w-4" />
                <span>Add Subscription</span>
              </Button>
            </div>
          )}

          {/* Empty Search State — has data but nothing matches the query */}
          {isEmptySearch && (
            <div className="flex flex-col items-center justify-center flex-1 p-16 text-center">
              <div className="p-4 bg-surface-300/50 rounded-full text-slate-400 mb-4 border border-white/5">
                <SearchX className="h-10 w-10" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">No results found</h3>
              <p className="text-sm text-slate-400 max-w-sm mb-5">
                No subscriptions match{' '}
                <span className="text-white font-medium">"{globalFilter.trim()}"</span>.
                Try a different name, category, or billing cycle.
              </p>
              <Button
                variant="outline"
                onClick={() => setGlobalFilter('')}
                className="flex items-center gap-2 text-sm"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear search</span>
              </Button>
            </div>
          )}

          {/* Data Table — containerClassName overrides the default overflow-auto so the
              Table's own wrapper becomes the single scroll container, enabling
              position:sticky on TableHead without a nested scroll boundary. */}
          {!isLoading && !isError && filteredRows.length > 0 && (
            <Table containerClassName="flex-1 overflow-y-auto">
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className={`sticky top-0 z-10 bg-surface-200 border-b border-white/5 ${header.id === 'actions' ? 'text-right' : ''}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {filteredRows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <SubscriptionFormDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => { setIsCreateOpen(open); if (!open) createMutation.reset(); }}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        apiError={createMutation.error}
      />

      <SubscriptionFormDialog
        isOpen={!!editingSubscription}
        onOpenChange={(open) => { if (!open) { setEditingSubscription(null); updateMutation.reset(); } }}
        subscription={editingSubscription}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        apiError={updateMutation.error}
      />

      <SubscriptionDeleteDialog
        isOpen={!!deletingSubscription}
        onOpenChange={(open) => { if (!open) { setDeletingSubscription(null); deleteMutation.reset(); } }}
        subscription={deletingSubscription}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        apiError={deleteMutation.error}
      />
    </div>
  );
}
