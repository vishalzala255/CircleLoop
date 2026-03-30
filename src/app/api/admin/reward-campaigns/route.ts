import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get('campaign_id');

    if (campaignId) {
      const { data, error } = await supabase
        .from('reward_campaigns')
        .select('*')
        .eq('id', campaignId)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    // Get all active campaigns
    const { data, error } = await supabase
      .from('reward_campaigns')
      .select('*')
      .in('status', ['Active', 'Upcoming'])
      .order('start_date', { ascending: false });

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
    const { campaign_name, campaign_description, reward_type, reward_amount, trigger_condition, start_date, end_date, target_audience, total_budget, created_by } = body;

    const { data, error } = await supabase
      .from('reward_campaigns')
      .insert([
        {
          campaign_name,
          campaign_description,
          reward_type,
          reward_amount,
          trigger_condition,
          start_date,
          end_date,
          target_audience,
          total_budget,
          already_awarded: 0,
          status: 'Upcoming',
          created_by
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
    const { campaign_id, status, already_awarded } = body;

    const { data, error } = await supabase
      .from('reward_campaigns')
      .update({
        status,
        already_awarded,
        updated_at: new Date().toISOString()
      })
      .eq('id', campaign_id)
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
