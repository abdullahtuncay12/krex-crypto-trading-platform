-- Demo Completed Trades for Performance Display
-- This script adds sample completed trades to demonstrate the performance tracking feature

-- First, we need to create some trading signals to reference
INSERT INTO trading_signals (id, cryptocurrency, signal_type, recommendation, confidence, entry_price, stop_loss, limit_order, created_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'BTC', 'premium', 'buy', 85, 45000.00, 43000.00, 47250.00, NOW() - INTERVAL '5 days'),
  ('22222222-2222-2222-2222-222222222222', 'ETH', 'premium', 'buy', 80, 2500.00, 2400.00, 2700.00, NOW() - INTERVAL '7 days'),
  ('33333333-3333-3333-3333-333333333333', 'SOL', 'premium', 'buy', 90, 100.00, 95.00, 115.00, NOW() - INTERVAL '10 days'),
  ('44444444-4444-4444-4444-444444444444', 'BNB', 'premium', 'buy', 75, 300.00, 290.00, 318.00, NOW() - INTERVAL '12 days'),
  ('55555555-5555-5555-5555-555555555555', 'ADA', 'premium', 'buy', 70, 0.50, 0.48, 0.52, NOW() - INTERVAL '15 days'),
  ('66666666-6666-6666-6666-666666666666', 'XRP', 'premium', 'buy', 85, 0.60, 0.57, 0.66, NOW() - INTERVAL '18 days'),
  ('77777777-7777-7777-7777-777777777777', 'DOT', 'premium', 'buy', 80, 7.00, 6.70, 7.70, NOW() - INTERVAL '20 days'),
  ('88888888-8888-8888-8888-888888888888', 'MATIC', 'premium', 'buy', 95, 0.90, 0.85, 1.08, NOW() - INTERVAL '22 days'),
  ('99999999-9999-9999-9999-999999999999', 'AVAX', 'premium', 'buy', 85, 35.00, 33.00, 38.50, NOW() - INTERVAL '25 days'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BTC', 'premium', 'buy', 80, 46000.00, 44000.00, 48300.00, NOW() - INTERVAL '28 days'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ETH', 'premium', 'buy', 85, 2600.00, 2500.00, 2808.00, NOW() - INTERVAL '30 days'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'DOGE', 'premium', 'buy', 75, 0.08, 0.07, 0.10, NOW() - INTERVAL '32 days'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SOL', 'premium', 'buy', 90, 105.00, 100.00, 115.50, NOW() - INTERVAL '35 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BNB', 'premium', 'buy', 75, 310.00, 300.00, 325.50, NOW() - INTERVAL '38 days'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'XRP', 'premium', 'buy', 85, 0.62, 0.59, 0.71, NOW() - INTERVAL '40 days')
ON CONFLICT (id) DO NOTHING;

-- Now insert the completed trades
INSERT INTO completed_trades (signal_id, cryptocurrency, entry_price, exit_price, profit_percent, entry_date, exit_date, signal_type)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'BTC', 45000.00, 47250.00, 5.00, NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', 'premium'),
  ('22222222-2222-2222-2222-222222222222', 'ETH', 2500.00, 2700.00, 8.00, NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', 'premium'),
  ('33333333-3333-3333-3333-333333333333', 'SOL', 100.00, 115.00, 15.00, NOW() - INTERVAL '10 days', NOW() - INTERVAL '4 days', 'premium'),
  ('44444444-4444-4444-4444-444444444444', 'BNB', 300.00, 318.00, 6.00, NOW() - INTERVAL '12 days', NOW() - INTERVAL '6 days', 'premium'),
  ('55555555-5555-5555-5555-555555555555', 'ADA', 0.50, 0.52, 4.00, NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days', 'premium'),
  ('66666666-6666-6666-6666-666666666666', 'XRP', 0.60, 0.66, 10.00, NOW() - INTERVAL '18 days', NOW() - INTERVAL '10 days', 'premium'),
  ('77777777-7777-7777-7777-777777777777', 'DOT', 7.00, 7.70, 10.00, NOW() - INTERVAL '20 days', NOW() - INTERVAL '12 days', 'premium'),
  ('88888888-8888-8888-8888-888888888888', 'MATIC', 0.90, 1.08, 20.00, NOW() - INTERVAL '22 days', NOW() - INTERVAL '14 days', 'premium'),
  ('99999999-9999-9999-9999-999999999999', 'AVAX', 35.00, 38.50, 10.00, NOW() - INTERVAL '25 days', NOW() - INTERVAL '16 days', 'premium'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'BTC', 46000.00, 48300.00, 5.00, NOW() - INTERVAL '28 days', NOW() - INTERVAL '20 days', 'premium'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ETH', 2600.00, 2808.00, 8.00, NOW() - INTERVAL '30 days', NOW() - INTERVAL '22 days', 'premium'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'DOGE', 0.08, 0.10, 25.00, NOW() - INTERVAL '32 days', NOW() - INTERVAL '24 days', 'premium'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'SOL', 105.00, 115.50, 10.00, NOW() - INTERVAL '35 days', NOW() - INTERVAL '26 days', 'premium'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'BNB', 310.00, 325.50, 5.00, NOW() - INTERVAL '38 days', NOW() - INTERVAL '28 days', 'premium'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'XRP', 0.62, 0.71, 14.52, NOW() - INTERVAL '40 days', NOW() - INTERVAL '30 days', 'premium');
