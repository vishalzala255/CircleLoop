import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reward_id, customer_id, coupon_id, redemption_amount, merchant_name, order_id, notes } = body;

    // Start a transaction-like operation
    const { data: rewardData, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', reward_id)
      .single();

    if (rewardError) throw rewardError;

    if (rewardData.status === 'Redeemed') {
      return NextResponse.json(
        { error: 'This reward has already been redeemed' },
        { status: 400 }
      );
    }

    // Create redemption record
    const { data: redemptionData, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert([
        {
          reward_id,
          customer_id,
          coupon_id,
          redemption_amount,
          merchant_name,
          order_id,
          notes
        }
      ])
      .select();

    if (redemptionError) throw redemptionError;

    // Update reward status to Redeemed
    const { data: updatedReward, error: updateError } = await supabase
      .from('rewards')
      .update({
        status: 'Redeemed',
        redeemed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', reward_id)
      .select();

    if (updateError) throw updateError;

    // Update coupon usage if applicable
    if (coupon_id) {
      const { data: couponData } = await supabase
        .from('coupons')
        .select('current_uses, max_uses')
        .eq('id', coupon_id)
        .single();

      if (couponData) {
        const newUses = (couponData.current_uses || 0) + 1;
        await supabase
          .from('coupons')
          .update({
            current_uses: newUses,
            status: (couponData.max_uses && newUses >= couponData.max_uses) ? 'Inactive' : 'Active'
          })
          .eq('id', coupon_id);
      }
    }

    return NextResponse.json(redemptionData[0], { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (customerId) {
      const { data, error } = await supabase
        .from('reward_redemptions')
        .select('*, rewards(*), coupons(*)')
        .eq('customer_id', customerId)
        .order('redemption_date', { ascending: false });

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Get all redemptions (admin)
    const { data, error } = await supabase
      .from('reward_redemptions')
      .select('*, rewards(*), coupons(*), profiles(name, email)')
      .order('redemption_date', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
