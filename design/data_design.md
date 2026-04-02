# High-Level Design of Data Flow

- Store projects and posts in Postgres database to learn it, and cooler than 
SQLite and MySQL. Postgres is more modern, better for JSON, and easier tag 
parsing.
- Store simple links and ongoing progress in env variables to easily change
- No don't store in env variables, store in db and have an admin dashboard
- Vercel with Supabase for hosting

## Sidebar

### Env variables

Bottom of sidebar:

- github link
- linkedin link

Projects' progress:

In `stats` table.

`proj1: prog1`, parse values to determine if text or progress (e.g. 7%, 5/100)

unlimited projects (while there is a project number, or list all env variables proj_*)

- robo arm progress
- latest big question
- power clean 3RM

### Other sidebar interactions

In `settings` table

- Resume (bottom of sidebar): host on site for download
- Latest commit: get from github API
- Status

## Project Object (For You page)

In `projects` table. 

- Video (stored on site? or just use youtube link?)
- github link
- youtube link
- tech used, as comma-separated string, parse for icons

## Post Object (Explore page)

In `posts` table. 

- title
- content as markdown (if blog); should automatically create a new page for each
blog post
- thumbnail (for blog, otherwise try to use youtube thumbnail)
- link (for youtube vid)
- date
- tags (comma-separated)