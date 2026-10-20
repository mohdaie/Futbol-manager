# Futbol Manager personal Jev relay

The game on GitHub Pages sends requests to this function, which forwards them
to TypeSafe's fixed `/v1/systemone` endpoint and adds browser CORS headers.

Each caller supplies their own Jev key in the Authorization header. The relay
does not save or log keys, use a shared funded key, or access a database. Jev
validates the key. `verify_jwt = false` lets that Jev key reach the handler
instead of being rejected as an invalid Supabase JWT. This is a personal-key
setup, not a shared AI service for all game players.

Deploy `futbol-jev` to the Supabase project selected by the owner. No secret
needs to be copied into a repository or this chat.

After deployment, in More → Admin → Jev AI choose **Personal relay**, retain
your Jev key, and use this base URL:

`https://<project-ref>.supabase.co/functions/v1/futbol-jev`

The game appends `/v1/systemone`. The relay permits only the game's GitHub
Pages origin, POST/OPTIONS, and small Jev decision requests. It is not a
general-purpose URL proxy. Test with the key already saved on your phone.
