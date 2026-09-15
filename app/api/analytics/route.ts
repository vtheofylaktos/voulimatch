import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { age_group, top_match_party, top_match_percentage } = body;

    if (!age_group || !top_match_party || top_match_percentage === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('analytics')
      .insert([
        {
          age_group,
          top_match_party,
          top_match_percentage,
        }
      ]);

    if (error) {
      console.error('Supabase telemetry insert error:', error.message);
      return NextResponse.json({ error: 'Failed to record analytics' }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error('Unexpected Telemetry API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
