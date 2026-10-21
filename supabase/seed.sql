-- Seed de 20 perfiles (requiere auth.users)
do $$
declare
  i int;
  uid uuid;
begin
  for i in 1..20 loop
    uid := gen_random_uuid();
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
    values (
      uid,
      'perfil' || i || '@seed.citaclara.app',
      crypt('seedpassword', gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}',
      '{}', false, 'authenticated'
    ) on conflict do nothing;

    insert into public.profiles (id, display_name, bio, birth_date, country, photo_url)
    values (
      uid,
      'Perfil ' || i,
      'Bio de prueba del perfil ' || i,
      ('1990-01-01'::date + (i * 100)),
      case when i % 3 = 0 then 'US' when i % 3 = 1 then 'ES' else 'MX' end,
      case when i <= 5 then 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' else null end
    ) on conflict do nothing;
  end loop;
end $$;
