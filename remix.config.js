/** @type {import('@remix-run/dev').AppConfig} */
export default {
  tailwind: true,
  postcss: true,
  browserNodeBuiltinsPolyfill: { modules: { events: true } },
};
