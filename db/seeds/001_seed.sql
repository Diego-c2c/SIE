-- Activity types calés sur le planning Surf It Easy
INSERT INTO activity_types (code, label, description) VALUES
  ('surf_beginner', 'Surf lesson – Beginners', 'Cours de surf débutant'),
  ('surf_intermediate', 'Surf lesson – Intermediate', 'Cours de surf intermédiaire'),
  ('surf_advanced', 'Surf lesson – Advanced', 'Surfcoaching with video analysis'),
  ('surfskate', 'Surfskate', 'Technical training on land'),
  ('street_skate', 'Street skate', 'Street skate – all levels'),
  ('bike_tour', 'Bike tour', 'Lets discover Peniche by bike'),
  ('surf_tip', 'Surf tip', 'Surf forecast analysis')
ON CONFLICT (code) DO NOTHING;