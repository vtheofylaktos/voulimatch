import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: bills, error } = await supabase
      .from('bills')
      .select('bill_id, title, date_voted, what_changes, pros, cons, votes');

    if (error) {
      console.error('Supabase error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch bills from database' }, { status: 500 });
    }

    if (!bills || bills.length === 0) {
      return NextResponse.json({ error: 'No bills found' }, { status: 404 });
    }

    return NextResponse.json(bills, { status: 200 });
  } catch (err) {
    console.error('Unexpected API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
