insert into public.blog_posts (slug, title, excerpt, content, status, published_at)
values
  ('welcome-to-lordfunded', 'Welcome to Lordfunded', 'Platform launch notes and trader rules.', 'Lordfunded provides evaluation, funded trading, payouts, KYC, and trader support workflows from one secure dashboard.', 'published', now())
on conflict (slug) do nothing;
