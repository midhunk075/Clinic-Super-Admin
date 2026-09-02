import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '../supabaseClient';
import { Package, Check, X, Plus, Users, Clock } from 'lucide-react';

export default function Plans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '', monthly_price: 0, max_clinicians: 1, ai_minutes_limit: 500,
    features: { priority_support: false, custom_voices: false }
  });

  const openModal = (plan?: any) => {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ ...plan });
    } else {
      setEditingPlan(null);
      setFormData({
        name: '', monthly_price: 0, max_clinicians: 1, ai_minutes_limit: 500,
        features: { priority_support: false, custom_voices: false }
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingPlan) {
        // Optimistic UI update
        setPlans(plans.map(p => p.id === editingPlan.id ? { ...formData, id: p.id } : p));
        
        // Real Supabase update
        const { error } = await supabase
          .from('plans')
          .update({
            name: formData.name,
            monthly_price: formData.monthly_price,
            max_clinicians: formData.max_clinicians,
            ai_minutes_limit: formData.ai_minutes_limit,
            features: formData.features
          })
          .eq('id', editingPlan.id);
          
        if (error) throw error;
      } else {
        // Optimistic UI update
        const tempId = 'plan_' + Date.now();
        setPlans([...plans, { ...formData, id: tempId }]);
        
        // Real Supabase insert
        const { data, error } = await supabase
          .from('plans')
          .insert({
            name: formData.name,
            monthly_price: formData.monthly_price,
            max_clinicians: formData.max_clinicians,
            ai_minutes_limit: formData.ai_minutes_limit,
            features: formData.features
          })
          .select()
          .single();
          
        if (error) throw error;
        
        // Replace temp ID with real DB ID
        if (data) {
           setPlans(current => current.map(p => p.id === tempId ? data : p));
        }
      }
    } catch (err) {
      console.error('Failed to save plan to DB (bypassed or error):', err);
    } finally {
      setIsModalOpen(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('plans').select('*').order('monthly_price', { ascending: true });
      if (error) throw error;

      if (data.length === 0) {
        setPlans(fallbackPlans);
      } else {
        setPlans(data);
      }
    } catch (err) {
      console.error(err);
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const fallbackPlans = [
    { id: 'plan_starter', name: 'Starter', monthly_price: 4999, max_clinicians: 1, ai_minutes_limit: 500, features: { priority_support: false, custom_voices: false } },
    { id: 'plan_growth', name: 'Growth', monthly_price: 12999, max_clinicians: 5, ai_minutes_limit: 2500, features: { priority_support: true, custom_voices: false } },
    { id: 'plan_scale', name: 'Scale', monthly_price: 24999, max_clinicians: 15, ai_minutes_limit: 10000, features: { priority_support: true, custom_voices: true } }
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--border)] border-t-[var(--gold)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 page">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[12px] text-[var(--text-muted)]">Manage subscription tiers and pricing models for your tenants.</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Plan
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="card p-6 flex flex-col relative overflow-hidden border-t-4 border-t-[var(--gold)]">
            {plan.name === 'Growth' && (
              <div className="absolute top-4 right-4 badge badge-amber">Popular</div>
            )}
            <div className="w-12 h-12 rounded-full bg-[var(--cream)] border border-[var(--gold-light)] flex items-center justify-center mb-5">
              <Package className="w-5 h-5 text-[var(--gold-dark)]" />
            </div>
            <h3 className="font-display text-2xl text-[var(--text)]">{plan.name}</h3>
            <div className="mt-2 mb-6 flex items-baseline gap-1">
              <span className="font-display text-4xl text-[var(--text)] tracking-tight">₹{plan.monthly_price.toLocaleString('en-IN')}</span>
              <span className="text-[12px] text-[var(--text-faint)]">/mo</span>
            </div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3 text-[13px]">
                <Users className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-[var(--text-muted)]">Up to {plan.max_clinicians} clinicians</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                <Clock className="w-4 h-4 text-[var(--gold)]" />
                <span className="text-[var(--text-muted)]">{plan.ai_minutes_limit.toLocaleString('en-IN')} AI minutes</span>
              </div>
              <div className="w-full h-px bg-[var(--border-soft)] my-4"></div>

              <div className="flex items-center gap-3 text-[13px]">
                {plan.features?.priority_support ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600/50" />}
                <span className={plan.features?.priority_support ? 'text-[var(--text)]' : 'text-[var(--text-faint)] line-through'}>Priority 24/7 Support</span>
              </div>
              <div className="flex items-center gap-3 text-[13px]">
                {plan.features?.custom_voices ? <Check className="w-4 h-4 text-emerald-600" /> : <X className="w-4 h-4 text-rose-600/50" />}
                <span className={plan.features?.custom_voices ? 'text-[var(--text)]' : 'text-[var(--text-faint)] line-through'}>Custom Voice Clones</span>
              </div>
            </div>

            <div className="mt-8">
              <button onClick={() => openModal(plan)} className="btn-ghost w-full border border-[var(--border)] hover:border-[var(--gold-light)]">Edit Plan</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--ink)]/60 backdrop-blur-md">
          <div className="bg-gradient-to-br from-[var(--paper)] to-[var(--cream)] rounded-2xl border-2 border-[var(--gold)] shadow-[0_0_40px_rgba(212,175,55,0.15)] w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-display text-2xl text-[var(--text)]">{editingPlan ? 'Edit Plan' : 'Create Plan'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--text-faint)] hover:text-[var(--text)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[12px] text-[var(--text-muted)] mb-1">Plan Name</label>
                <input type="text" className="input w-full" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </div>
              <div>
                <label className="block text-[12px] text-[var(--text-muted)] mb-1">Monthly Price (₹)</label>
                <input type="number" className="input w-full" value={formData.monthly_price} onChange={(e) => setFormData({ ...formData, monthly_price: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[12px] text-[var(--text-muted)] mb-1">Max Clinicians</label>
                  <input type="number" className="input w-full" value={formData.max_clinicians} onChange={(e) => setFormData({ ...formData, max_clinicians: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--text-muted)] mb-1">AI Minutes</label>
                  <input type="number" className="input w-full" value={formData.ai_minutes_limit} onChange={(e) => setFormData({ ...formData, ai_minutes_limit: parseInt(e.target.value) || 0 })} />
                </div>
              </div>

              <div className="pt-2 space-y-3 border-t border-[var(--border-soft)] mt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]/20" checked={formData.features.priority_support} onChange={(e) => setFormData({ ...formData, features: { ...formData.features, priority_support: e.target.checked } })} />
                  <span className="text-[13px] text-[var(--text)]">Priority 24/7 Support</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--gold)] focus:ring-[var(--gold)]/20" checked={formData.features.custom_voices} onChange={(e) => setFormData({ ...formData, features: { ...formData.features, custom_voices: e.target.checked } })} />
                  <span className="text-[13px] text-[var(--text)]">Custom Voice Clones</span>
                </label>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="btn-ghost flex-1 bg-white border border-[var(--border)]">Cancel</button>
              <button onClick={handleSave} className="btn-primary flex-1 shadow-[0_0_15px_rgba(212,175,55,0.4)]">Save Plan</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
