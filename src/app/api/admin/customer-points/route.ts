import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id');

    if (customerId) {
      const { data, error } = await supabase
        .from('customer_points')
        .select('*')
        .eq('customer_id', customerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (!data) {
        // Create new points record if doesn't exist
        const { data: newData, error: createError } = await supabase
          .from('customer_points')
          .insert([{ customer_id: customerId, total_points: 0, available_points: 0 }])
          .select()
          .single();

        if (createError) throw createError;
        return NextResponse.json(newData);
      }

      return NextResponse.json(data);
    }

    // Get all points (admin)
    const { data, error } = await supabase
      .from('customer_points')
      .select('*, profiles(name, email)')
      .order('total_points', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
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
    const { customer_id, points_change, operation } = body; // operation: 'add', 'subtract', 'redeem'

    const { data: currentData, error: fetchError } = await supabase
      .from('customer_points')
      .select('*')
      .eq('customer_id', customer_id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let available_points = currentData?.available_points || 0;
    let redeemed_points = currentData?.redeemed_points || 0;
    let total_points = currentData?.total_points || 0;

    if (operation === 'add') {
      available_points += points_change;
      total_points += points_change;
    } else if (operation === 'subtract') {
      available_points -= points_change;
    } else if (operation === 'redeem') {
      available_points -= points_change;
      redeemed_points += points_change;
    }

    const { data, error } = await supabase
      .from('customer_points')
      .upsert([
        {
          customer_id,
          total_points,
          available_points: Math.max(0, available_points),
          redeemed_points,
          last_updated: new Date().toISOString()
        }
      ], { onConflict: 'customer_id' })
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
