const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cswnnopcsftiscuevlpw.supabase.co';
const supabaseKey = 'sb_publishable_eBfrlW1y7v0MB3I1iwjRoQ_UqyMJP4M';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.from('orders').select('*').limit(1);
  if (error) {
    console.error('Error fetching orders:', error.message);
  } else {
    console.log('Orders table exists. Data:', data);
  }
}

checkTables();
