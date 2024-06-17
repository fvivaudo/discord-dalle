
# Discord-Dalle

Typescript discord bot using tokens from microsoft binge creator to create a token pool you can generate in bulk from.


## Bot commands



| Command | Parameter     | Description                |
| :-------- | :------- | :------------------------- |
| `/add_cookie` | `_U Cookie` | registers _U cookie into linked db |
| `/tokens` | `None` | check every cookies and returns current number of available tokens |
| `/dalle` | `prompt`, `n` | Generates from `prompt`, using `n` cookies in parallel |


## How to Obtain Bing Cookie


- Navigate to Bing Image Creator: https://www.bing.com/images/create.
- Log in to your Bing account.
- Open the browser's developer tools:
- Press F12 or right-click on the page and select "Inspect" or "Inspect Element."
- In the Developer Tools, go to the "Application" tab.
- Under "Cookies," find and select https://www.bing.com.
- Look for the _U cookie.
- Copy the value of the _U cookie.


## Setup

See TScord documentation

