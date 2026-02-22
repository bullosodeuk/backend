# Vercel Deployment Guide

## Pre-Deployment Checklist

✅ Fixed `package.json` - Removed `"type": "module"`
✅ Updated `tsconfig.json` - Changed to `"module": "commonjs"`
✅ Fixed TypeScript compilation errors
✅ `vercel.json` is properly configured

## Deployment Steps

### 1. Deploy to Vercel

```bash
vercel
```

This will:
- Build your TypeScript code
- Deploy to a preview URL
- Give you a deployment URL to test

### 2. Set Environment Variables

After deploying, go to your Vercel dashboard and add these environment variables:

**Required for Production:**
```
NODE_ENV=production
PORT=8080
CORS_ORIGIN=*
OPENAI_API_KEY=your_actual_openai_api_key
GPT_MODEL=gpt-4o
```

**For Phase 1 (when database is ready):**
```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key
DATABASE_URL=your_postgres_connection_string
```

### 3. Deploy to Production

After setting environment variables:

```bash
vercel --prod
```

This deploys to your production domain.

## Testing Your Deployment

Once deployed, test your endpoints:

### Test Health Check
```bash
curl https://your-app.vercel.app/health
```

### Test Chat Endpoint
```bash
curl -N -X POST https://your-app.vercel.app/api/chat/message \
  -H "Content-Type: application/json" \
  -H "Accept: text/event-stream" \
  -d '{"userId":"test-user","message":"Say hello"}'
```

## Common Errors & Solutions

### Error: FUNCTION_INVOCATION_FAILED

**Causes:**
1. Missing environment variables (especially `OPENAI_API_KEY`)
2. Module resolution issues (fixed by using CommonJS)
3. Runtime errors in code

**Solutions:**
- Check Vercel logs: `vercel logs`
- Verify all environment variables are set
- Test locally first: `npm run dev`

### Error: Module not found

**Cause:** Import paths or missing dependencies

**Solution:**
- Ensure all dependencies are in `dependencies` (not `devDependencies`)
- Check import paths are correct

### Error: Timeout

**Cause:** OpenAI API taking too long (60s limit on Hobby plan)

**Solution:**
- Use `gpt-4o-mini` for faster responses
- Optimize prompts to be shorter

## Environment Variables via CLI

You can also set environment variables via CLI:

```bash
# Set a single variable
vercel env add OPENAI_API_KEY

# Pull environment variables locally
vercel env pull
```

## Checking Logs

View real-time logs:
```bash
vercel logs --follow
```

View logs for a specific deployment:
```bash
vercel logs [deployment-url]
```

## Rollback

If something breaks:
```bash
# List deployments
vercel list

# Promote a previous deployment to production
vercel promote [deployment-url]
```

## Domain Configuration

### Add Custom Domain

1. Go to Vercel dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

### Example:
- `api.travlr.com` → Your Vercel deployment

## Vercel Limits (Hobby Plan)

- ✅ 100GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Serverless functions
- ⚠️ 60-second function timeout
- ⚠️ 1024MB function memory

## Production Checklist

Before going live:

- [ ] All environment variables set
- [ ] HTTPS working (automatic with Vercel)
- [ ] Health check endpoint responds
- [ ] Chat endpoint tested with real API key
- [ ] Rate limiting verified (50 req/15min)
- [ ] Error handling tested
- [ ] iOS app tested against production URL
- [ ] Custom domain configured (optional)
- [ ] Monitoring set up (Vercel dashboard)

## Monitoring

Vercel provides built-in monitoring:
- View in dashboard: https://vercel.com/dashboard
- Check function invocations
- View error rates
- Monitor response times

## Cost Estimate

**Hobby Plan (Free):**
- Up to 100GB bandwidth
- Sufficient for < 1K users
- ~1K-10K API requests/month

**If you exceed free tier:**
- Pro Plan: $20/month
- Unlimited bandwidth
- Advanced analytics

## Next Steps After Deployment

1. **Test all endpoints** with production URL
2. **Update iOS app** to use Vercel URL
3. **Set up Phase 1 database** (Supabase)
4. **Add database environment variables**
5. **Uncomment database code** in chat.ts
6. **Redeploy** after database integration

---

**Deployed URL:** Update this after deploying
**Last Deployed:** Update this timestamp
**Status:** ✅ Ready for deployment
