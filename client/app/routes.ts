import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/landing.tsx"),
  route('/auth', 'routes/auth.tsx'),
  route('/dashboard', 'routes/home.tsx'),
  route('/upload', 'routes/upload.tsx'),
  route('/resume/:id', 'routes/resume.tsx'),
  route('/profile', 'routes/profile.tsx')
] satisfies RouteConfig;
