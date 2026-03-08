-- INSOMNIA.NU – Storage Buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('chat-images','chat-images',false,10485760,ARRAY['image/jpeg','image/png','image/gif','image/webp'])
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('archives','archives',false,524288000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars','avatars',true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "chat_images_insert" ON storage.objects FOR INSERT
WITH CHECK (bucket_id='chat-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "chat_images_select" ON storage.objects FOR SELECT
USING (bucket_id='chat-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "archives_admin" ON storage.objects FOR ALL
USING (bucket_id='archives' AND EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role='admin'));

CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
USING (bucket_id='avatars');
