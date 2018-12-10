---
title: "Visual Studio Code"
category: "kb"
---

To fix SSL ftp issue with ftp-sync add-on.

In Linux:

	export NODE_TLS_REJECT_UNAUTHORIZED="0"
  
In Windows:

	setx NODE_TLS_REJECT_UNAUTHORIZED 0
