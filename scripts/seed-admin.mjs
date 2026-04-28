// One-time script to create the admin user via Supabase Auth
// Run with: node scripts/seed-admin.mjs

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://odtsyudmvluatqewrkwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9kdHN5dWRtdmx1YXRxZXdya3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3MTQ3MTcsImV4cCI6MjA5MTI5MDcxN30.fAIQOdMfneI5yP1FG7ucaZeka-qSXQAxMTPauwDqfoQ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedAdmin() {
  console.log('Creating admin user...');
  
  const { data, error } = await supabase.auth.signUp({
    email: 'ebubechukwu.nwagbara@ust.edu.ng',
    password: '08173877764',
  });

  if (error) {
    console.error('Error:', error.message);
    
    // If user already exists, try signing in to verify
    if (error.message.includes('already registered')) {
      console.log('\nUser already exists. Attempting sign-in to verify credentials...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'ebubechukwu.nwagbara@ust.edu.ng',
        password: '08173877764',
      });
      
      if (signInError) {
        console.error('Sign-in failed:', signInError.message);
        console.log('\n--> The user exists but the password may be different.');
        console.log('--> Go to Supabase Dashboard > Authentication > Users');
        console.log('--> Delete the existing user and re-run this script.');
      } else {
        console.log('Sign-in successful! User ID:', signInData.user?.id);
        console.log('\nYou can now log in at: http://localhost:5173/login');
      }
    }
  } else {
    console.log('User created successfully!');
    console.log('User ID:', data.user?.id);
    console.log('Email confirmed:', data.user?.email_confirmed_at ? 'Yes' : 'No');
    
    if (!data.user?.email_confirmed_at) {
      console.log('\n⚠️  Email is NOT confirmed.');
      console.log('Go to Supabase Dashboard > Authentication > Users');
      console.log('Find the user and click the three-dot menu > "Confirm user"');
      console.log('Or: Enable "Confirm email" toggle in Authentication > Settings > Email');
    }
    
    console.log('\nYou can now log in at: http://localhost:5173/login');
  }
}

seedAdmin();
