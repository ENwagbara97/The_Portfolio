import { createClient } from '@supabase/supabase-api-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  console.log('Setting up Mockup assets...');

  // Create bucket
  const { error: bucketError } = await supabase.storage.createBucket('mockup-screens', {
    public: true,
  });
  if (bucketError && bucketError.message !== 'Bucket already exists') {
    console.error('Error creating bucket:', bucketError);
  } else {
    console.log('Bucket "mockup-screens" ready.');
  }

  // Insert settings keys
  const keys = [
    'mockup_video_url',
    'mockup_screen_1',
    'mockup_screen_2',
    'mockup_screen_3',
    'mockup_screen_4',
    'mockup_screen_5',
    'mockup_screen_6',
    'mockup_screen_dark',
    'mockup_screen_light'
  ];

  for (const key of keys) {
    const { error: upsertError } = await supabase.from('site_settings').upsert(
      { key, value: null },
      { onConflict: 'key' }
    );
    if (upsertError) {
      console.error(`Error upserting key ${key}:`, upsertError);
    }
  }

  console.log('Mockup settings keys initialized.');
}

setup();
