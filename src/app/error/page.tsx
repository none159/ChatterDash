'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message') || 'Sorry, something went wrong';

  return (
  <section className='grid gap-5 text-2xl place-content-center relative top-[100px] text-center'>
  <p>{message}</p>
  <Button><Link href="/room/list">Go Back</Link></Button>
  </section>
  );
}
