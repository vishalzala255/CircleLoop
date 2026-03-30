import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (code) {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        return NextResponse.json(
          { error: 'Coupon not found' },
          { status: 404 }
        );
      }

      // Check if coupon is valid
      const now = new Date();
      if (new Date(data.valid_until) < now || data.status !== 'Active') {
        return NextResponse.json(
          { error: 'Coupon expired or inactive' },
          { status: 400 }
        );
      }

      if (data.max_uses && data.current_uses >= data.max_uses) {
        return NextResponse.json(
          { error: 'Coupon usage limit reached' },
          { status: 400 }
        );
      }

      return NextResponse.json(data);
    }

    // Get all active coupons
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('status', 'Active')
      .order('created_at', { ascending: false });

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
    const { code, title, description, discount_type, discount_value, max_uses, min_purchase_amount, valid_from, valid_until, applicable_categories } = body;

    const { data, error } = await supabase
      .from('coupons')
      .insert([
        {
          code: code.toUpperCase(),
          title,
          description,
          discount_type,
          discount_value,
          max_uses,
          min_purchase_amount,
          valid_from,
          valid_until,
          applicable_categories,
          status: 'Active'
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
