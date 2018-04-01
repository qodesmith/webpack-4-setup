# Webpack 4 Setup

### Goals:
* React
* SCSS
* generate `index.html` file
* minify / uglify JavaScript
* tree shaking
* remove unused CSS selectors
* use the new scoped Babel packages

## History

I originally set out to learn Webpack and all the mysteries that ly within. At that time, I found myself with a great working Webpack 3 file with all the above goals. Then Babel decided to move everything into a monorepo and scope their packages. Naturally, I needed to use these instead. _Then_, Webpack 4 dropped. Well, I won't be caught with my cheese out in the wind. And so the upgrade began.

## Findings

Webpack 4 didn't introduce a major workflow difference for me. The 0-config that they espouse really only applies smaller projects. Cool. Not what I was doing. There was one newly added line, the `mode` property. No big deal.

What _was_ problematic was all the errors the tools I was using were throwing because Webpacks API had changed in v4. Essentially, authors of loaders, plugins, etc., needed to do things unde the hood the new Webpack 4 way. I finally ironed all things out and have a working config file that suits my needs!
