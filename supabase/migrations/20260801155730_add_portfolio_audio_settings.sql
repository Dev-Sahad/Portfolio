alter table public.site_settings
  add column if not exists spotify_playlist_url text,
  add column if not exists intro_music_url text;

update public.site_settings
set spotify_playlist_url = coalesce(
  nullif(spotify_playlist_url, ''),
  'https://open.spotify.com/embed/playlist/37i9dQZF1DWZeKCadgRdKQ?utm_source=generator&theme=0'
)
where id = 1;
