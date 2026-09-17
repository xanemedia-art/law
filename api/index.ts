import type { Request, Response } from 'express';
import app from '../server';

export default function handler(req: any, res: any) {
  try {
    // Enable CORS for Vercel
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    );

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    // Restore true requested URL if Vercel serverless gateway rewritten it
    const originalUrl = req.headers['x-matched-path'] || req.headers['x-vercel-matched-path'] || req.headers['x-forwarded-uri'];
    if (originalUrl && typeof originalUrl === 'string' && originalUrl.startsWith('/api')) {
      req.url = originalUrl;
    }

    // Pass to Express app
    return app(req, res);
  } catch (err: any) {
    console.error('[Vercel Serverless Function Error]:', err);
    res.status(500).json({
      error: 'Vercel Serverless Function Error: ' + (err?.message || err),
      stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
    });
  }
}
