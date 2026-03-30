import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { current_stage, updated_fields } = body;

    const updateData: any = {
      current_stage,
      updated_at: new Date().toISOString(),
      ...updated_fields,
    };

    const { data, error } = await supabase
      .from('waste_tracking')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;

    // Log to audit table
    await supabase.from('waste_tracking_audit').insert([
      {
        waste_tracking_id: id,
        stage: current_stage,
        action: 'Stage updated',
        notes: JSON.stringify(updated_fields),
      },
    ]);

    return NextResponse.json({ success: true, data: data[0] });
  } catch (error) {
    console.error('Error updating waste tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update waste tracking' },
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from('waste_tracking')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Fetch audit log
    const { data: auditLog, error: auditError } = await supabase
      .from('waste_tracking_audit')
      .select('*')
      .eq('waste_tracking_id', id)
      .order('created_at', { ascending: false });

    if (auditError) throw auditError;

    return NextResponse.json({ success: true, data, auditLog });
  } catch (error) {
    console.error('Error fetching waste tracking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch waste tracking' },
      { status: 500 }
    );
  }
}
