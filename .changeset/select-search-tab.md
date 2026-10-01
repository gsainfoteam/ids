---
'@gsainfoteam/ids-react': patch
---

Tab and Shift+Tab from a Select's search box move to the element after or before the trigger in
Firefox too. Firefox used to continue the Tab from inside the closing list, so focus came back to
the search box and `onBlur` fired several times.
