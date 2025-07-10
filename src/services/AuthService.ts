import { supabase } from '@/config/supabase';
import { analytics } from '@/utils/analytics';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  streak: number;
  total_xp: number;
  current_level: number;
  daily_goal: number;
  created_at: string;
  updated_at: string;
  last_active_at: string;
}

class AuthService {
  /**
   * Sign up a new user
   */
  async signUp({ email, password, name }: SignUpData) {
    try {
      console.log('🔐 Starting sign up process for:', email);
      console.log('🔐 Password length:', password.length);
      console.log('🔐 Email validation:', email.includes('@'));
      console.log('🔐 Password validation:', password.length >= 6);
      
      // Auth user creation with metadata
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (authError) {
        console.error('❌ Auth error during signup:', authError);
        console.error('❌ Full auth error:', JSON.stringify(authError, null, 2));
        
        // More specific error handling
        if (authError.message.includes('email')) {
          throw new Error('Invalid email address or email already registered');
        }
        if (authError.message.includes('password')) {
          throw new Error('Password must be at least 6 characters long');
        }
        if (authError.message.includes('Database error')) {
          throw new Error('Supabase database error. Please check your project status and try again.');
        }
        if (authError.message.includes('signup')) {
          throw new Error('Sign up is disabled or misconfigured. Please contact support.');
        }
        
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!authData.user) {
        console.error('❌ No user returned from auth signup');
        throw new Error('Failed to create user account');
      }

      console.log('✅ Auth user created successfully:', authData.user.id);

      // Now create the user profile (re-enabled since auth is working)
      console.log('📝 Creating user profile in users table...');
      
      // Try direct insert first
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: authData.user.email!,
          name,
          streak: 0,
          total_xp: 0,
          current_level: 1,
          daily_goal: 15,
        });

      if (profileError) {
        console.error('❌ Profile creation failed:', profileError);
        
        // Don't throw error - auth user is created, profile can be created later
        console.log('⚠️ Continuing without profile - will be created on first login');
      } else {
        console.log('✅ User profile created successfully');
      }

      analytics.logEvent('user_signed_up', {
        method: 'email',
        user_id: authData.user.id,
      });

      console.log('🎉 Sign up completed successfully');
      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('❌ Sign up error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('An account with this email already exists');
        }
        if (error.message.includes('users')) {
          throw new Error('Database error: Unable to create user profile. Please contact support.');
        }
      }
      
      throw error;
    }
  }

  /**
   * Sign in existing user
   */
  async signIn({ email, password }: SignInData) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Update last active timestamp
      if (data.user) {
        await this.updateLastActive(data.user.id);
        
        analytics.logEvent('user_signed_in', {
          method: 'email',
          user_id: data.user.id,
        });
      }

      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out current user
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Clear local storage
      await AsyncStorage.multiRemove([
        'user_preferences',
        'cached_lessons',
        'push_token',
      ]);

      analytics.logEvent('user_signed_out', {});
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get user profile error:', error);
        
        // If profile doesn't exist (PGRST116), create it
        if (error.code === 'PGRST116') {
          console.log('👤 Profile not found, creating default profile...');
          
          // Get user info from auth
          const { data: authUser } = await supabase.auth.getUser();
          
          if (authUser.user) {
            const newProfile = {
              id: authUser.user.id,
              email: authUser.user.email!,
              name: authUser.user.user_metadata?.name || authUser.user.email!.split('@')[0],
              streak: 0,
              total_xp: 0,
              current_level: 1,
              daily_goal: 15,
            };
            
            // Try to create the profile
            const { data: createdProfile, error: createError } = await supabase
              .from('users')
              .insert(newProfile)
              .select()
              .single();
            
            if (createError) {
              console.error('❌ Failed to create profile:', createError);
              return null;
            }
            
            console.log('✅ Profile created successfully');
            return createdProfile as UserProfile;
          }
        }
        
        return null;
      }
      
      return data as UserProfile;
    } catch (error) {
      console.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      analytics.logEvent('user_profile_updated', {
        user_id: userId,
        fields_updated: Object.keys(updates),
      });

      return data as UserProfile;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Update last active timestamp
   */
  async updateLastActive(userId: string) {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          last_active_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Update last active error:', error);
      // Don't throw as this is not critical
    }
  }

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'luminafaith://reset-password',
      });

      if (error) throw error;

      analytics.logEvent('password_reset_requested', {
        email,
      });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      analytics.logEvent('password_updated', {});
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      // This is a simple check by attempting to reset password
      // In production, you might want a dedicated endpoint
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'luminafaith://check-email',
      });

      // If no error, email exists
      return !error;
    } catch (error) {
      return false;
    }
  }

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      
      analytics.logEvent('auth_state_changed', {
        event,
        user_id: session?.user?.id || null,
      });

      callback(session);
    });
  }

  /**
   * Refresh current session
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error('Refresh session error:', error);
      return null;
    }
  }
}

export const authService = new AuthService();
export default authService;