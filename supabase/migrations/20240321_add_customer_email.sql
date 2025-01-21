-- Add customer_email column as nullable first
ALTER TABLE tickets
ADD COLUMN customer_email TEXT;

-- Create index for customer_email lookups
CREATE INDEX idx_tickets_customer_email ON tickets(customer_email);

-- Update existing tickets to set customer_email from the creator's email
UPDATE tickets t
SET customer_email = (
    SELECT email 
    FROM auth.users u 
    WHERE t.created_by = u.id
);

-- Now make the column NOT NULL and add the validation constraint
ALTER TABLE tickets
ALTER COLUMN customer_email SET NOT NULL,
ADD CONSTRAINT customer_email_valid 
    CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'); 