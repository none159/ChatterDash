'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { SupaBaseServer } from '@/utils/supabase/server'
import { getURL } from '@/utils/helpers'
import { Provider } from '@supabase/supabase-js'

export async function login(formData: FormData) {
  const supabase = await SupaBaseServer()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await SupaBaseServer()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
export async function oAuthSignIn(provider: Provider) {
  if (!provider) {
      return redirect('/login?message=No provider selected');
  }

  const supabase = await SupaBaseServer();
  const redirectUrl = getURL("/auth/callback");

  const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectUrl }
  });

  if (error) {
      return redirect('/login?message=Could not authenticate user');
  }

  // Wait for authentication to complete
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Fetch the authenticated user

 


  // Redirect to home if user exists
  return redirect(data.url);
}
