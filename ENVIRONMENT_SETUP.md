# Environment Setup Guide

## Security Best Practices

**Never commit sensitive credentials to version control!** This guide shows you how to set up environment variables securely.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://kralcmyhjvoiywcpntkg.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYWxjbXloanZvaXl3Y3BudGtnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NzM3OTAsImV4cCI6MjA3MTQ0OTc5MH0.10JbU5SR2bwJyGorKifCVqCqQcnbBR4xup7NnYxz3AE

# Project Configuration  
EXPO_PUBLIC_PROJECT_REF=kralcmyhjvoiywcpntkg
```

## How to Get Your Supabase Credentials

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to Settings → API**
4. **Copy the following values**:
   - **Project URL**: Use this as `EXPO_PUBLIC_SUPABASE_URL`
   - **anon/public key**: Use this as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
   - **Project Reference**: Extract from URL (e.g., `qxyuayjpllrndylxhgoq`) for `EXPO_PUBLIC_PROJECT_REF`

## Example .env File

```bash


## Development vs Production

### Development
- Use `.env` file for local development
- The `.env` file is already in `.gitignore` to prevent accidental commits

### Production
- For Expo builds, use Expo's environment variable system
- Set environment variables in your CI/CD pipeline
- Never expose service role keys in client-side code

## Security Notes

1. **Anon Key is Safe**: The `anon` key is designed to be public and safe to include in client-side code
2. **Service Role Key**: Never expose the service role key in client-side code
3. **Environment Variables**: Use `EXPO_PUBLIC_` prefix for variables that need to be available in the client
4. **Fallbacks**: The app includes fallback values for development, but you should always set proper environment variables

## Troubleshooting

### "Cannot find environment variable"
- Make sure your `.env` file is in the root directory
- Restart your development server after creating/modifying `.env`
- Check that variable names start with `EXPO_PUBLIC_`

### "Invalid Supabase URL"
- Ensure the URL format is correct: `https://your-project-ref.supabase.co`
- Verify your project reference is correct

### "Authentication failed"
- Check that your anon key is correct
- Ensure your Supabase project is active and not paused 