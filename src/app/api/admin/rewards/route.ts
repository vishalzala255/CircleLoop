import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use service role for admin operations
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');
    const rewardId = searchParams.get('reward_id');

    if (rewardId) {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .eq('id', rewardId)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    if (customerId) {
      const { data, error } = await supabase
        .from('rewards')
        .select('*, coupons(code, title, description, discount_value)')
        .eq('customer_id', customerId)
        .order('issued_at', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Get all rewards (admin only)
    const { data, error } = await supabase
      .from('rewards')
      .select('*, profiles(name, email)')
      .order('issued_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_id, ewaste_request_id, reward_type, reward_name, reward_value, description, expires_at } = body;

    // Generate unique redemption code
    const redemption_code = `RWD-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    const { data, error } = await supabase
      .from('rewards')
      .insert([
        {
          customer_id,
          ewaste_request_id,
          reward_type,
          reward_name,
          reward_value,
          description,
          expires_at: expires_at || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days default
          redemption_code,
          status: 'Issued'
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(data[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { reward_id, status, redeemed_at } = body;

    const { data, error } = await supabase
      .from('rewards')
      .update({
        status,
        redeemed_at: redeemed_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reward_id)
      .select();

    if (error) throw error;
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
