
INSERT INTO public.users (user_id, university, created_at, last_login, user_name) VALUES ('student@uw.edu','University of Washington','2020-12-28 01:40:35.141291','2020-12-28 01:41:12.714094','student');
INSERT INTO public.users (user_id, university, created_at, last_login, user_name) VALUES ('teacher@uw.edu','University of Washington','2020-12-28 01:40:35.141291','2020-12-28 01:41:12.714094','teacher');

INSERT INTO public.user_role (user_id, user_role, verified) VALUES ('student@uw.edu', 'Student', false);
INSERT INTO public.user_role (user_id, user_role, verified) VALUES ('teacher@uw.edu', 'Teacher', false);

INSERT INTO public.user_research_language (user_id, user_language) VALUES ('student@uw.edu', 'Blackfoot');
INSERT INTO public.user_research_language (user_id, user_language) VALUES ('teacher@uw.edu', 'Blackfoot');

INSERT INTO public.audio (audio_id, file_name, file_path, file_size, file_type, created_at, updated_at, user_id) VALUES
(260, 'test.wav', 'student@uw.edu/Recordings/test.wav/03-06-2020_06_50_25__test.wav', 311340, 'Recording', '2020-03-07 02:50:27.052024', '2020-03-07 02:50:27.052024', 'student@uw.edu');

INSERT INTO public.eaf (eaf_id, eaf_file_name, eaf_file_path, audio_id, generated_at, updated_at) VALUES
(841,'testeaf_test.eaf','student@uw.edu/Eafs/06-01-2020_08_57_31_testeaf_test.eaf',260,'2020-06-01 14:57:31.384778','2020-06-01 14:57:31.384778');

INSERT INTO public.analysis (analysis_id, analysis_file_name, analysis_file_path, audio_id, generated_at, updated_at) VALUES 
(101,'EOP_pannii.json','student@uw.edu/Analyses/02-21-2020_09_12_36_EOP_pannii.json',260,'2020-02-21 16:12:36.589415','020-02-21 16:12:36.589415');