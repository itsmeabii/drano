import { supabase } from '@/app/lib/supabase/createClient'

export default async function Home() {
  console.log('Supabase connected:', !!supabase)
  
  return (
    <main>
      <h1>Drano 💸</h1>
      <p>Drain the debt. Manifest the wealth.</p>
    </main>
  )
}