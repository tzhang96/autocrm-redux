-- Function to handle new user creation and email confirmation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Handle new user creation
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.users (
      user_id,  -- Must match auth.users.id for joins
      email,
      name,
      role
    ) VALUES (
      NEW.id,
      NEW.email,
      CONCAT_WS(' ', 
        NULLIF(TRIM(NEW.raw_user_meta_data->>'first_name'), ''),
        NULLIF(TRIM(NEW.raw_user_meta_data->>'last_name'), '')
      ),
      'customer'
    );
    RETURN NEW;
  END IF;

  -- Handle email confirmation: first confirmed user becomes admin
  IF (TG_OP = 'UPDATE' AND OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL) THEN
    UPDATE public.users
    SET role = 'admin'
    WHERE user_id = NEW.id
    AND NOT EXISTS (
      SELECT 1 FROM public.users u
      JOIN auth.users au ON u.user_id = au.id
      WHERE u.role = 'admin' AND au.confirmed_at IS NOT NULL
    );
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for both new users and confirmations
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 