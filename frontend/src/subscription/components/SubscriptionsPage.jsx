import React, { useState, useMemo } from 'react';
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useDeleteSubscription,
} from '../hooks/useSubscriptions';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from '@tanstack/react-table';
import { Plus, Edit2, Trash2, AlertCircle, Inbox, RefreshCw } from 'lucide-react';
import { Button } from '@/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/ui/card';
import { Badge } from '@/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/ui/table';
import { formatCurrency, formatDate } from '@/utils/format';
import SubscriptionFormDialog from './SubscriptionFormDialog';
import SubscriptionDeleteDialog from './SubscriptionDeleteDialog';

export default function SubscriptionsPage() {
  // Dialog Open/Close States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState(null);
  const [deletingSubscription, setDeletingSubscription] = useState(null);

  // Fetch Subscriptions
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
    createMutation.mutate(payload, {
      onSuccess: () => {
        setIsCreateOpen(false);
      },
    });
  };

  const handleEditSubmit = (payload) => {
    updateMutation.mutate(payload, {
      onSuccess: () => {
        setEditingSubscription(null);
      },
    });
  };

  const handleDeleteConfirm = () => {
    if (!deletingSubscription) return;
    deleteMutation.mutate(deletingSubscription.id, {
      onSuccess: () => {
        setDeletingSubscription(null);
      },
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
            <span className="font-medium text-slate-200">
              {formatCurrency(cost)}
              <span className="text-slate-500 text-xs font-normal">
                {' '}
                / {row.original.billing_cycle}
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
          <span className="text-slate-300 text-sm">
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
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditingSubscription(row.original)}
              className="h-8 w-8 text-slate-400 hover:text-white"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDeletingSubscription(row.original)}
              className="h-8 w-8 text-slate-400 hover:text-red-400"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  // Initialize TanStack Table
  const table = useReactTable({
    data: subscriptions,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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

      {/* Main Content */}
      <Card className="border border-white/5 bg-surface-200 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="border-b border-white/5 pb-4">
          <CardTitle className="text-lg font-bold text-white flex items-center justify-between">
            <span>All Subscriptions</span>
            {!isLoading && !isError && (
              <Badge variant="secondary" className="bg-surface-300 text-slate-300">
                {subscriptions.length} Total
              </Badge>
            )}
          </CardTitle>
          <CardDescription className="text-slate-400 text-xs md:text-sm">
            Detailed breakdown of your current software licenses and subscriptions.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="p-4 space-y-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col, idx) => (
                      <TableHead key={idx}>
                        <div className="h-4 bg-slate-800/40 rounded w-20"></div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...Array(5)].map((_, rIdx) => (
                    <TableRow key={rIdx} className="animate-pulse border-b border-white/5">
                      <TableCell><div className="h-4 bg-slate-800/40 rounded w-32"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-800/40 rounded w-20"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-800/40 rounded w-24"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-800/40 rounded w-28"></div></TableCell>
                      <TableCell><div className="h-4 bg-slate-800/40 rounded w-16"></div></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <div className="h-8 w-8 bg-slate-800/40 rounded"></div>
                          <div className="h-8 w-8 bg-slate-800/40 rounded"></div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
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

          {/* Empty State */}
          {!isLoading && !isError && subscriptions.length === 0 && (
            <div className="flex flex-col items-center justify-center p-16 text-center">
              <div className="p-4 bg-surface-300/50 rounded-full text-slate-400 mb-4 border border-white/5">
                <Inbox className="h-10 w-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-1.5">No subscriptions yet</h3>
              <p className="text-sm text-slate-400 max-w-md mb-6">
                Keep track of your monthly spending, renewal alert notifications, and trial periods. Add your first subscription to get started!
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

          {/* Data Table */}
          {!isLoading && !isError && subscriptions.length > 0 && (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id} className="text-slate-400 text-xs font-semibold py-3">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-4 align-middle">
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

      {/* Forms and Action Dialogs */}
      <SubscriptionFormDialog
        isOpen={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            createMutation.reset();
          }
        }}
        onSubmit={handleCreateSubmit}
        isLoading={createMutation.isPending}
        apiError={createMutation.error}
      />

      <SubscriptionFormDialog
        isOpen={!!editingSubscription}
        onOpenChange={(open) => {
          if (!open) {
            setEditingSubscription(null);
            updateMutation.reset();
          }
        }}
        subscription={editingSubscription}
        onSubmit={handleEditSubmit}
        isLoading={updateMutation.isPending}
        apiError={updateMutation.error}
      />

      <SubscriptionDeleteDialog
        isOpen={!!deletingSubscription}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSubscription(null);
            deleteMutation.reset();
          }
        }}
        subscription={deletingSubscription}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        apiError={deleteMutation.error}
      />
    </div>
  );
}
