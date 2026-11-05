Subdomain Integration & Deployment Guide
Online Wills Advisor

Main Domain: https://onlinewillsadvisor.com
Main Website Technology: PHP
Main Website Hosting: Hostinger
Second Website Technology: Next.js
Objective: Integrate the existing Next.js website as a subdomain of the main domain.

1. Project Overview

We currently have two separate websites:

Main website: https://onlinewillsadvisor.com
Developed using PHP.
Hosted on Hostinger.
This website must remain fully functional without any disruption.
Second website:
Developed using Next.js.
Already exists and is hosted separately or will be deployed separately.
We want to connect it using a subdomain of our main domain.
Required Final Structure
Website	URL	Technology
Main website	https://onlinewillsadvisor.com	PHP
Next.js application	https://app.onlinewillsadvisor.com	Next.js

The Next.js website must open through the subdomain instead of its current external domain.

2. Main Objective

Configure the Next.js website to work at:

https://app.onlinewillsadvisor.com

Important requirements:

Do not change or replace the existing PHP website.
Do not move the main domain to another hosting provider.
Do not purchase another domain.
Do not modify the main website's existing DNS records unnecessarily.
Keep the PHP website running on its existing Hostinger hosting.
Connect only the app subdomain to the Next.js application.
Ensure both websites work independently.
3. DNS Configuration

The main domain's DNS is managed through Hostinger.

We need to create a DNS record for the new subdomain.

Recommended DNS Record

The exact record depends on the Next.js hosting provider.

Example: If Next.js is hosted on Vercel:

Type	Name	Value
CNAME	app	cname.vercel-dns.com

Note: Use the exact DNS target provided by the Next.js hosting provider. Do not assume the example target is correct for every deployment.

Hostinger DNS Steps
Log in to Hostinger.
Open hPanel.
Navigate to Domains.
Select onlinewillsadvisor.com.
Open DNS / Nameservers or DNS Zone Editor.
Add the required DNS record for app.
Save the DNS configuration.

Important: Do not delete or replace existing A, MX, TXT, or other DNS records used by the main PHP website, email, or domain verification.

4. Next.js Hosting Configuration

The developer must configure the Next.js project to recognize the new subdomain.

If Using Vercel
Log in to the Vercel dashboard.
Open the existing Next.js project.
Navigate to Settings.
Open Domains.
Add:

app.onlinewillsadvisor.com

Verify the domain.
Configure the DNS record in Hostinger according to Vercel's instructions.
Deploy the project if necessary.
If Using Hostinger VPS or Another Node.js Server

The developer must:

Configure the Next.js application to run on the server.
Configure the web server (Nginx or Apache) to route requests for app.onlinewillsadvisor.com to the Next.js application.
Configure the DNS record to point to the server's IP address.
Configure HTTPS using a valid SSL certificate.
Ensure the application restarts automatically after server reboot.

The exact deployment configuration depends on the hosting environment.

5. SSL / HTTPS Configuration

Both websites must support HTTPS.

Required URLs:

https://onlinewillsadvisor.com
https://app.onlinewillsadvisor.com

Requirements:

Install or activate a valid SSL certificate for the subdomain.
Ensure the browser does not display security warnings.
Redirect HTTP requests to HTTPS.
Verify that all Next.js assets and API requests load securely.

The existing main website's SSL configuration must remain unchanged.

6. Main PHP Website Navbar Integration

After the subdomain is configured successfully, update the existing navbar link in the PHP website.

Replace the old Next.js website URL with:

https://app.onlinewillsadvisor.com

Example:

HTML
<a href="https://app.onlinewillsadvisor.com">
    Access Application
</a>


The link should open the Next.js application directly.

If the existing navbar uses a different label, retain the current label unless a design change is requested.

7. Next.js Application Configuration

The developer must check the following:

Configure the application for the new production domain.
Update environment variables if they contain the old domain.
Update API base URLs if required.
Update authentication callback URLs if authentication is implemented.
Update CORS allowed origins if the application uses cross-origin API requests.
Update OAuth provider redirect URLs if applicable.
Verify image domains and external asset configurations.
Verify cookies and session handling.
Check any absolute URLs used for redirects or canonical metadata.
Environment Variable Example
env
NEXT_PUBLIC_APP_URL=https://app.onlinewillsadvisor.com


Use the variable only if the application needs it. Update server-side environment variables separately where applicable.

8. SEO and Domain Configuration

The Next.js application should have its own canonical URL.

Example:

text
https://app.onlinewillsadvisor.com


Requirements:

Update canonical metadata.
Update Open Graph URLs.
Update sitemap configuration if applicable.
Check robots.txt.
Avoid duplicate canonical URLs pointing to the previous domain.
Preserve the main PHP website's existing SEO configuration.

Do not automatically redirect the main domain to the subdomain.

9. Testing Checklist

After completing the configuration, verify the following:

Main PHP Website
https://onlinewillsadvisor.com opens successfully.
All existing PHP pages work.
Existing forms and functionality work.
Existing SSL certificate remains valid.
Existing email and DNS services remain functional.
Next.js Subdomain
https://app.onlinewillsadvisor.com opens successfully.
Next.js homepage loads correctly.
All application routes work.
API integrations work.
Authentication works, if applicable.
Images and static assets load correctly.
HTTPS works without browser warnings.
Refreshing nested routes does not return a 404 error.
Navigation
Main PHP website navbar points to the new subdomain.
Clicking the navbar link opens the Next.js website.
The main PHP website remains on the root domain.
10. Important Technical Considerations
Do not overwrite the root domain's DNS configuration.
Do not change the existing PHP website's hosting configuration.
Do not point the root domain to the Next.js server.
Only configure the app subdomain.
Make sure the Next.js deployment supports the chosen hosting environment.
Configure DNS and SSL before considering the integration complete.
Test the main website and subdomain independently.
11. Expected Final Architecture
text
                 onlinewillsadvisor.com
                          |
                 Main PHP Website
                          |
                     Hostinger
                          |
              ----------------------
              |                    |
              |                    |
       Main Website          Next.js App
              |                    |
              |                    |
onlinewillsadvisor.com   app.onlinewillsadvisor.com
                              |
                       Next.js Hosting


The main PHP website and Next.js application must remain separate deployments while sharing the same root domain.

12. Final Deliverables

The developer is expected to complete:

DNS configuration for app.onlinewillsadvisor.com.
Next.js hosting domain configuration.
SSL certificate configuration.
Next.js production domain and environment updates.
PHP navbar URL update.
Verification of both websites.
Confirmation that the existing PHP website has not been affected.

Final Expected Result:

Main website: https://onlinewillsadvisor.com
Next.js application: https://app.onlinewillsadvisor.com

Priority: Complete the subdomain integration without interrupting the existing production PHP website.