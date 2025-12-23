import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User.model.js';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

console.log('Passport Config - OAuth Credentials Check:', {
  hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
  hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  hasGithubId: !!process.env.GITHUB_CLIENT_ID,
  hasGithubSecret: !!process.env.GITHUB_CLIENT_SECRET
});

// Configure Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  console.log('Registering Google OAuth Strategy');
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });
          
          if (user) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            await user.save();
          } else {
            user = await User.create({
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
              avatar: profile.photos[0]?.value || '',
              authProvider: 'google',
              isEmailVerified: true
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  ));
}

// Configure GitHub OAuth Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  console.log('Registering GitHub OAuth Strategy');
  passport.use(new GitHubStrategy({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id });

        if (!user) {
          const email = profile.emails && profile.emails[0]?.value;
          
          if (email) {
            user = await User.findOne({ email });
          }
          
          if (user) {
            user.githubId = profile.id;
            user.authProvider = 'github';
            user.isEmailVerified = true;
            await user.save();
          } else {
            user = await User.create({
              githubId: profile.id,
              name: profile.displayName || profile.username,
              email: email || `${profile.username}@github.local`,
              avatar: profile.photos[0]?.value || '',
              authProvider: 'github',
              isEmailVerified: true
            });
          }
        }

        done(null, user);
      } catch (error) {
        done(error, null);
      }
    }
  ));
}

export default passport;
