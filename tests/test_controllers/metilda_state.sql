
INSERT INTO public.users (user_id, university, created_at, last_login, user_name) VALUES ('student@uw.edu','University of Washington','2020-12-28 01:40:35.141291','2020-12-28 01:41:12.714094','student');
INSERT INTO public.users (user_id, university, created_at, last_login, user_name) VALUES ('teacher@uw.edu','University of Washington','2020-12-28 01:40:35.141291','2020-12-28 01:41:12.714094','teacher');

INSERT INTO public.user_role (user_id, user_role, verified) VALUES ('student@uw.edu', 'Student', false);
INSERT INTO public.user_role (user_id, user_role, verified) VALUES ('teacher@uw.edu', 'Teacher', false);

INSERT INTO public.user_research_language (user_id, user_language) VALUES ('student@uw.edu', 'Blackfoot');
INSERT INTO public.user_research_language (user_id, user_language) VALUES ('teacher@uw.edu', 'Blackfoot');