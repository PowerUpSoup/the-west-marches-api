CREATE TABLE notices (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    message TEXT NOT NULL,
    status TEXT NOT NULL
);