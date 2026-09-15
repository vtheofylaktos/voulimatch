const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dyuooefbttkzsjxbgcmb.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dW9vZWZidHRrenNqeGJnY21iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk0NzgwOTcsImV4cCI6MjEwNTA1NDA5N30.TtVPdXAvY3TdK51qs0SWWKKrG3ahRr6l7ZIy06tB5Ws';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, 'data', 'bills.json'), 'utf8');
    const bills = JSON.parse(rawData);

    console.log(`Seeding ${bills.length} bills...`);
    const { data, error } = await supabase.from('bills').upsert(bills, { onConflict: 'bill_id' });

    if (error) {
      console.error('Error seeding bills:', error);
    } else {
      console.log('Successfully seeded bills!');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

seed();
