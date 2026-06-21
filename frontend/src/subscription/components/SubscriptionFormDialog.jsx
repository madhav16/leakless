import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/ui/dialog';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';

const BILLING_CYCLES = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'lifetime'];
const CATEGORIES = [
  'Entertainment',
  'Music',
  'Design',
  'Development',
  'Productivity',
  'Cloud',
  'Security',
  'Finance',
  'Health',
  'Education',
  'News',
  'Gaming',
  'Other',
];

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.split('T')[0];
};

const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  return dateString.split('T')[0] || null;
};

export default function SubscriptionFormDialog({
  isOpen,
  onOpenChange,
  subscription = null,
  onSubmit,
  isLoading,
  apiError = null,
}) {
  const isEdit = !!subscription;

  // Form State
  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [category, setCategory] = useState('Entertainment');
  const [renewalDate, setRenewalDate] = useState('');
  const [isTrial, setIsTrial] = useState(false);
  const [trialEndDate, setTrialEndDate] = useState('');

  // Client Validation State
  const [errors, setErrors] = useState({});

  // Reset or pre-fill form when subscription or open state changes
  useEffect(() => {
    if (isOpen) {
      if (subscription) {
        setName(subscription.name ?? '');
        setCost(subscription.cost ? String(subscription.cost) : '');
        setBillingCycle(subscription.billing_cycle ?? 'monthly');
        setCategory(subscription.category ?? 'Entertainment');
        setRenewalDate(formatDateForInput(subscription.renewal_date));
        setIsTrial(!!subscription.is_trial);
        setTrialEndDate(formatDateForInput(subscription.trial_end_date));
      } else {
        setName('');
        setCost('');
        setBillingCycle('monthly');
        setCategory('Entertainment');
        setRenewalDate('');
        setIsTrial(false);
        setTrialEndDate('');
      }
      setErrors({});
    }
  }, [isOpen, subscription]);

  const validateForm = () => {
    const newErrors = {};
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.length > 100) {
      newErrors.name = 'Name must be at most 100 characters';
    }

    const costNum = parseFloat(cost);
    if (isNaN(costNum)) {
      newErrors.cost = 'Cost must be a valid number';
    } else if (costNum < 0) {
      newErrors.cost = 'Cost cannot be negative';
    } else if (costNum > 100000) {
      newErrors.cost = 'Cost seems too large';
    }

    if (!billingCycle) {
      newErrors.billingCycle = 'Billing cycle is required';
    }

    if (isTrial && !trialEndDate) {
      newErrors.trialEndDate = 'Trial end date is required when trial is enabled';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      name: name.trim(),
      cost: parseFloat(cost),
      billing_cycle: billingCycle,
      category: category || null,
      renewal_date: formatDateForBackend(renewalDate),
      is_trial: isTrial,
      trial_end_date: isTrial ? formatDateForBackend(trialEndDate) : null,
    };

    onSubmit(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] border border-white/10 bg-surface-200 text-slate-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            {isEdit ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            {isEdit
              ? 'Modify the details of your subscription below. Fields with * are required.'
              : 'Add a new subscription to track your recurring expenses and trial periods.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Main Error */}
          {apiError && (
            <div className="p-3 text-sm text-red-400 bg-red-950/30 rounded border border-red-500/20">
              {apiError.message || 'An error occurred. Please verify your details.'}
            </div>
          )}

          {/* Subscription Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Name <span className="text-brand-400">*</span>
            </label>
            <Input
              type="text"
              placeholder="e.g., Netflix, Spotify, AWS"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={errors.name ? 'border-red-500/50 focus-visible:ring-red-500' : ''}
              disabled={isLoading}
            />
            {errors.name && <span className="text-xs text-red-400">{errors.name}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Cost */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cost (₹ / INR) <span className="text-brand-400">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                placeholder="499.00"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className={errors.cost ? 'border-red-500/50 focus-visible:ring-red-500' : ''}
                disabled={isLoading}
              />
              {errors.cost && <span className="text-xs text-red-400">{errors.cost}</span>}
            </div>

            {/* Billing Cycle */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Billing Cycle <span className="text-brand-400">*</span>
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                className="flex h-9 w-full rounded-md border border-white/10 bg-surface-300 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {BILLING_CYCLES.map((cycle) => (
                  <option key={cycle} value={cycle} className="bg-surface-200">
                    {cycle.charAt(0).toUpperCase() + cycle.slice(1)}
                  </option>
                ))}
              </select>
              {errors.billingCycle && (
                <span className="text-xs text-red-400">{errors.billingCycle}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex h-9 w-full rounded-md border border-white/10 bg-surface-300 px-3 py-1 text-sm text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isLoading}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat} className="bg-surface-200">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Renewal Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Renewal Date
              </label>
              <Input
                type="date"
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Trial Switch Checkbox */}
          <div className="flex items-center gap-3 p-3 bg-surface-300/40 rounded-lg border border-white/5">
            <input
              type="checkbox"
              id="is_trial"
              checked={isTrial}
              onChange={(e) => setIsTrial(e.target.checked)}
              className="h-4 w-4 rounded border-white/10 bg-surface-300 text-brand-600 focus:ring-brand-500 focus:ring-offset-surface-200"
              disabled={isLoading}
            />
            <div className="flex flex-col">
              <label htmlFor="is_trial" className="text-sm font-semibold text-white cursor-pointer">
                This is a free trial
              </label>
              <span className="text-xs text-slate-400">
                Track trial periods to prevent unwanted auto-renewal charges.
              </span>
            </div>
          </div>

          {/* Trial End Date (shown when is_trial is checked) */}
          {isTrial && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Trial End Date <span className="text-brand-400">*</span>
              </label>
              <Input
                type="date"
                value={trialEndDate}
                onChange={(e) => setTrialEndDate(e.target.value)}
                className={
                  errors.trialEndDate ? 'border-red-500/50 focus-visible:ring-red-500' : ''
                }
                disabled={isLoading}
              />
              {errors.trialEndDate && (
                <span className="text-xs text-red-400">{errors.trialEndDate}</span>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <DialogFooter className="pt-4 flex items-center justify-end gap-2 border-t border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Saving...</span>
                </div>
              ) : isEdit ? (
                'Save Changes'
              ) : (
                'Add Subscription'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
