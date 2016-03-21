CREATE TABLE tasks (id SERIAL PRIMARY KEY, task varchar(80) NOT NULL,
description text NOT NULL, completed BOOLEAN DEFAULT false);
