import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const policyType = searchParams.get('type');
    const country = searchParams.get('country');

    let query = supabase.from('policies').select('*');

    if (policyType) {
      query = query.eq('policy_type', policyType);
    }

    if (country) {
      query = query.eq('country', country);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { policy_name, policy_type, country, category, description, effective_date, source_url, enforcement_body } = body;

    const { data, error } = await supabase
      .from('policies')
      .insert([
        {
          policy_name,
          policy_type,
          country,
          category,
          description,
          effective_date,
          source_url,
          enforcement_body,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data: data[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating policy:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create policy' },
      { status: 500 }
    );
  }
}
