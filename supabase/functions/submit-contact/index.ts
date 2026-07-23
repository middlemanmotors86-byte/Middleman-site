import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limit configuration
const RATE_LIMIT_WINDOW_MINUTES = 15;
const MAX_SUBMISSIONS_PER_WINDOW = 3;

// Allowed file types for attachments
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv'
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const MAX_FILES = 5;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from headers (Supabase edge functions provide this)
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log(`Contact form submission from IP: ${clientIP}`);

    // Parse form data (supports multipart/form-data for file uploads)
    const contentType = req.headers.get('content-type') || '';
    let name: string, email: string, phone: string | null, message: string;
    let files: { name: string; type: string; data: Uint8Array }[] = [];

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      name = formData.get('name') as string;
      email = formData.get('email') as string;
      phone = formData.get('phone') as string | null;
      message = formData.get('message') as string;
      
      // Extract files
      const fileEntries = formData.getAll('files');
      for (const entry of fileEntries) {
        if (entry instanceof File) {
          if (files.length >= MAX_FILES) {
            console.log('Too many files uploaded');
            return new Response(
              JSON.stringify({ error: `Maximum ${MAX_FILES} files allowed` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (!ALLOWED_MIME_TYPES.includes(entry.type)) {
            console.log(`Invalid file type: ${entry.type}`);
            return new Response(
              JSON.stringify({ error: `File type not allowed: ${entry.name}` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          if (entry.size > MAX_FILE_SIZE) {
            console.log(`File too large: ${entry.name}`);
            return new Response(
              JSON.stringify({ error: `File too large: ${entry.name} (max 20MB)` }),
              { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
          
          const arrayBuffer = await entry.arrayBuffer();
          files.push({
            name: entry.name,
            type: entry.type,
            data: new Uint8Array(arrayBuffer)
          });
        }
      }
    } else {
      // JSON request (no files)
      const body = await req.json();
      name = body.name;
      email = body.email;
      phone = body.phone;
      message = body.message;
    }

    // Validate required fields
    if (!name || !email || !message) {
      console.log('Validation failed: missing required fields');
      return new Response(
        JSON.stringify({ error: 'Name, email, and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Validation failed: invalid email format');
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate field lengths
    if (name.length > 100 || email.length > 255 || (phone && phone.length > 20) || message.length > 1000) {
      console.log('Validation failed: field length exceeded');
      return new Response(
        JSON.stringify({ error: 'Field length exceeded maximum allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for rate limit tracking and file uploads
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check rate limit - count submissions from this IP in the time window
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MINUTES * 60 * 1000).toISOString();
    
    const { data: recentSubmissions, error: rateLimitError } = await supabase
      .from('rate_limit_tracking')
      .select('id')
      .eq('identifier', clientIP)
      .eq('action', 'contact_submission')
      .gte('created_at', windowStart);

    if (rateLimitError) {
      console.error('Rate limit check error:', rateLimitError);
      // Continue anyway - don't block legitimate users due to rate limit errors
    }

    const submissionCount = recentSubmissions?.length || 0;
    console.log(`IP ${clientIP} has ${submissionCount} submissions in the last ${RATE_LIMIT_WINDOW_MINUTES} minutes`);

    if (submissionCount >= MAX_SUBMISSIONS_PER_WINDOW) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ 
          error: 'Too many submissions. Please try again later.',
          retryAfter: RATE_LIMIT_WINDOW_MINUTES * 60
        }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Retry-After': String(RATE_LIMIT_WINDOW_MINUTES * 60)
          } 
        }
      );
    }

    // Insert contact submission using service role (to get the ID back)
    const { data: submission, error: insertError } = await supabase
      .from('contact_submissions')
      .insert({
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || null,
        message: message.trim(),
      })
      .select('id')
      .single();

    if (insertError) {
      console.error('Contact submission insert error:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to submit contact form' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upload files if any
    if (files.length > 0 && submission) {
      console.log(`Uploading ${files.length} files for submission ${submission.id}`);
      
      for (const file of files) {
        const timestamp = Date.now();
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const filePath = `contact-attachments/${submission.id}/${timestamp}-${sanitizedName}`;
        
        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file.data, {
            contentType: file.type,
          });

        if (uploadError) {
          console.error(`Error uploading file ${file.name}:`, uploadError);
          continue; // Continue with other files
        }

        // Create document record
        const { error: docError } = await supabase
          .from('document_uploads')
          .insert({
            file_name: file.name,
            file_path: filePath,
            file_size: file.data.length,
            mime_type: file.type,
            contact_submission_id: submission.id,
          });

        if (docError) {
          console.error(`Error creating document record for ${file.name}:`, docError);
        }
      }
    }

    // Track this submission for rate limiting (using service role)
    const { error: trackError } = await supabase
      .from('rate_limit_tracking')
      .insert({
        identifier: clientIP,
        action: 'contact_submission',
      });

    if (trackError) {
      console.error('Rate limit tracking error:', trackError);
      // Don't fail the request - the submission was successful
    }

    console.log(`Contact form submitted successfully from IP: ${clientIP}`);
    
    return new Response(
      JSON.stringify({ success: true, message: 'Contact form submitted successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in submit-contact function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
