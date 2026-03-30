import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pickupRequestId = searchParams.get('pickup_request_id');

    let query = supabase.from('waste_tracking').select('*');

    if (pickupRequestId) {
      query = query.eq('pickup_request_id', parseInt(pickupRequestId));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching waste tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waste tracking' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pickup_request_id } = body;

    const { data, error } = await supabase
      .from('waste_tracking')
      .insert([
        {
          pickup_request_id,
          current_stage: 'Collection',
          final_status: 'In Progress',
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating waste tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create waste tracking' },
      { status: 500 }
    );
  }
}
