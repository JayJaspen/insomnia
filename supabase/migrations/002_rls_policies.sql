-- INSOMNIA.NU – RLS Policies
ALTER TABLE public.users             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friendships       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_images    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banned_words      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_archives    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_log          ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND role='admin' AND is_blocked=FALSE);
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS(SELECT 1 FROM public.users WHERE id=auth.uid() AND is_blocked=FALSE);
$$;

-- users
CREATE POLICY "users_select" ON public.users FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (auth.uid()=id) WITH CHECK (auth.uid()=id);
CREATE POLICY "admin_update_users" ON public.users FOR UPDATE USING (public.is_admin());

-- friendships
CREATE POLICY "friendships_select" ON public.friendships FOR SELECT USING (auth.uid()=requester_id OR auth.uid()=addressee_id OR public.is_admin());
CREATE POLICY "friendships_insert" ON public.friendships FOR INSERT WITH CHECK (auth.uid()=requester_id AND public.is_active_user());
CREATE POLICY "friendships_update" ON public.friendships FOR UPDATE USING (auth.uid()=addressee_id OR auth.uid()=requester_id OR public.is_admin());
CREATE POLICY "friendships_delete" ON public.friendships FOR DELETE USING (auth.uid()=requester_id OR auth.uid()=addressee_id OR public.is_admin());

-- chat_rooms
CREATE POLICY "chat_rooms_select" ON public.chat_rooms FOR SELECT USING (
  public.is_admin() OR type='group'
  OR EXISTS(SELECT 1 FROM public.chat_room_members WHERE room_id=chat_rooms.id AND user_id=auth.uid())
);
CREATE POLICY "chat_rooms_insert" ON public.chat_rooms FOR INSERT WITH CHECK (public.is_active_user());
CREATE POLICY "chat_rooms_delete" ON public.chat_rooms FOR DELETE USING (created_by=auth.uid() OR public.is_admin());

-- chat_room_members
CREATE POLICY "members_select" ON public.chat_room_members FOR SELECT USING (
  public.is_admin() OR user_id=auth.uid()
  OR EXISTS(SELECT 1 FROM public.chat_rooms cr WHERE cr.id=room_id AND cr.type='group')
);
CREATE POLICY "members_insert" ON public.chat_room_members FOR INSERT WITH CHECK (
  public.is_active_user() AND (
    user_id=auth.uid()
    OR EXISTS(SELECT 1 FROM public.chat_rooms cr WHERE cr.id=room_id AND cr.created_by=auth.uid() AND cr.type='private')
  )
);
CREATE POLICY "members_delete" ON public.chat_room_members FOR DELETE USING (user_id=auth.uid() OR public.is_admin());

-- messages
CREATE POLICY "messages_select" ON public.messages FOR SELECT USING (
  public.is_admin()
  OR EXISTS(SELECT 1 FROM public.chat_room_members WHERE room_id=messages.room_id AND user_id=auth.uid())
  OR EXISTS(SELECT 1 FROM public.chat_rooms cr WHERE cr.id=messages.room_id AND cr.type='group')
);
CREATE POLICY "messages_insert" ON public.messages FOR INSERT WITH CHECK (
  auth.uid()=user_id AND public.is_active_user()
  AND EXISTS(SELECT 1 FROM public.chat_room_members WHERE room_id=messages.room_id AND user_id=auth.uid())
);
CREATE POLICY "messages_delete" ON public.messages FOR DELETE USING (user_id=auth.uid() OR public.is_admin());

-- message_images, reports, banned_words, daily_archives, mood_log
CREATE POLICY "images_select" ON public.message_images FOR SELECT USING (public.is_admin() OR user_id=auth.uid());
CREATE POLICY "images_insert" ON public.message_images FOR INSERT WITH CHECK (auth.uid()=user_id AND public.is_active_user());
CREATE POLICY "images_delete" ON public.message_images FOR DELETE USING (user_id=auth.uid() OR public.is_admin());

CREATE POLICY "reports_select" ON public.reports FOR SELECT USING (public.is_admin() OR reporter_id=auth.uid());
CREATE POLICY "reports_insert" ON public.reports FOR INSERT WITH CHECK (auth.uid()=reporter_id AND public.is_active_user());
CREATE POLICY "reports_update" ON public.reports FOR UPDATE USING (public.is_admin());
CREATE POLICY "reports_delete" ON public.reports FOR DELETE USING (public.is_admin());

CREATE POLICY "banned_words_select" ON public.banned_words FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "banned_words_admin" ON public.banned_words FOR ALL USING (public.is_admin());

CREATE POLICY "archives_all" ON public.daily_archives FOR ALL USING (public.is_admin());

CREATE POLICY "mood_select" ON public.mood_log FOR SELECT USING (user_id=auth.uid() OR public.is_admin());
CREATE POLICY "mood_insert" ON public.mood_log FOR INSERT WITH CHECK (auth.uid()=user_id);
