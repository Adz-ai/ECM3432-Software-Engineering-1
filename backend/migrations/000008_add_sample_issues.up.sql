-- Add sample issues from December 2024 to March 2025
-- This will create a variety of issues with different statuses, types, and dates

-- December 2024 Issues
INSERT INTO issues (type, status, description, latitude, longitude, images, reported_by, assigned_to, created_at, updated_at)
VALUES
  ('POTHOLE', 'NEW', 'Large pothole on Main Street causing vehicle damage', 50.7184, -3.5339, '{}', 'john.doe@example.com', NULL, '2024-12-01T09:30:00Z', '2024-12-01T09:30:00Z'),
  ('STREET_LIGHT', 'IN_PROGRESS', 'Street light flickering at night on Church Road', 50.7220, -3.5336, '{}', 'sarah.smith@example.com', 2, '2024-12-02T14:20:00Z', '2024-12-03T10:15:00Z'),
  ('GRAFFITI', 'RESOLVED', 'Offensive graffiti on public bench in Central Park', 50.7190, -3.5290, '{}', 'mike.jenkins@example.com', 5, '2024-12-03T08:45:00Z', '2024-12-10T16:30:00Z'),
  ('ANTI_SOCIAL', 'RESOLVED', 'Loud noise from group gathering late at night', 50.7245, -3.5275, '{}', 'linda.brown@example.com', 4, '2024-12-04T22:10:00Z', '2024-12-12T11:40:00Z'),
  ('FLY_TIPPING', 'NEW', 'Furniture dumped on Oak Lane', 50.7150, -3.5400, '{}', 'robert.jones@example.com', NULL, '2024-12-05T15:25:00Z', '2024-12-05T15:25:00Z'),
  ('BLOCKED_DRAIN', 'IN_PROGRESS', 'Blocked storm drain causing flooding on High Street', 50.7200, -3.5350, '{}', 'emma.wilson@example.com', 1, '2024-12-06T11:05:00Z', '2024-12-07T09:20:00Z'),
  ('POTHOLE', 'RESOLVED', 'Multiple potholes damaged by winter weather', 50.7225, -3.5310, '{}', 'thomas.harris@example.com', 2, '2024-12-08T10:15:00Z', '2024-12-15T14:45:00Z'),
  ('STREET_LIGHT', 'RESOLVED', 'Street light completely out at dangerous junction', 50.7170, -3.5320, '{}', 'olivia.green@example.com', 1, '2024-12-09T16:40:00Z', '2024-12-18T15:10:00Z'),
  ('GRAFFITI', 'NEW', 'New graffiti appeared on school wall', 50.7240, -3.5360, '{}', 'william.clark@example.com', NULL, '2024-12-10T13:30:00Z', '2024-12-10T13:30:00Z'),
  ('ANTI_SOCIAL', 'IN_PROGRESS', 'Repeated anti-social behavior at bus station', 50.7210, -3.5370, '{}', 'sophia.taylor@example.com', 4, '2024-12-12T18:00:00Z', '2024-12-13T09:50:00Z'),
  ('FLY_TIPPING', 'RESOLVED', 'Construction waste dumped near river', 50.7180, -3.5300, '{}', 'james.anderson@example.com', 5, '2024-12-14T09:20:00Z', '2024-12-20T11:25:00Z'),
  ('BLOCKED_DRAIN', 'RESOLVED', 'Persistent drain blockage causing smell', 50.7195, -3.5345, '{}', 'charlotte.white@example.com', 2, '2024-12-15T14:10:00Z', '2024-12-22T10:30:00Z'),
  ('POTHOLE', 'NEW', 'Deep pothole causing safety hazard for cyclists', 50.7235, -3.5325, '{}', 'daniel.johnson@example.com', NULL, '2024-12-17T11:50:00Z', '2024-12-17T11:50:00Z'),
  ('STREET_LIGHT', 'IN_PROGRESS', 'Three consecutive street lights not working', 50.7215, -3.5380, '{}', 'amelia.martin@example.com', 1, '2024-12-18T10:00:00Z', '2024-12-19T14:15:00Z'),
  ('GRAFFITI', 'RESOLVED', 'Extensive graffiti on underpass walls', 50.7190, -3.5395, '{}', 'joseph.walker@example.com', 5, '2024-12-20T15:40:00Z', '2024-12-27T12:20:00Z');

-- January 2025 Issues
INSERT INTO issues (type, status, description, latitude, longitude, images, reported_by, assigned_to, created_at, updated_at)
VALUES
  ('ANTI_SOCIAL', 'NEW', 'Suspicious activity around closed business premises', 50.7205, -3.5330, '{}', 'grace.roberts@example.com', NULL, '2025-01-02T20:15:00Z', '2025-01-02T20:15:00Z'),
  ('FLY_TIPPING', 'IN_PROGRESS', 'Household waste dumped in woodland area', 50.7175, -3.5365, '{}', 'henry.davis@example.com', 4, '2025-01-03T12:30:00Z', '2025-01-04T09:45:00Z'),
  ('BLOCKED_DRAIN', 'RESOLVED', 'Drain backing up during heavy rain', 50.7230, -3.5340, '{}', 'lily.jackson@example.com', 2, '2025-01-05T08:20:00Z', '2025-01-12T16:10:00Z'),
  ('POTHOLE', 'RESOLVED', 'Series of potholes damaging vehicles', 50.7165, -3.5305, '{}', 'samuel.thompson@example.com', 1, '2025-01-07T09:40:00Z', '2025-01-15T14:30:00Z'),
  ('STREET_LIGHT', 'NEW', 'Street light damaged in vehicle collision', 50.7255, -3.5355, '{}', 'victoria.wright@example.com', NULL, '2025-01-09T16:50:00Z', '2025-01-09T16:50:00Z'),
  ('GRAFFITI', 'IN_PROGRESS', 'Graffiti on historic monument', 50.7185, -3.5315, '{}', 'benjamin.hall@example.com', 5, '2025-01-10T13:10:00Z', '2025-01-11T10:05:00Z'),
  ('ANTI_SOCIAL', 'RESOLVED', 'Ongoing noise complaints from residential property', 50.7215, -3.5385, '{}', 'megan.adams@example.com', 4, '2025-01-12T21:00:00Z', '2025-01-19T12:40:00Z'),
  ('FLY_TIPPING', 'RESOLVED', 'Commercial waste dumped at recreation ground', 50.7195, -3.5375, '{}', 'ethan.scott@example.com', 5, '2025-01-14T14:35:00Z', '2025-01-22T15:20:00Z'),
  ('BLOCKED_DRAIN', 'NEW', 'Multiple blocked drains after storm', 50.7240, -3.5310, '{}', 'zoe.baker@example.com', NULL, '2025-01-16T10:25:00Z', '2025-01-16T10:25:00Z'),
  ('POTHOLE', 'IN_PROGRESS', 'Large pothole causing traffic delays', 50.7180, -3.5335, '{}', 'christopher.hill@example.com', 1, '2025-01-18T08:15:00Z', '2025-01-19T09:30:00Z'),
  ('STREET_LIGHT', 'RESOLVED', 'Entire street with lighting issues', 50.7220, -3.5350, '{}', 'isabelle.cooper@example.com', 2, '2025-01-20T15:50:00Z', '2025-01-27T11:45:00Z'),
  ('GRAFFITI', 'RESOLVED', 'Graffiti on multiple shop fronts', 50.7175, -3.5345, '{}', 'andrew.mitchell@example.com', 5, '2025-01-22T11:30:00Z', '2025-01-30T14:10:00Z'),
  ('ANTI_SOCIAL', 'NEW', 'Drug use in public park', 50.7250, -3.5320, '{}', 'natalie.evans@example.com', NULL, '2025-01-24T19:05:00Z', '2025-01-24T19:05:00Z'),
  ('FLY_TIPPING', 'IN_PROGRESS', 'Hazardous waste materials dumped', 50.7190, -3.5360, '{}', 'joshua.morgan@example.com', 4, '2025-01-26T13:40:00Z', '2025-01-27T10:20:00Z'),
  ('BLOCKED_DRAIN', 'RESOLVED', 'Recurring drain issues affecting businesses', 50.7210, -3.5325, '{}', 'faith.rogers@example.com', 2, '2025-01-28T09:55:00Z', '2025-02-04T15:35:00Z'),
  ('POTHOLE', 'RESOLVED', 'Widespread road damage after frost', 50.7170, -3.5370, '{}', 'ryan.phillips@example.com', 1, '2025-01-30T14:25:00Z', '2025-02-07T11:50:00Z');

-- February 2025 Issues
INSERT INTO issues (type, status, description, latitude, longitude, images, reported_by, assigned_to, created_at, updated_at)
VALUES
  ('STREET_LIGHT', 'NEW', 'Lighting failure in residential area', 50.7235, -3.5345, '{}', 'hannah.cook@example.com', NULL, '2025-02-01T17:30:00Z', '2025-02-01T17:30:00Z'),
  ('GRAFFITI', 'IN_PROGRESS', 'Graffiti on playground equipment', 50.7195, -3.5385, '{}', 'owen.ward@example.com', 5, '2025-02-03T12:10:00Z', '2025-02-04T09:15:00Z'),
  ('ANTI_SOCIAL', 'RESOLVED', 'Unauthorized gatherings after park closing hours', 50.7225, -3.5370, '{}', 'lucy.fisher@example.com', 4, '2025-02-05T20:45:00Z', '2025-02-12T13:30:00Z'),
  ('FLY_TIPPING', 'RESOLVED', 'Repeated dumping at same location', 50.7160, -3.5330, '{}', 'jacob.murphy@example.com', 5, '2025-02-07T11:15:00Z', '2025-02-15T10:05:00Z'),
  ('BLOCKED_DRAIN', 'NEW', 'Flooding due to blocked culvert', 50.7205, -3.5360, '{}', 'georgia.barnes@example.com', NULL, '2025-02-09T08:55:00Z', '2025-02-09T08:55:00Z'),
  ('POTHOLE', 'IN_PROGRESS', 'Multiple potholes requiring urgent attention', 50.7245, -3.5335, '{}', 'liam.walsh@example.com', 1, '2025-02-11T09:30:00Z', '2025-02-12T14:40:00Z'),
  ('STREET_LIGHT', 'RESOLVED', 'Damaged light pole posing safety risk', 50.7175, -3.5355, '{}', 'phoebe.young@example.com', 2, '2025-02-13T16:20:00Z', '2025-02-20T11:35:00Z'),
  ('GRAFFITI', 'RESOLVED', 'Extensive vandalism requiring specialist removal', 50.7215, -3.5300, '{}', 'dylan.collins@example.com', 5, '2025-02-15T10:40:00Z', '2025-02-23T15:50:00Z'),
  ('ANTI_SOCIAL', 'NEW', 'Intimidating behavior at shopping center', 50.7185, -3.5340, '{}', 'alice.bell@example.com', NULL, '2025-02-17T18:30:00Z', '2025-02-17T18:30:00Z'),
  ('FLY_TIPPING', 'IN_PROGRESS', 'Large volume of waste requiring special removal', 50.7230, -3.5365, '{}', 'harry.price@example.com', 4, '2025-02-19T13:15:00Z', '2025-02-20T09:10:00Z'),
  ('BLOCKED_DRAIN', 'RESOLVED', 'Persistent drain issues in high-risk flood area', 50.7200, -3.5310, '{}', 'rose.kelly@example.com', 2, '2025-02-21T09:05:00Z', '2025-02-28T14:25:00Z'),
  ('POTHOLE', 'RESOLVED', 'Major road damage affecting traffic flow', 50.7165, -3.5375, '{}', 'finley.graham@example.com', 1, '2025-02-23T11:45:00Z', '2025-03-03T10:30:00Z'),
  ('STREET_LIGHT', 'NEW', 'New installation not working', 50.7255, -3.5325, '{}', 'daisy.johnson@example.com', NULL, '2025-02-25T15:35:00Z', '2025-02-25T15:35:00Z'),
  ('GRAFFITI', 'IN_PROGRESS', 'Politically sensitive graffiti requiring priority removal', 50.7190, -3.5350, '{}', 'lewis.watson@example.com', 5, '2025-02-27T12:50:00Z', '2025-02-28T09:40:00Z');

-- March 2025 Issues (up to current date)
INSERT INTO issues (type, status, description, latitude, longitude, images, reported_by, assigned_to, created_at, updated_at)
VALUES
  ('ANTI_SOCIAL', 'RESOLVED', 'Ongoing issues with property damage', 50.7220, -3.5380, '{}', 'jessica.wood@example.com', 4, '2025-03-01T19:20:00Z', '2025-03-08T13:15:00Z'),
  ('FLY_TIPPING', 'RESOLVED', 'Industrial waste illegally dumped', 50.7170, -3.5315, '{}', 'oscar.king@example.com', 5, '2025-03-03T10:30:00Z', '2025-03-11T15:40:00Z'),
  ('BLOCKED_DRAIN', 'NEW', 'Multiple drains blocked after construction work', 50.7245, -3.5345, '{}', 'ruby.lee@example.com', NULL, '2025-03-05T08:10:00Z', '2025-03-05T08:10:00Z'),
  ('POTHOLE', 'IN_PROGRESS', 'Extensive road deterioration', 50.7180, -3.5370, '{}', 'sebastian.carter@example.com', 1, '2025-03-06T09:45:00Z', '2025-03-07T11:20:00Z'),
  ('STREET_LIGHT', 'RESOLVED', 'Timer issues causing lights to stay on during day', 50.7210, -3.5335, '{}', 'maya.russell@example.com', 2, '2025-03-07T14:55:00Z', '2025-03-12T09:50:00Z'),
  ('GRAFFITI', 'NEW', 'Bus shelter completely covered with graffiti', 50.7235, -3.5355, '{}', 'felix.edwards@example.com', NULL, '2025-03-08T11:25:00Z', '2025-03-08T11:25:00Z'),
  ('ANTI_SOCIAL', 'IN_PROGRESS', 'Noise complaints from unlicensed event', 50.7190, -3.5330, '{}', 'sophia.brooks@example.com', 4, '2025-03-09T22:15:00Z', '2025-03-10T09:30:00Z'),
  ('FLY_TIPPING', 'NEW', 'Recent fly-tipping incident in conservation area', 50.7225, -3.5365, '{}', 'mason.hunt@example.com', NULL, '2025-03-10T13:40:00Z', '2025-03-10T13:40:00Z'),
  ('BLOCKED_DRAIN', 'IN_PROGRESS', 'Major flooding affecting multiple properties', 50.7165, -3.5350, '{}', 'evie.fletcher@example.com', 2, '2025-03-11T09:20:00Z', '2025-03-12T10:15:00Z'),
  ('POTHOLE', 'NEW', 'Fresh pothole appeared after recent works', 50.7240, -3.5315, '{}', 'archie.roberts@example.com', NULL, '2025-03-12T08:30:00Z', '2025-03-12T08:30:00Z');
