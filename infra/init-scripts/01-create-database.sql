SELECT 'CREATE DATABASE portal_conselheiros' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'portal_conselheiros')\gexec

