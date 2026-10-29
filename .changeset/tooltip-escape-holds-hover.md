---
"@gsainfoteam/ids-react": patch
---

A Tooltip closed with Escape no longer reopens from a hover that arrives while the pointer is
still on its trigger, such as the late `mouseenter` WebKit sends after the layout under the
cursor changes. Moving the pointer off the trigger lets hover open it again.
