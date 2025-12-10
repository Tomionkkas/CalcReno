import { useState, useEffect } from 'react';
import { pricingSupabase, PricingTier } from '../utils/pricingSupabase';

// Mapping from DB codes to App keys
// Keys are the "code" column in the "materials" table
// Values are the keys used in MaterialCalculator.tsx state
const MATERIAL_MAPPING: Record<string, string> = {
  // Best guess mappings - these may need adjustment based on actual DB content
  'floor_panels': 'floorPanels',
  'underlayment': 'underlayment',
  'paint': 'paint',
  'drywall': 'drywall',
  'cw_profile': 'cwProfiles',
  'uw_profile': 'uwProfiles',
  'mineral_wool': 'mineralWool',
  'tn_screws': 'tnScrews',
  'wall_plaster': 'wallPlaster',
  'finishing_plaster': 'finishingPlaster',
  'osb': 'osb',
  'osb_screws': 'osbScrews',
  'baseboard': 'baseboards',
  'baseboard_ends': 'baseboardEnds',
  'cd_profile': 'cdProfiles',
  'ud_profile': 'udProfiles',
  'hanger': 'hangers',
  'gypsum': 'gypsum',
  'plaster': 'plaster',
  'socket': 'sockets',
  'switch': 'switches',
  'cable_1.5': 'cable15',
  'cable_2.5': 'cable25',
  'junction_box': 'junctionBox'
};

export function useMaterialPrices(tier: PricingTier = 'mid_range') {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await pricingSupabase
          .from('material_prices')
          .select(`
            budget_price,
            mid_range_price,
            premium_price,
            materials!inner (
              code,
              name_pl
            )
          `);

        if (fetchError) throw fetchError;

        const newPrices: Record<string, number> = {};

        data?.forEach((row: any) => {
          const materialCode = row.materials?.code;
          if (!materialCode) return;

          // Select price based on tier
          let price = row[`${tier}_price`];
          
          // Fallback logic if specific tier price is missing
          if (price === null || price === undefined) {
             price = row.mid_range_price ?? row.budget_price ?? row.premium_price;
          }

          if (price !== null && price !== undefined) {
            // Map DB code to App key
            const appKey = MATERIAL_MAPPING[materialCode] || materialCode;
            newPrices[appKey] = Number(price);
          }
        });

        setPrices(newPrices);

      } catch (err) {
        console.error('Error fetching material prices:', err);
        setError('Failed to load prices');
      } finally {
        setLoading(false);
      }
    }

    fetchPrices();
  }, [tier]);

  return { prices, loading, error };
}

