OSKAR BRANCH

How to run my pronect. Clone it then run npm install. Then npm run dev. Next step will first check whether you are logged in on convex. If not follow the propmts, it will ask you to open brwoser and just loign with github. If you are logged in then there are 2 options. Create new project or choose existing project. I wanna dd you guys to the team so that If I add you to the team and you choose choose exisitng then our project should be there. you can also create your own as it makes no difference for local dev. It only matters for deployment. If you create a new one then now you have a convex project. Step 5 applies only if you made a new project. With the current setup you should open the browser and you should see an app but there will be infor saying user not found. Thats because we don't have auth working so I hardocded a test user for all the queries. So to get app working with one yser. Open convex website and choose the project you selcted. On the left you should se a menu, saying health , data functions... Choose data, then sleect users table. On the right side click add. then in the json edit userid to be "test_user" and click save. Now your local dev app should work. If we get acces to auth this will be changed.

Deployment Me and Luis had issues deplying, I think each convex project only likes to be deployed once and if you delete that deployment you have to start a new projet If you want to deploy your version of the code for youself, use Vercel. Cloudflare keeps messing up. To deploy first when you are ready in the terminal write "npx convex deploy" and press y. Tge last line will be an url. you can get the same url from convex website of your project. When you go to vercel and deploy from github in the section for enviromnemt variables write CONVEX_URL = the link. Any time you change schema file for database it will update your dev verison but deploy version will only be updated if you do the npx convex deploy. It pushes changes.

How the project is strucytres. All files mestioned will have commments 
schema.ts - the tables schema for convex 
queries.ts - the file with queries used - queries are used for table lookups and mutations are used for table modifications
src/components/component name - react componets
src/pages - we add components to pages

No more convex specific files src/lib/convex.tsx - this file creates like something that allows convex to run with astro, it creates a convex client using your credentials. any time you make a react component that will need acces to the database you need to import withConvexProvider from this file and surround your component with that function call. See any of my components for an example.

I did this by modifying offical convex astro template so this is like the valid way of using convex and astro. Any other way might not work.

IF YOU MAKE A COMPONENT THAT NEEDS DB ACCES SURROUND IT WITH WITHCONVEXPROVIDER

It's really unfrutnate but I got a deployed version at https://food-coop-sej7.vercel.app/

if we dont manage to deploy another way, any changes from our current repo I will just add to my deployed version manually.

Also the template uses some tailwing CSS so like for component you add classname and some css property and it works
