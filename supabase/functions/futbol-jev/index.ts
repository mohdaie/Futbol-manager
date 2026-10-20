import { handleJev } from './relay.mjs';

Deno.serve(req => handleJev(req));
