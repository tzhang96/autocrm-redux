-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  USING (auth.uid() = users.user_id);

-- Policy for admins to read all users
CREATE POLICY "Admins can read all users"
  ON users
  FOR SELECT
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );

-- Policy to allow the trigger to create users
CREATE POLICY "Allow trigger to create users"
  ON users
  FOR INSERT
  WITH CHECK (true);  -- Since this is controlled by our trigger which runs with SECURITY DEFINER 