DROP TABLE IF EXISTS location;

CREATE TABLE locationTwo (
    id SERIAL PRIMARY KEY,
    search_query VARCHAR(255),
    formatted_query VARCHAR(255),
    latitude DECIMAL(12, 10),
    longitude DECIMAL(13, 10)
)