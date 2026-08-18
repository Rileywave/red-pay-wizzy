import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  user_id: string;
  auth_user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  referral_code: string;
  referred_by: string | null;
  balance: number;
  last_claim_at: string | null;
  rpc_purchased: boolean;
  rpc_code: string | null;
  activated?: boolean;
  activated_at?: string | null;
  profile_image: string | null;
  referral_count: number;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  country: string;
  referredBy?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const profileRequestRef = useRef<Promise<UserProfile | null> | null>(null);
  const signUpInProgressRef = useRef(false);

  const generateUserId = () => Math.floor(1000000000 + Math.random() * 9000000000).toString();

  const generateReferralCode = (firstName: string, lastName: string) => {
    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'RP';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(100 + Math.random() * 900);
    return `${initials}${timestamp}${random}`;
  };

  const fetchProfile = useCallback(async (authUser: User): Promise<UserProfile | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    if (data) return data as UserProfile;
    if (signUpInProgressRef.current) return null;

    // Older or interrupted signups can leave a valid auth account without its
    // profile row. Recreate the minimum profile so login never dead-ends.
    const email = authUser.email?.trim() ?? '';
    const emailName = email.split('@')[0]?.replace(/[^a-zA-Z]/g, '') || 'RedPay';
    const firstName = String(authUser.user_metadata?.first_name || emailName || 'RedPay');
    const lastName = String(authUser.user_metadata?.last_name || 'User');
    const recoveredProfile = {
      auth_user_id: authUser.id,
      user_id: generateUserId(),
      first_name: firstName,
      last_name: lastName,
      email,
      phone: String(authUser.user_metadata?.phone || ''),
      country: String(authUser.user_metadata?.country || 'nigeria'),
      referral_code: generateReferralCode(firstName, lastName),
      referred_by: null,
      balance: 160000,
    };

    const { error: insertError } = await supabase.from('users').insert(recoveredProfile);
    if (insertError && insertError.code !== '23505') {
      console.error('Error recovering missing profile:', insertError);
      return null;
    }

    const { data: recovered, error: recoveryReadError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (recoveryReadError) {
      console.error('Error reading recovered profile:', recoveryReadError);
      return null;
    }
    return recovered as UserProfile | null;
  }, []);

  const loadProfile = useCallback(async (authUser: User) => {
    if (!profileRequestRef.current) {
      profileRequestRef.current = fetchProfile(authUser).finally(() => {
        profileRequestRef.current = null;
      });
    }
    const profileData = await profileRequestRef.current;
    setProfile(profileData);
    return profileData;
  }, [fetchProfile]);

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      // Store access token for external API calls if needed
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
      } else {
        localStorage.removeItem('authToken');
      }
      if (session?.user) {
        void loadProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
      // Maintain token for external requests
      if (session?.access_token) {
        localStorage.setItem('authToken', session.access_token);
      } else {
        localStorage.removeItem('authToken');
      }
      // Defer any additional Supabase calls to avoid deadlocks
      if (session?.user) {
        const sessionUser = session.user;
        setTimeout(() => {
          void loadProfile(sessionUser);
        }, 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = async (data: SignUpData) => {
    signUpInProgressRef.current = true;
    try {
      // Generate unique IDs
      const userId = generateUserId();
      
      // Generate unique referral code using initials + timestamp + random
      const referralCode = generateReferralCode(data.firstName, data.lastName);

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            phone: data.phone,
            country: data.country,
          },
        },
      });

      if (authError) return { error: authError };
      if (!authData.user) return { error: new Error('No user returned') };

      // The profile insert is protected by row-level security, so we need an
      // active session before writing. Sign in if signUp didn't return one.
      if (!authData.session) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (signInError) return { error: signInError };
      }

      const storedRefCode = localStorage.getItem('referral_code');
      const referralSource = storedRefCode || data.referredBy || null;

      // Create user profile; referral link is applied server-side below
      const { error: profileError } = await supabase.from('users').insert({
        auth_user_id: authData.user.id,
        user_id: userId,
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        country: data.country,
        referral_code: referralCode,
        referred_by: null,
        balance: 160000,
      });

      if (profileError) return { error: profileError };

      signUpInProgressRef.current = false;

      // Record a pending referral — the bonus is credited when an admin
      // confirms the new user's activation payment.
      if (referralSource) {
        const { error: refError } = await supabase.rpc('apply_referral' as any, {
          _new_user_id: userId,
          _referral_code: referralSource,
        } as any);
        if (refError) console.error('Referral link failed:', refError);
        if (storedRefCode) localStorage.removeItem('referral_code');
      }

      await loadProfile(authData.user);

      return { error: null };

    } catch (error) {
      return { error };
    } finally {
      signUpInProgressRef.current = false;
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
