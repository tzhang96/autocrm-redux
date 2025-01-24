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
    (auth.jwt() -> 'user_metadata' ->> 'role')::text = 'admin'
  );

-- Policy for agents to read ticket participants
CREATE POLICY "Agents can read ticket participants"
  ON users
  FOR SELECT
  USING (
    -- Check if the current user is an agent
    ((auth.jwt() -> 'user_metadata' ->> 'role')::text = 'agent' AND
    -- And the target user is either:
    (
      -- A ticket creator where the agent is assigned
      EXISTS (
        SELECT 1 FROM tickets
        WHERE tickets.created_by = users.user_id
        AND tickets.assigned_to = auth.uid()
      )
      OR
      -- A message sender where the agent is assigned to the ticket
      EXISTS (
        SELECT 1 FROM messages
        JOIN tickets ON tickets.ticket_id = messages.ticket_id
        WHERE messages.user_id = users.user_id
        AND tickets.assigned_to = auth.uid()
      )
    ))
  );

-- Policy to allow the trigger to create users
CREATE POLICY "Allow trigger to create users"
  ON users
  FOR INSERT
  WITH CHECK (true);  -- Since this is controlled by our trigger which runs with SECURITY DEFINER 