import { setGlobalDispatcher, Agent } from 'undici';

setGlobalDispatcher(
  new Agent({
    headersTimeout: 600_000, // 10 minutes
    bodyTimeout: 600_000,
  })
);