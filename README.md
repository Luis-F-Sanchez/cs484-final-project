    =============
    | FOOD COOP |
    =============

    HOW TO RUN (for devs)
    =====================
        1)  Clone the repository on GitHub and open in your code editor
        2)  Run :
            (a) :   npm install
            (b) :   npm run dev
        3)  Now you will be shown one of two things (by convex) :
            (1)   if you are asked to login/create an account :
                -   if you have previously created an account :
                    +   follow the link to login as you did before
                -   if you have not previously created an account : 
                    +   follow the link, register with GitHub
            (2)   if you are not asked to login/create an account :
                -   if you have previously created an account :
                    +   you should already be logged in and the project should be running (hopefully?)
                -   if you have not previously created an account :
                    +   this likely means that you are being dropped into a local convex deployment, so it never prompts the login. To fix this, delete the .env.local file and rerun the server, backtrace to the start of step 3 and evaluate your current situation


    THINGS THAT STILL NEED TO BE WORKED ON
    ======================================
        -   a contact administrator tab for users; when the message is sent, it gets delivered to the admin tab
        -   a most requested items tab for users where they can vote on items that the admin adds from their tab of requests
        -   QR code scanning tab, this is a stretch, but if we could at least get this started that would be nice
        


    THESE ARE ALL OF THE FILES ALTERED UPON MY (Petr) PUSH TO GITHUB:
    ======================================================================================
        -   convex/queries.ts: all convex backend functions; auth, user balance updates, inventory mutations, purchase processing, and queries for the current user and their purchases

        -   convex/schema.ts: defines the convex tables and fields (comments, inventory, users, sessions, and purchases)

        -   src/components/AuthPanel.tsx: the username based auth UI that logs in/registers users via convex mutations, saves/clears the session token, and shows status/errors

        -   src/components/AuthShell.tsx: wraps AuthPanel with the session token hook, handling load/save/clear of the token so pages can drop in a ready to use auth UI

        -   src/components/AuthStatus.tsx: navbar badge in the top right of the screen that reads the shared token, fetches the current user via users_me, and shows their username/balance (or blanked when not logged in)

        -   src/components/ContributeForm.tsx: token protected form to add an item to inventory and credit the contributors balance, with validation and status/error messages

        -   src/components/ContributeShell.tsx: pulls the session token via useSessionToken and renders ContributeForm with that token, so the page doesn't have to handle token wiring

        -   src/components/HomeShell.tsx: reads the session token and renders the home page content (UserBalance + Store) with that token that is passed through

        -   src/components/PurchaseHistory.tsx: token based component that fetches and lists the current user's purchases (loading/empty states included) using purchases_listByUser

        - src/components/Store.tsx: token aware store UI that lists inventory, lets you select quantities, and calls processPurchase to validate stock/balance, deduct inventory, and record purchases

        - src/components/UserBalance.tsx: token based balance display component that fetches the current user via users_me and shows username and wallet balance, with logged out and loading/error states

        -   src/components/WalletShell.tsx: reads the session token and renders the wallet page content (UserBalance and PurchaseHistory) with that token passed through

        -   src/layouts/Layout.astro: the shared layout with the navbar and the top right auth status badge; wraps all page content

        -   src/lib/convex.tsx: creates the convex client and provides withConvexProvider, a wrapper to give components access to convex react. hooks when used in Astro/React

        -   src/lib/useSessionToken.ts: react hook that reads the session token from localStorage, keeps it in state, and provides saveToken/clearToken helpers to sync state and storage

        -   src/pages/auth.astro: page that wraps content in the shared layout and mounts AuthShell (login/register/logout UI) on /auth

        -   src/pages/contribute.astro: contribution page that uses the shared layout and mounts ContributeShell (token aware contribution form) on /contribute

        -   src/pages/index.astro: home page using the shared layout and mounting HomeShell (token aware balance + store) on /

        - src/pages/wallet.astro: wallet page using the shared layout and mounting WalletShell (token aware balance + purchase history) on /wallet

        - src/pages/admin.astro: administration page using the shared layout and mounting AdminShell (token aware account type) on /admin

        - src/components/AdminShell: token-aware admin dashboard that lists pending contributions and provided Approve/Deny actions



========= BELOW IS OSKAR'S ORIGINAL READ ME (with some spelling corrections) ==========

How to run my project. Clone it then run npm install. Then npm run dev. Next step will first check whether you are logged in on convex. If not follow the prompts, it will ask you to open browser and just login with github. If you are logged in then there are 2 options. Create new project or choose existing project. I wanna dd you guys to the team so that If I add you to the team and you choose choose existing then our project should be there. you can also create your own as it makes no difference for local dev. It only matters for deployment. If you create a new one then now you have a convex project. Step 5 applies only if you made a new project. With the current setup you should open the browser and you should see an app but there will be in for saying user not found. Thats because we don't have auth working so I hard coded a test user for all the queries. So to get app working with one yser. Open convex website and choose the project you selected. On the left you should se a menu, saying health , data functions... Choose data, then select users table. On the right side click add. then in the json edit userid to be "test_user" and click save. Now your local dev app should work. If we get access to auth this will be changed.

Deployment Me and Luis had issues deploying, I think each convex project only likes to be deployed once and if you delete that deployment you have to start a new project If you want to deploy your version of the code for yourself, use Vercel. Cloudflare keeps messing up. To deploy first when you are ready in the terminal write "npx convex deploy" and press y. Tge last line will be an url. you can get the same url from convex website of your project. When you go to vercel and deploy from github in the section for environment variables write CONVEX_URL = the link. Any time you change schema file for database it will update your dev version but deploy version will only be updated if you do the npx convex deploy. It pushes changes.

How the project is structured. All files mentioned will have comments 

schema.ts - the tables schema for convex 

queries.ts - the file with queries used - queries are used for table lookups and mutations are used for table modifications

src/components/component name - react components

src/pages - we add components to pages

No more convex specific files src/lib/convex.tsx - this file creates like something that allows convex to run with astro, it creates a convex client using your credentials. any time you make a react component that will need access to the database you need to import withConvexProvider from this file and surround your component with that function call. See any of my components for an example.

I did this by modifying official convex astro template so this is like the valid way of using convex and astro. Any other way might not work.

IF YOU MAKE A COMPONENT THAT NEEDS DB ACCESS SURROUND IT WITH WITHCONVEXPROVIDER

It's really unfortunate but I got a deployed version at https://food-coop-sej7.vercel.app/

if we don't manage to deploy another way, any changes from our current repo I will just add to my deployed version manually.

Also the template uses some tailwind CSS so like for component you add classname and some css property and it works
