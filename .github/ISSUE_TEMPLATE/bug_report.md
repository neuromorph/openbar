---
name: Bug report
about: Create a bug report to help us improve
title: "[BUG]: Bug title"
labels: ''
assignees: ''

---

**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
 Steps to reproduce the behavior:

**Relevant  Specs:**
 - Open Bar version: 
 - Gnome version: 
 - OS/Distribution:
 - Other installed extensions if interference is expected [Optional]: 

**Screenshots**
Helpful to see if there is a visual bug or if your Top Bar is modified by another extension that may be causing an interference.

**Error Stack Trace**
If you are getting an error (showing in the Extension Manager for e.g.), please run the following command in a terminal and then Enable the extension. If the error is preventing the extension from enabling then just remove and install the extension again while the command is running. If there is no error during enable then keep the command running and try disabling the extension. At some point the same error will show up in the terminal but it will also have a trace log. Please share that here so we can debug the issue.
`SHELL_DEBUG=all journalctl /usr/bin/{gjs,gnome-shell} -fo cat`
