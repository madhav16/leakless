import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/ui/dialog';
import { Button } from '@/ui/button';

export default function SubscriptionDeleteDialog({
  isOpen,
  onOpenChange,
  subscription,
  onConfirm,
  isLoading,
  apiError = null,
}) {
  if (!subscription) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] border border-white/10 bg-surface-200 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            Delete Subscription
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm mt-1">
            Are you sure you want to delete{' '}
            <span className="font-semibold text-white">“{subscription.name}”</span>?
          </DialogDescription>
        </DialogHeader>

        {apiError && (
          <div className="p-3 my-2 text-sm text-red-400 bg-red-950/30 rounded border border-red-500/20">
            {apiError.message || 'An error occurred. Failed to delete subscription.'}
          </div>
        )}

        <div className="py-2 text-sm text-slate-300">
          This will permanently remove this subscription, its history, and any associated notifications. This action cannot be undone.
        </div>

        <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            className="min-w-[100px]"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Deleting...</span>
              </div>
            ) : (
              'Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
