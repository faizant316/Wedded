-- search_vendors runs as its caller, and 20260929205924_typo_tolerant_search
-- gave its two private helpers only to anon and authenticated, so server
-- tools using the service role (scripts, Edge Functions) got "permission
-- denied for schema private". Give them the same access.

grant usage on schema private to service_role;
grant execute on function private.search_words, private.words_match_loosely to service_role;
