import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type Settings = Record<string, string>;

export function useSiteSettings() {
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('key, value')
      .then(({ data }) => {
        if (data) {
          const map: Settings = {};
          data.forEach((row) => { if (row.key && row.value) map[row.key] = row.value; });
          setSettings(map);
        }
        setLoading(false);
      });
  }, []);

  return { settings, loading };
}
