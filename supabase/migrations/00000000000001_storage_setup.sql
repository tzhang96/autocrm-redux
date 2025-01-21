-- NOTE: This file is for documentation purposes.
-- Storage policies are set up through the Supabase dashboard, not through SQL migrations.

-- Bucket Configuration
/*
Name: attachments
Public: false
File Size Limit: 50MB
*/

-- Storage Policies
-- SELECT policy: View files
/*
((auth.role() = 'admin') OR 
 (EXISTS (
   SELECT 1 FROM message_attachments ma
   JOIN messages m ON m.message_id = ma.message_id
   JOIN tickets t ON t.ticket_id = m.ticket_id
   WHERE 
     name LIKE (ma.storage_path || '%')
     AND (
       (auth.role() = 'customer' AND t.created_by = auth.uid())
       OR (auth.role() = 'agent' AND (t.assigned_to = auth.uid() OR t.assigned_to IS NULL))
     )
 )))
*/

-- INSERT policy: Upload files
/*
auth.role() IN ('agent', 'admin', 'customer')
*/

-- DELETE policy: Remove files
/*
auth.role() = 'admin'
*/

-- UPDATE policy: No updates allowed
/*
false
*/ 