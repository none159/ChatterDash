'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { login, oAuthSignIn } from './actions';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faGoogle } from '@fortawesome/free-brands-svg-icons';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Handle form submission for login


  return (
    <div className="flex min-h-screen items-center justify-center ">
      <div className="w-full max-w-md p-8  border shadow-md rounded-lg">
        <h1 className="text-2xl font-bold text-center mb-6">Login</h1>
    
        <form className="space-y-4">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700">Email:</Label>
            <Input id="email" name="email" type="email" required />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700">Password:</Label>
            <Input id="password" name="password" type="password" required />
          </div>
          <div className="mt-4 flex gap-2">
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" formAction={login} className="w-full bg-white text-blue-500 hover:bg-blue-500 hover:text-white" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </form>
        
        <div className="mt-4">
          <Button
            onClick={async () => {
              await oAuthSignIn('google');
            }}
            className="flex items-center justify-center w-full bg-blue-500 hover:bg-white hover:text-blue-500 text-white font-semibold py-2 px-4 rounded-md shadow-sm  transition-all  ease-in-out duration-[350ms]"
            disabled={loading}
          >
            <FontAwesomeIcon icon={faGoogle} className="mr-2" />
            {loading ? 'Logging in...' : 'Login with Google'}
          </Button>
        </div>
   


        <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{' '}
          <a href="/signup" className="text-blue-500 hover:underline">
            Register here
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
