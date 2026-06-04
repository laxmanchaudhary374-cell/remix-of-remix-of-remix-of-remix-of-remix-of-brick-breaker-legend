import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useLanguage } from '@/utils/i18n';
import { initAdMob, showRewardedAd } from '@/utils/admob';
import { initBilling, purchaseProduct, BILLING_PRODUCT_IDS } from '@/utils/billing';

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  type: string;
  category: 'powerup' | 'emergency' | 'skin';
  description: string;
  icon: any;
}

interface ShopScreenProps {
  onClose: () => void;
  coins: number;
  addCoins: (amount: number) => void;
}

const ShopScreen: React.FC<ShopScreenProps> = ({ onClose, coins, addCoins }) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'emergency' | 'coins'>('emergency');
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null);
  const [purchaseMessage, setPurchaseMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  useEffect(() => {
    initAdMob().catch(console.error);
    initBilling().catch(console.error);
  }, []);

  const handleWatchAd = async () => {
    if (isAdLoading) return;
    setIsAdLoading(true);
    setAdError(null);
    try {
      const result = await showRewardedAd();
      if (result.ok && result.reward > 0) {
        addCoins(result.reward);
        setPurchaseMessage({ type: 'success', text: `+${result.reward} COINS RECEIVED!` });
      } else if (!result.ok) {
        setAdError(result.error);
      }
    } catch (error) {
      setAdError('Failed to load ad.');
    } finally {
      setIsAdLoading(false);
    }
  };

  const handlePurchase = async (productId: string, amount: number) => {
    setPurchaseLoading(productId);
    setPurchaseMessage(null);
    try {
      const success = await purchaseProduct(productId);
      if (success) {
        addCoins(amount);
        setPurchaseMessage({ type: 'success', text: `SUCCESS! +${amount} COINS ADDED.` });
      } else {
        setPurchaseMessage({ type: 'error', text: 'PURCHASE FAILED.' });
      }
    } catch (error) {
      setPurchaseMessage({ type: 'error', text: 'BILLING ERROR.' });
    } finally {
      setPurchaseLoading(null);
    }
  };

  const coinPacks = [
    { id: BILLING_PRODUCT_IDS.starter_pack, name: 'STARTER PACK', amount: 100, price: '$0.99' },
    { id: BILLING_PRODUCT_IDS.pro_pack, name: 'PRO PACK', amount: 500, price: '$3.99' },
    { id: BILLING_PRODUCT_IDS.whale_pack, name: 'WHALE PACK', amount: 1500, price: '$9.99' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-cyan-500/50 rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between bg-slate-800/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white uppercase">{t('shop')}</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-3 py-1 rounded-full border border-yellow-500/30 flex items-center gap-2">
              <span className="text-yellow-400 font-bold">COINS:</span>
              <span className="text-white font-mono">{coins}</span>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
              <X className="w-6 h-6 text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex border-b border-cyan-500/10">
          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-3 text-xs font-bold uppercase ${activeTab === 'emergency' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            FREE COINS
          </button>
          <button
            onClick={() => setActiveTab('coins')}
            className={`flex-1 py-3 text-xs font-bold uppercase ${activeTab === 'coins' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-500'}`}
          >
            BUY COINS
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {purchaseMessage && (
            <div className={`p-3 rounded-lg flex items-center gap-3 ${purchaseMessage.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {purchaseMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm font-bold">{purchaseMessage.text}</span>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="bg-slate-800/40 border border-cyan-500/20 rounded-xl p-6 text-center space-y-4">
              <h3 className="text-lg font-bold text-white">Watch Ad for 50 Coins</h3>
              <p className="text-slate-400 text-sm">Free coins - just watch a short ad!</p>
              <button
                onClick={handleWatchAd}
                disabled={isAdLoading}
                className="w-full py-3 rounded-xl font-bold bg-cyan-600 text-white disabled:bg-slate-800"
              >
                {isAdLoading ? 'Loading ad...' : 'WATCH NOW'}
              </button>
              {adError && <p className="text-red-400 text-xs">{adError}</p>}
            </div>
          )}

          {activeTab === 'coins' && (
            <div className="space-y-3">
              {coinPacks.map((pack) => (
                <div key={pack.id} className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold">{pack.name}</h4>
                    <p className="text-yellow-500/80 text-xs font-bold">{pack.amount} COINS</p>
                  </div>
                  <button
                    onClick={() => handlePurchase(pack.id, pack.amount)}
                    disabled={purchaseLoading !== null}
                    className="px-6 py-2 rounded-lg font-bold text-sm bg-green-600 text-white"
                  >
                    {purchaseLoading === pack.id ? <Loader2 className="w-4 h-4 animate-spin" /> : pack.price}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopScreen;
