'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Facebook, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ConnectMetaAds() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  const checkExistingConnection = async () => {
    try {
      const response = await fetch('/api/aids/meta/status');
      const data = await response.json();
      
      if (data.connected) {
        setConnected(true);
        setCurrentUser(data.user);
        setAccounts(data.accounts || []);
        setSelectedAccount(data.selectedAccount);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    }
  };

  const handleFacebookLogin = () => {
    setLoading(true);
    
    // Initialize Facebook SDK
    window.FB.login(
      async (response) => {
        if (response.authResponse) {
          const { accessToken, userID } = response.authResponse;
          
          // Save token and get ad accounts
          try {
            const res = await fetch('/api/aids/meta/connect', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                accessToken,
                userID 
              })
            });
            
            const data = await res.json();
            
            if (data.success) {
              setConnected(true);
              setAccounts(data.accounts);
              setCurrentUser(data.user);
              setError(null);
            } else {
              setError(data.error || 'Connection failed');
            }
          } catch (error) {
            setError('Failed to connect to Meta');
          }
        } else {
          setError('Facebook login cancelled');
        }
        setLoading(false);
      },
      {
        scope: 'email,ads_management,ads_read,business_management,pages_read_engagement',
        auth_type: 'rerequest'
      }
    );
  };

  const handleSelectAccount = async (accountId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/aids/meta/select-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSelectedAccount(accountId);
        // Redirect to AIDs dashboard
        setTimeout(() => {
          router.push('/app/aids');
        }, 1500);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Failed to select account');
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    if (confirm('Are you sure you want to disconnect your Meta account?')) {
      try {
        await fetch('/api/aids/meta/disconnect', { method: 'POST' });
        setConnected(false);
        setAccounts([]);
        setSelectedAccount(null);
        setCurrentUser(null);
      } catch (error) {
        console.error('Error disconnecting:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/app/aids" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to AIDs
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Connect Meta Ads Account</h1>
          <p className="text-gray-600">
            Connect your Meta Business account to start managing your ad campaigns with AIDs
          </p>
        </div>

        {/* Connection Status */}
        {connected && currentUser && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="text-green-900 font-medium">Connected as {currentUser.name}</p>
                  <p className="text-green-700 text-sm">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Connect Button */}
        {!connected && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Facebook className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Connect Your Meta Business Account
              </h2>
              <p className="text-gray-600 mb-6">
                Grant AIDs permission to manage your ad campaigns
              </p>
            </div>

            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="w-5 h-5 mr-2" />
                  Connect with Facebook
                </>
              )}
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p className="mb-2">We'll request access to:</p>
              <ul className="text-left inline-block">
                <li>✓ Read your ad account data</li>
                <li>✓ Create and manage campaigns</li>
                <li>✓ View performance metrics</li>
                <li>✓ Manage ad creatives</li>
              </ul>
            </div>
          </div>
        )}

        {/* Account Selection */}
        {connected && accounts.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Select Ad Account
            </h2>
            <p className="text-gray-600 mb-6">
              Choose which ad account AIDs should manage:
            </p>

            <div className="space-y-3">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedAccount === account.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectAccount(account.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{account.name}</p>
                      <p className="text-sm text-gray-600">ID: {account.id}</p>
                      <p className="text-sm text-gray-500">
                        Currency: {account.currency} • 
                        Timezone: {account.timezone_name}
                      </p>
                    </div>
                    {selectedAccount === account.id && (
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedAccount && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => router.push('/app/aids')}
                  className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Go to AIDs Dashboard →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ol className="list-decimal list-inside text-blue-800 space-y-1">
            <li>Connect your Facebook account</li>
            <li>Select your ad account</li>
            <li>AIDs starts optimizing your campaigns</li>
            <li>Octavia AI analyzes and improves performance 24/7</li>
          </ol>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By connecting, you agree to our{' '}
            <Link href="/privacy" className="text-purple-600 hover:underline">
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link href="/terms" className="text-purple-600 hover:underline">
              Terms of Service
            </Link>
          </p>
        </div>
      </div>

      {/* Facebook SDK */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.fbAsyncInit = function() {
              FB.init({
                appId: '${process.env.NEXT_PUBLIC_META_APP_ID || '1994469434647099'}',
                cookie: true,
                xfbml: true,
                version: 'v18.0'
              });
            };
            (function(d, s, id){
              var js, fjs = d.getElementsByTagName(s)[0];
              if (d.getElementById(id)) {return;}
              js = d.createElement(s); js.id = id;
              js.src = "https://connect.facebook.net/en_US/sdk.js";
              fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
          `
        }}
      />
    </div>
  );
}