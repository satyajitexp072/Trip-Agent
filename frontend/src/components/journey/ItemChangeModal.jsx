import React from 'react';
import { X, Check, ArrowRight, Star, Plus, Minus } from 'lucide-react';

const FALLBACK_ACCOMMODATION_ALTS = [
  {
    id: 'acc-alt-1',
    name: 'Caravela Beach Resort (Beachfront Luxury)',
    costDelta: +11700,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
    type: '4-Star Beachfront Luxury Resort'
  },
  {
    id: 'acc-alt-2',
    name: 'Casa De Goa Boutique Resort & Spa',
    costDelta: +1800,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    type: 'Portuguese Villa Style (4-Star)'
  },
  {
    id: 'acc-alt-3',
    name: 'Zostel Plus Morjim (Private Beachside Pods)',
    costDelta: -2800,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    type: 'Chic Beachside Social Stay'
  },
  {
    id: 'acc-alt-4',
    name: 'The Funky Monkey Hostel, Anjuna',
    costDelta: -6300,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    type: 'Vibrant Budget Hostel'
  }
];

const FALLBACK_TRANSPORT_ALTS = [
  {
    id: 'trans-alt-1',
    title: 'Direct Non-Stop Indigo Charter Flight',
    costDelta: +3400,
    duration: '2h 30m non-stop',
    provider: 'IndiGo Airlines (Direct)'
  },
  {
    id: 'trans-alt-2',
    title: 'Konkan Kanya Express AC 2-Tier Train',
    costDelta: -5200,
    duration: '26h Scenic Western Ghats',
    provider: 'Indian Railways'
  }
];

const FALLBACK_ACTIVITY_ALTS = [
  {
    id: 'act-alt-1',
    title: 'Mandovi River Sunset Catamaran Sailing',
    costDelta: +700,
    duration: '90 Minutes',
    provider: 'Paradise Catamarans'
  },
  {
    id: 'act-alt-2',
    title: 'Fontainhas Latin Quarter Heritage & Bakery Walk',
    costDelta: +550,
    duration: '2 Hours',
    provider: 'Soul Travelling Goa'
  },
  {
    id: 'act-alt-3',
    title: 'Dudhsagar Waterfall Jeep Safari Tour',
    costDelta: +2100,
    duration: 'Full Day (8 Hours)',
    provider: 'Goa Eco Safari'
  }
];

export default function ItemChangeModal({ isOpen, onClose, itemCategory, currentItem, onSelectAlternative }) {
  if (!isOpen || !currentItem) return null;

  const currentName = currentItem.name || currentItem.title || '';
  let alternatives = currentItem.alternatives && currentItem.alternatives.length > 0
    ? currentItem.alternatives
    : itemCategory === 'accommodation'
    ? FALLBACK_ACCOMMODATION_ALTS.filter((a) => !a.name.toLowerCase().includes(currentName.toLowerCase()))
    : itemCategory === 'transport'
    ? FALLBACK_TRANSPORT_ALTS.filter((a) => !a.title.toLowerCase().includes(currentName.toLowerCase()))
    : FALLBACK_ACTIVITY_ALTS.filter((a) => !a.title.toLowerCase().includes(currentName.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-600">
              Customize Your Plan
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Change {itemCategory === 'accommodation' ? 'Accommodation' : itemCategory === 'transport' ? 'Transport' : 'Activity'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Selection */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Currently Selected
          </span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-bold text-slate-800">
              {currentItem.name || currentItem.title}
            </span>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">
              Current Plan
            </span>
          </div>
        </div>

        {/* Alternative Options */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
            Available Alternatives
          </label>

          {alternatives.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              No direct alternatives found for this item in this tier.
            </p>
          ) : (
            alternatives.map((alt) => {
              const isMore = alt.costDelta > 0;
              const isLess = alt.costDelta < 0;

              return (
                <div
                  key={alt.id || alt.title}
                  className="p-4 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                        {alt.name || alt.title}
                      </h4>
                      {alt.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {alt.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {alt.type || alt.duration || alt.provider || 'Alternative selection'}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Price delta */}
                    <div className="text-right">
                      {alt.costDelta !== undefined && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isMore
                              ? 'bg-rose-50 text-rose-700'
                              : isLess
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isMore ? `+₹${alt.costDelta}` : isLess ? `-₹${Math.abs(alt.costDelta)}` : 'Same price'}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectAlternative(alt);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all"
                    >
                      <span>Choose</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
