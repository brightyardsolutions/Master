// Page-wide settings shared by the layouts.

// The rules today's index.html puts in <noscript>: show everything that the script would otherwise animate in.
export const NO_SCRIPT_CSS = '.rv,.split .w>span{opacity:1!important;transform:none!important}#pre{display:none!important}.s3-step{position:static!important;opacity:1!important;transform:none!important}.s3-pin{height:auto!important}.s3-stage{display:none}';

// While the scripts were being ported (migration step 3) the pages loaded no JavaScript and used the rules above
// for everyone. They are ported (src/scripts), so the rules apply only inside <noscript>, as on the old site.
export const SCRIPTS_PORTED = true;
