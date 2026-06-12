# To-Do List

A simple, minimal to-do list web app built with plain HTML, CSS, and JavaScript.

## Features

- Sign up / sign in with username and password
- Per-user task lists
- Add tasks
- Mark tasks as done
- Delete tasks
- Tasks persist in the browser via localStorage

## Usage

Open `index.html` in a browser. No build step or dependencies required.

## Note on authentication

Auth is demo-grade and fully client-side: accounts are stored in the
browser's localStorage (passwords salted and hashed with SHA-256 via the
Web Crypto API). There is no server, so accounts exist only in the browser
where they were created. Do not use real passwords.
