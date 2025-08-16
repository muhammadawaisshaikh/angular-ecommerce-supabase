export const environment = {
  production: false,
  supabase: {
    url: process.env['SUPABASE_URL'] || 'YOUR_SUPABASE_URL',
    anonKey: process.env['SUPABASE_ANON_KEY'] || 'YOUR_SUPABASE_ANON_KEY'
  }
};