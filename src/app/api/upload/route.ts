import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceRoleKey
      });
      return NextResponse.json({ error: '服务器配置错误' }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: '请选择文件' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: '文件大小超过 10MB 限制' }, { status: 400 });
    }

    const supabase = createAdminClient();
    
    // Generate safe ASCII filename (Supabase doesn't support non-ASCII chars in keys)
    const ext = file.name.split('.').pop() || '';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    // Use only timestamp + random string, keep extension ASCII-safe
    const safeExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    const filename = `${timestamp}-${randomStr}.${safeExt}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log('Uploading file:', {
      filename,
      size: file.size,
      type: file.type
    });

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('media')
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ 
        error: '上传失败', 
        details: uploadError.message 
      }, { status: 500 });
    }

    console.log('Upload successful:', uploadData);

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('media')
      .getPublicUrl(filename);

    // Determine file type
    const type = file.type.startsWith('image/') ? 'image' :
                 file.type.startsWith('video/') ? 'video' :
                 file.type.includes('pdf') || file.type.includes('document') ? 'document' : 'other';

    // Save to database
    const { error: dbError } = await supabase
      .from('media')
      .insert({
        filename,
        original_filename: file.name,
        url: publicUrl,
        type,
        size: file.size,
        mime_type: file.type,
        uploaded_by: null,
      });

    if (dbError) {
      console.error('Error saving media record:', dbError);
      // Don't fail the request, just log the error
    }

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      filename,
      original_filename: file.name,
      type,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: '上传失败', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// Increase body size limit for file uploads
export const runtime = 'nodejs';
export const maxDuration = 60;
